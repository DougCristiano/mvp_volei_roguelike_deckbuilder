// ─── render.js — UI rendering ───────────────────────────────────────────────
// Owner: UI/Render agent. All DOM mutations live here.
// Depends on: data.js (PHASE_NAMES), state.js (G)
// Rule: render() must remain a pure read of G — no state mutation allowed here.

function render() {
  document.getElementById('point-display').textContent = `${G.pPts} — ${G.aPts}`;

  const setsEl = document.getElementById('sets-display');
  if (setsEl) setsEl.textContent = `Sets: ${G.pSets} × ${G.aSets}`;

  // Campaign match progress indicator
  const cp = document.getElementById('campaign-progress');
  if (cp) {
    cp.style.display = G.gameMode === 'campaign' ? 'inline-block' : 'none';
    const lbl = document.getElementById('campaign-match-label');
    if (lbl && G.campaignMatchIndex) {
      const cfg = CAMPAIGN_MATCH_CONFIG[G.campaignMatchIndex - 1];
      lbl.textContent = cfg ? cfg.label : '';
    }
  }

  // Phase label
  let detailedPhase = '';
  if (G.blockWindow) {
    detailedPhase = `Seu Bloqueio (Ataque do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'})`;
  } else if (G.defWindow) {
    detailedPhase = G.isDefendingServe
      ? `Sua Recepção (Saque do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'})`
      : `Sua Defesa (Ataque do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'})`;
  } else if (G.possession === 'player') {
    detailedPhase = G.phase === 'service' ? 'Seu Saque' :
                    G.phase === 'defense' ? 'Sua Defesa/Recepção' :
                    G.phase === 'setting' ? 'Seu Levantamento' :
                    G.phase === 'attack'  ? 'Seu Ataque' :
                    (PHASE_NAMES[G.phase] || G.phase);
  } else {
    detailedPhase = `Turno do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'}`;
  }
  document.getElementById('phase-label').textContent = detailedPhase;

  // Possession badge
  const acting = (G.possession === 'player' || G.blockWindow || G.defWindow) ? 'player' : 'ai';
  const pb = document.getElementById('possession-badge');
  pb.textContent = acting === 'player' ? 'Você' : (G.gameMode === 'multiplayer' ? 'Oponente' : 'IA');
  pb.className = 'poss-' + acting;

  document.getElementById('combo-badge').style.display = G.comboIdx > 0 ? 'inline' : 'none';

  // Message area
  const msg = document.getElementById('message-area');
  if (G.pointDone)        msg.textContent = '';
  else if (G.defWindow)   msg.textContent = G.isDefendingServe ? 'Prepare a Recepção!' : 'Defenda o Ataque!';
  else if (G.blockWindow) msg.textContent = 'Ação Rápida: Bloqueio!';
  else if (G.locked)      msg.textContent = G.gameMode === 'multiplayer' ? '🧑‍💻 Oponente jogando...' : '🤖 IA jogando...';
  else if (G.phase === 'service')     msg.textContent = 'Escolha uma carta de saque';
  else if (G.possession === 'player') msg.textContent = 'Sua vez de jogar';
  else msg.textContent = G.gameMode === 'multiplayer' ? 'Aguardando Oponente...' : 'Aguardando IA...';

  // Energy pips
  const headerPips = document.getElementById('energy-pips-header');
  if (headerPips) {
    headerPips.innerHTML = '';
    for (let i = 0; i < G.maxEnergy; i++) {
      const p = document.createElement('div');
      p.className = 'energy-pip' + (i < G.energy ? ' filled' : '');
      headerPips.appendChild(p);
    }
  }
  const aiPips = document.getElementById('ai-energy-pips');
  aiPips.innerHTML = '';
  for (let i = 0; i < G.maxAiEnergy; i++) {
    const p = document.createElement('div');
    p.className = 'energy-pip' + (i < G.aiEnergy ? ' filled' : '');
    aiPips.appendChild(p);
  }

  document.getElementById('freeball-notice').style.display = (G.energy === 0 && !G.pointDone) ? 'block' : 'none';
  document.getElementById('deck-count').textContent    = G.deck.length;
  document.getElementById('discard-count').textContent = G.discard.length;

  renderHand();
  renderResolve();
  renderActions();
  renderLog();
  moveBall();
}

function renderHand() {
  const c = document.getElementById('hand-cards');
  c.innerHTML = '';
  G.hand.forEach((card, idx) => {
    const playable = canPlay(card);
    const sel      = G.selected.includes(idx);
    const blocked  = !playable || (G.locked && !G.defWindow);
    const div      = document.createElement('div');
    div.className  = 'card' + (sel ? ' selected' : '') + (blocked ? ' disabled' : '');
    div.innerHTML  = `<div class="card-type type-${card.type}">${card.type}</div>` +
                     `<div class="card-cost">${card.cost}</div>` +
                     `<div class="card-name">${card.name}</div>` +
                     `<div class="card-power">${card.power > 0 ? card.power : '—'}</div>` +
                     `<div class="card-desc">${card.desc}</div>`;
    if (!blocked) div.addEventListener('click', () => selectCard(idx));
    c.appendChild(div);
  });
}

function renderResolve() {
  const panel       = document.getElementById('resolve-panel');
  const header      = document.getElementById('resolve-header');
  const timerWrapper = document.getElementById('timer-wrapper');

  if ((G.defWindow || G.blockWindow) && !G.pointDone) {
    panel.style.display = 'block';
    panel.className     = G.blockWindow ? 'block-mode' : 'def-mode';
    header.textContent  = G.blockWindow
      ? '✋ Janela de bloqueio — bloquear ou deixar passar?'
      : '🛡️ Janela de defesa — selecione cartas e resolva';
    timerWrapper.style.display = 'flex';

    document.getElementById('atk-val').textContent = G.aiAtkPow;
    let dp = 0;
    G.selected.forEach(i => { if (G.hand[i]) dp += G.hand[i].power; });
    const defVal = document.getElementById('def-val');
    defVal.textContent   = dp;
    defVal.style.color   = dp >= G.aiAtkPow ? 'var(--teal)' : 'var(--coral)';
  } else {
    panel.style.display = 'none';
    panel.className = '';
  }
}

function renderActions() {
  const bPlay = document.getElementById('btn-play');
  const bDraw = document.getElementById('btn-reroll');
  const bPass = document.getElementById('btn-pass');
  const bRes  = document.getElementById('btn-resolve');
  const bBlk  = document.getElementById('btn-block');
  const bSkip = document.getElementById('btn-skip-block');

  bDraw.textContent = 'Trocar (1⚡)';
  bDraw.disabled    = G.locked || G.energy < 1 || G.selected.length !== 1;

  if (G.defWindow) {
    bPlay.style.display = 'none'; bBlk.style.display  = 'none';
    bDraw.style.display = 'block'; bPass.style.display = 'none';
    bRes.style.display  = 'block'; bSkip.style.display = 'none';
    bRes.disabled = !G.selected.some(i => G.hand[i]?.type !== 'coach');
  } else if (G.blockWindow) {
    bPlay.style.display = 'none'; bRes.style.display  = 'none';
    bDraw.style.display = 'block'; bPass.style.display = 'none';
    bBlk.style.display  = 'block'; bSkip.style.display = 'block';
    bBlk.disabled  = !G.selected.some(i => G.hand[i]?.type !== 'coach');
    bSkip.disabled = G.locked;
  } else {
    bPlay.style.display = 'block'; bBlk.style.display  = 'none';
    bDraw.style.display = 'block'; bPass.style.display = 'block';
    bRes.style.display  = 'none';  bSkip.style.display = 'none';
    bPlay.disabled = G.selected.length === 0 || G.locked;
    bPass.disabled = G.locked || G.phase === 'service' || G.possession !== 'player';
  }
}

function logClass(msg) {
  if (/^[✅🎉🏆]/.test(msg))   return 'log-win';
  if (/^[❌⏱]/.test(msg))      return 'log-loss';
  if (/^[🛡🧤🔁🏃🤺🤖]/.test(msg)) return 'log-ai';
  if (/^[+⚡🃏]/.test(msg))    return 'log-energy';
  if (/^🔥/.test(msg))          return 'log-combo';
  if (/^—/.test(msg))           return 'log-neutral';
  if (/^⚖/.test(msg))          return 'log-combat';
  return '';
}

function renderLog() {
  document.getElementById('log-area').innerHTML =
    G.log.slice(0, 12)
         .map(l => { const c = logClass(l); return `<div class="log-entry${c ? ' ' + c : ''}">${l}</div>`; })
         .join('');
}

function moveBall() {
  const ball = document.getElementById('ball');
  if (!ball) return;
  if (G.defWindow)             { ball.style.left = '48%'; ball.style.bottom = '55px'; }
  else if (G.possession === 'player') { ball.style.left = '25%'; ball.style.bottom = '25px'; }
  else                         { ball.style.left = '68%'; ball.style.bottom = '25px'; }
}

function showPointResult(type, title, desc) {
  const el = document.getElementById('point-result');
  el.className = type;
  el.style.display = 'block';
  document.getElementById('point-result-title').textContent = title;
  document.getElementById('point-result-desc').textContent  = desc;
  document.getElementById('action-area').style.display = 'none';
  document.getElementById('hand-area').style.display   = 'none';
  document.getElementById('resolve-panel').style.display = 'none';
}

function hidePointResult() {
  document.getElementById('point-result').style.display = 'none';
  document.getElementById('action-area').style.display  = 'flex';
  document.getElementById('hand-area').style.display    = 'flex';
}

// Show campaign rewards screen (3 cards to choose from)
function showRewards(rewardCards) {
  if (!rewardCards || rewardCards.length === 0) return;

  const rewardsCards = document.getElementById('rewards-cards');
  rewardsCards.innerHTML = '';

  rewardCards.forEach(card => {
    const rarityClass = `rarity-${card.level}`;
    const rarityLabel = { 'basico': 'Comum', 'intermediario': 'Raro', 'avancado': 'Lendário' }[card.level] || 'Comum';

    const cardEl = document.createElement('div');
    cardEl.className = 'reward-card';
    cardEl.innerHTML = `
      <div class="reward-card-rarity ${rarityClass}">${rarityLabel}</div>
      <div class="reward-card-type type-${card.type}">${card.type.toUpperCase()}</div>
      <div class="reward-card-name">${card.name}</div>
      <div class="reward-card-power">${card.power || '–'}</div>
      <div class="reward-card-desc">${card.desc}</div>
    `;
    cardEl.onclick = () => {
      addCardToReward(card.id);
      document.getElementById('rewards-overlay').style.display = 'none';
      if (G.gameMode === 'campaign') startNextCampaignMatch();
      else startPoint();
    };
    rewardsCards.appendChild(cardEl);
  });

  document.getElementById('rewards-overlay').style.display = 'flex';
}

function showEnd(won) {
  const oppNameCap = G.gameMode === 'multiplayer' ? 'Oponente' : 'IA';
  const isCampaignFinal = G.gameMode === 'campaign' && G.campaignMatchIndex === CAMPAIGN_MATCH_CONFIG.length;

  if (won && isCampaignFinal) {
    document.getElementById('overlay-title').textContent = '🏆 Campeão da Temporada!';
    document.getElementById('overlay-msg').textContent   = 'Você venceu os 3 jogos e conquistou o título. Incrível!';
  } else if (won) {
    document.getElementById('overlay-title').textContent = '🏆 Vitória!';
    document.getElementById('overlay-msg').textContent   = `Você venceu! ${G.pSets}×${G.aSets} em sets.`;
  } else {
    document.getElementById('overlay-title').textContent = '💔 Derrota';
    document.getElementById('overlay-msg').textContent   = G.gameMode === 'campaign'
      ? `Campanha encerrada. ${oppNameCap} venceu. Tente novamente!`
      : `${oppNameCap} venceu. ${G.aSets}×${G.pSets} em sets.`;
  }
  document.getElementById('overlay').style.display = 'flex';
}
