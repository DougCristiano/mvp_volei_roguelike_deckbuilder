// ─── combat.js — Combat resolution system ───────────────────────────────────
// Owner: Combat agent. All rally resolution: defense quality, blocks, attack vs defense.
// Depends on: data.js (DEFENSE_QUALITY_RANGES), state.js (G, log, startPoint),
//             deck.js (clearHand, drawPhaseOptions), render.js (render, showPointResult, showEnd),
//             audio.js (sounds), ai.js (aiTurn), multiplayer.js (sendData)

// Returns the quality tier object for a given gap (defPow - attackPow).
// Reads DEFENSE_QUALITY_RANGES from global scope (data.js must load first).
function getDefenseQuality(gap) {
  for (const [qualityKey, range] of Object.entries(DEFENSE_QUALITY_RANGES)) {
    if (gap >= range.min && gap <= range.max) {
      return { quality: qualityKey, ...range };
    }
  }
  return { quality: 'ataque_dominante', ...DEFENSE_QUALITY_RANGES['ataque_dominante'] };
}

// Checks if the player has 0 energy during an active rally and auto-sends a freeball.
function checkFreeball() {
  if (G.energy === 0 && !G.defWindow && G.phase !== 'service' && G.possession === 'player') {
    log(`⚠ Energia zerada! Bola livre para ${G.gameMode === 'multiplayer' ? 'o Oponente' : 'a IA'}.`);
    G.locked = true;
    setTimeout(() => { G.locked = false; passBall(true); }, 600);
  }
}

// Passes possession to opponent. isServe=true skips the energy recovery log.
function passBall(forced, isServe = false) {
  if (G.pointDone) return;
  if (!isServe) {
    log(forced ? '↩ Bola livre enviada (+2⚡).' : '↩ Você passou a bola (+2⚡).');
    G.energy = Math.min(G.energy + 2, G.maxEnergy);
    if (G.gameMode === 'multiplayer') sendData({ type: 'PASS_BALL', forced });
  }
  clearHand();
  G.possession = 'ai';
  G.locked = true;
  render();
  if (G.gameMode !== 'multiplayer') setTimeout(() => aiTurn(), 900);
}

// Block timer tick — called every 100ms by setInterval.
function tickBlockTimer() {
  if (!G.blockWindow || G.pointDone) { clearInterval(G.blockInterval); return; }
  G.blockTimerVal -= 0.1;
  if (G.blockTimerVal <= 0) {
    G.blockTimerVal = 0;
    clearInterval(G.blockInterval);
    log('⏱ Tempo esgotado! Você optou por não bloquear.');
    resolveBlock();
  }
  const bar   = document.getElementById('timer-bar');
  const count = document.getElementById('timer-count');
  if (bar)   bar.style.width = (G.blockTimerVal / 15.0 * 100) + '%';
  if (count) count.textContent = Math.ceil(G.blockTimerVal);
}

// Defense timer tick — called every 100ms by setInterval.
function tickDefTimer() {
  if (!G.defWindow || G.pointDone) { clearInterval(G.defInterval); return; }
  G.defTimerVal -= 0.1;
  if (G.defTimerVal <= 0) {
    G.defTimerVal = 0;
    clearInterval(G.defInterval);
    log('⏱ Tempo esgotado! Você não conseguiu defender a tempo.');
    autoResolve();
  }
  const bar   = document.getElementById('timer-bar');
  const count = document.getElementById('timer-count');
  if (bar)   bar.style.width = (G.defTimerVal / 15.0 * 100) + '%';
  if (count) count.textContent = Math.ceil(G.defTimerVal);
}

// Opens the defense window with a 15-second timer.
function startDefenseWindow(isServe = false) {
  G.defWindow = true;
  G.blockWindow = false;
  G.phase = 'defense';
  G.isDefendingServe = isServe;
  log(isServe
    ? `🛡 Selecione sua recepção contra o saque (Poder ${G.aiAtkPow}).`
    : `🛡 Selecione sua defesa contra o ataque (Poder ${G.aiAtkPow}).`);
  drawPhaseOptions();
  G.defTimerVal = 15.0;
  const bar = document.getElementById('timer-bar');
  if (bar) bar.style.width = '100%';
  clearInterval(G.defInterval);
  G.defInterval = setInterval(tickDefTimer, 100);
  render();
}

// Resolves the player's selected block cards against the AI attack.
function resolveBlock() {
  if (!G.blockWindow || G.pointDone) return;
  clearInterval(G.blockInterval);
  const idx  = G.selected[0];
  const card = G.hand[idx];
  G.blockWindow = false;

  if (!card) {
    log('🏃 Você deixou o bloqueio passar. Preparando defesa...');
    clearHand();
    if (G.gameMode === 'multiplayer') sendData({ type: 'BLOCK_SKIPPED' });
    startDefenseWindow();
    return;
  }

  sounds.block();
  // A Muralha passive: first block per point costs 0 energy
  let blockCost = card.cost;
  if (G.campaignTeam === 'muralha' && !G.freeBlockUsed) {
    blockCost = 0;
    G.freeBlockUsed = true;
    log('🧱 Bônus A Muralha: primeiro bloqueio grátis!');
  }
  G.energy -= blockCost;
  clearHand();

  const roll    = Math.random();
  const oppName = G.gameMode === 'multiplayer' ? 'adversário' : 'IA';

  if (roll < 0.20) {
    log(`🧱 O bloqueio ${card.name} parou a bola na quadra do ${oppName}! Ponto direto!`);
    G.pPts++; G.nextServer = 'player';
    if (G.gameMode === 'multiplayer') sendData({ type: 'BLOCK_RESULT', cardId: card.id, resultType: 'POINT_DIRECT' });
    endPoint('win', 'Ponto de bloqueio!');
  } else if (roll < 0.40) {
    log(`❌ O bloqueio ${card.name} encostou na bola, mas ela desviou para fora! Ponto perdido.`);
    G.aPts++; G.nextServer = 'ai';
    if (G.gameMode === 'multiplayer') sendData({ type: 'BLOCK_RESULT', cardId: card.id, resultType: 'OUT' });
    endPoint('loss', 'Bloqueio para fora.');
  } else if (roll < 0.70) {
    G.aiAtkPow = Math.max(1, Math.floor(G.aiAtkPow / 2));
    log(`🧤 O bloqueio ${card.name} tocou na bola e amorteceu o impacto! (Poder reduzido para ${G.aiAtkPow})`);
    if (G.gameMode === 'multiplayer') sendData({ type: 'BLOCK_RESULT', cardId: card.id, resultType: 'SOFTEN' });
    startDefenseWindow();
  } else {
    log(`🔁 O bloqueio ${card.name} encostou na bola, mas o ${oppName} conseguiu recuperar! O rally continua!`);
    if (G.gameMode === 'multiplayer') {
      sendData({ type: 'BLOCK_RESULT', cardId: card.id, resultType: 'CONTINUE' });
      G.possession = 'ai'; G.locked = true;
    } else {
      setTimeout(() => aiTurn(), 1000);
    }
  }
  render();
}

// Resolves the player's selected defense cards using the gap-based quality system.
function resolveDefense() {
  if (!G.defWindow || G.pointDone) return;
  clearInterval(G.defInterval);

  let defPow = 0;
  [...G.selected].sort((a, b) => b - a).forEach(idx => {
    const c = G.hand[idx];
    if (c && c.phases.includes('defense') && c.cost <= G.energy) {
      defPow += c.power;
      G.energy -= c.cost;
      log(`🛡 ${c.name} (poder ${c.power})`);
    }
  });

  if (G.selected.length > 0) G.comboIdx = 1; // defense counts as 1st combo touch

  clearHand();
  G.defWindow = false;
  const oppName = G.gameMode === 'multiplayer' ? 'Oponente' : 'IA';

  const gap     = defPow - G.aiAtkPow;
  const quality = getDefenseQuality(gap);

  log(`⚖ Gap: ${gap} (${quality.emoji} ${quality.desc})`);

  // A Fortaleza passive: +5% defense success rate on all tiers
  let successRate = quality.successRate;
  if (G.campaignTeam === 'fortaleza') {
    successRate = Math.min(1.0, successRate + 0.05);
    if (successRate > quality.successRate) log('🛡️ Bônus A Fortaleza: +5% de defesa!');
  }

  if (Math.random() < successRate) {
    log(`${quality.emoji} Defesa ${quality.desc}! A bola está sob seu controle.`);
    G.nextAttackBonus = quality.nextAtkBonus;
    G.defenseQuality  = quality;
    if (G.gameMode === 'multiplayer') sendData({ type: 'DEFENSE_SUCCESS', defPow, quality: quality.quality, gap });
    G.possession = 'player';
    G.phase      = 'setting';
    G.locked     = false;
    drawPhaseOptions();
    render();
  } else {
    log(`${quality.emoji} Defesa ${quality.desc}! Ponto para o ${oppName}.`);
    G.aPts++;
    G.nextServer = 'ai';
    if (G.gameMode === 'multiplayer') sendData({ type: 'DEFENSE_FAIL', defPow, quality: quality.quality, gap });
    endPoint('loss', `Defesa insuficiente (Gap: ${gap})`);
  }
}

// Defense timer timeout — resolves with 0 defense power.
function autoResolve() {
  if (!G.defWindow || G.pointDone) return;
  clearInterval(G.defInterval);
  G.defWindow = false;
  clearHand();
  log('⏱ Tempo esgotado! Defesa 0.');
  G.aPts++;
  G.nextServer = 'ai';
  if (G.gameMode === 'multiplayer') sendData({ type: 'DEFENSE_FAIL', defPow: 0, quality: 'ataque_dominante' });
  endPoint('loss', 'O ataque/saque superou a defesa.');
}

// Resolves a player attack against the AI defense (or sends ATTACK packet in multiplayer).
function resolvePlayerAttack(pow, attackCard) {
  if (G.pointDone) return;

  if (G.gameMode === 'multiplayer') {
    sendData({ type: 'ATTACK', power: pow, cardId: attackCard.id });
    log('Esperando ação (Bloqueio/Defesa) do Oponente...');
    G.possession = 'ai';
    G.locked     = true;
    render();
    return;
  }

  // AI picks the best defense card it can afford
  let aiDef = 0;
  let aiDefCards = [];
  const possibleDef = CARDS_DB
    .filter(c => c.phases.includes('defense') && c.cost <= G.aiEnergy)
    .sort((a, b) => b.power - a.power);

  if (possibleDef.length > 0) {
    const card = possibleDef[0];
    aiDef = card.power;
    G.aiEnergy -= card.cost;
    aiDefCards.push(card.name);
    G.aiJustDefended = true;
  }
  if (aiDefCards.length > 0) log(`🛡️ IA usou para defender: ${aiDefCards.join(', ')}`);

  aiDef = Math.max(0, aiDef - G.aiDefMinus);
  G.aiDefMinus = 0;

  const gap     = aiDef - pow;
  const quality = getDefenseQuality(gap);

  log(`⚖ Seu ${attackCard.name} (${pow}) vs Defesa IA (${aiDef}) | Gap: ${gap}`);
  log(`${quality.emoji} Defesa ${quality.desc}`);

  if (Math.random() < quality.successRate) {
    G.aiNextAtkBonus = quality.nextAtkBonus;
    log(`${quality.emoji} IA defendeu! A posse passou.`);
    G.possession = 'ai';
    G.locked     = false;
    render();
    setTimeout(() => aiTurn(), 900);
  } else {
    log('✅ Ponto seu! IA não conseguiu defender.');
    G.pPts++;
    G.nextServer = 'player';
    endPoint('win', `Ataque superou defesa (Gap: ${gap})`);
  }
}

// Marks a point as done and delegates to checkSet for scoring.
function endPoint(result, desc) {
  if (G.pointDone) return;
  G.pointDone = true;
  G.locked    = true;
  clearInterval(G.blockInterval);
  clearInterval(G.defInterval);
  if (result === 'win') sounds.pointScored(); else sounds.error();
  checkSet(result, desc);
}

// Pure win-condition checker — testable without DOM or G.
// Returns 'player', 'ai', or null (game still on).
function _checkWinCondition(pPts, aPts, WIN = 5) {
  if (pPts >= WIN && pPts - aPts >= 2) return 'player';
  if (aPts >= WIN && aPts - pPts >= 2) return 'ai';
  return null;
}

// Handles set/match scoring after a point ends.
function checkSet(result, desc) {
  const WIN_PTS  = 5;
  // Campaign is best-of-3 (needs 2 sets); regular AI is best-of-1
  const WIN_SETS = G.gameMode === 'campaign' ? 2 : 1;
  const oppNameCap = G.gameMode === 'multiplayer' ? 'Oponente' : 'IA';

  if (G.gameMode === 'multiplayer' && !G.isNetworkReceiver) {
    const myRole  = G.isHost ? 'host'   : 'client';
    const oppRole = G.isHost ? 'client' : 'host';
    sendData({
      type: 'POINT_END',
      winnerRole:     result === 'win' ? myRole : oppRole,
      hostPts:        G.isHost ? G.pPts  : G.aPts,
      clientPts:      G.isHost ? G.aPts  : G.pPts,
      hostSets:       G.isHost ? G.pSets : G.aSets,
      clientSets:     G.isHost ? G.aSets : G.pSets,
      nextServerRole: G.nextServer === 'player' ? myRole : oppRole,
      reason:         desc || '',
    });
  }

  if (G.pPts >= WIN_PTS && G.pPts - G.aPts >= 2) {
    G.pSets++; G.pPts = 0; G.aPts = 0;
    if (G.pSets >= WIN_SETS) {
      render();
      if (G.gameMode === 'campaign' && G.campaignTeam) {
        showRewards(selectRewardCards(3));
      } else {
        showEnd(true);
      }
      return;
    }
    log(`🏆 Set para você! ${G.pSets}×${G.aSets}`);
    render();
    showPointResult('win', '🏆 Set para você!', `Você venceu o set. Placar: ${G.pSets}×${G.aSets}`);
    return;
  }
  if (G.aPts >= WIN_PTS && G.aPts - G.pPts >= 2) {
    G.aSets++; G.pPts = 0; G.aPts = 0;
    if (G.aSets >= WIN_SETS) { render(); showEnd(false); return; }
    render();
    showPointResult('loss', `💔 Set para ${oppNameCap}`, `${oppNameCap} venceu o set. Placar: ${G.pSets}×${G.aSets}`);
    return;
  }

  render();
  if (result === 'win') showPointResult('win', '🎉 Ponto seu!', desc || 'Você venceu o rally.');
  else showPointResult('loss', `❌ Ponto d${G.gameMode === 'multiplayer' ? 'o Oponente' : 'a IA'}`, desc || `${oppNameCap} venceu o rally.`);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getDefenseQuality, _checkWinCondition };
}
