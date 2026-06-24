// ─── input.js — Player input handling ───────────────────────────────────────
// Owner: Input agent. Card selection, playing cards, bonuses, combo tracking.
// Depends on: data.js (COMBO_SEQ, PHASE_NAMES), state.js (G, log),
//             deck.js (clearHand, drawPhaseOptions), render.js (render),
//             combat.js (resolvePlayerAttack, checkFreeball, passBall, startDefenseWindow),
//             ai.js (aiTurn), audio.js (sounds)

function canPlay(card) {
  if (G.defWindow)   return card.phases.includes('defense') && card.cost <= G.energy;
  if (G.blockWindow) return card.phases.includes('block')   && card.cost <= G.energy;
  return card.phases.includes(G.phase) && card.cost <= G.energy;
}

function selectCard(idx) {
  if (G.locked || G.pointDone) return;
  const card = G.hand[idx];
  if (!card || !canPlay(card)) return;
  if (G.defWindow || G.blockWindow) {
    const si = G.selected.indexOf(idx);
    if (si >= 0) G.selected.splice(si, 1);
    else G.selected.push(idx);
  } else {
    G.selected = G.selected[0] === idx ? [] : [idx];
  }
  render();
}

function playCard() {
  if (G.selected.length === 0 || G.locked || G.pointDone) return;
  const idx  = G.selected[0];
  const card = G.hand[idx];
  if (!card) return;

  // Card fly animation
  const cardEl = document.querySelectorAll('.card')[idx];
  if (cardEl) cardEl.style.animation = 'cardFlying 0.6s ease-in-out forwards';

  G.locked = true;
  sounds.cardPlay();
  G.energy -= card.cost;
  applyBonus(card);
  log(`✅ ${card.name} [${PHASE_NAMES[G.phase]}, poder ${card.power}]`);
  updateCombo(card);

  if (G.gameMode === 'multiplayer') sendData({ type: 'PLAY_CARD', cardId: card.id });

  // Coach cards (Dica do Treinador) redraw in the same phase; limited to 1 per point
  if (card.type === 'coach') {
    G.coachUsed = true;
    log('📋 Dica do Técnico usada! (1 por ponto)');
    clearHand();
    drawPhaseOptions();
    if (card.bonus === 'draw1') {
      const phases = G.defWindow ? ['defense'] : [G.phase];
      let extra = null;
      for (let i = G.deck.length - 1; i >= 0 && !extra; i--) {
        if (G.deck[i].phases.some(p => phases.includes(p)) && G.deck[i].type !== 'coach') extra = G.deck.splice(i, 1)[0];
      }
      if (!extra && G.discard.length > 0) {
        G.deck = shuffle([...G.deck, ...G.discard]);
        G.discard = [];
        for (let i = G.deck.length - 1; i >= 0 && !extra; i--) {
          if (G.deck[i].phases.some(p => phases.includes(p)) && G.deck[i].type !== 'coach') extra = G.deck.splice(i, 1)[0];
        }
      }
      if (extra) G.hand.push(extra);
    }
    G.locked = false;
    render();
    return;
  }

  clearHand();

  if (G.phase === 'service') {
    const errorChance = 0.05 + (card.power * 0.03);
    if (Math.random() < errorChance) {
      const isOut = Math.random() < 0.5;
      const oppName = G.gameMode === 'multiplayer' ? 'Oponente' : 'IA';
      if (isOut) {
        log(`❌ O seu ${card.name} foi para fora! Ponto do ${oppName}.`);
        endPoint('loss', 'Saque para fora.');
      } else {
        log(`❌ O seu ${card.name} bateu na rede! Ponto do ${oppName}.`);
        endPoint('loss', 'Saque na rede.');
      }
      G.aPts++;
      G.nextServer = 'ai';
      if (G.gameMode === 'multiplayer') sendData({ type: 'SERVICE_ERROR', errorType: isOut ? 'out' : 'net' });
      render();
    } else {
      log('🏐 Saque realizado com sucesso! A bola cruzou a rede...');
      G.phase = 'defense';
      if (G.gameMode === 'multiplayer') sendData({ type: 'SERVICE_SUCCESS', power: card.power });
      render();
      setTimeout(() => passBall(true, true), 600);
    }
  } else if (G.phase === 'defense') {
    G.phase = 'setting';
    log('🤲 Levantamento... Prepare a jogada.');
    G.locked = false;
    drawPhaseOptions();
    checkFreeball();
    render();
  } else if (G.phase === 'setting') {
    G.phase = 'attack';
    log('💥 A bola está no alto! Escolha o ataque.');
    if (G.gameMode === 'multiplayer') sendData({ type: 'SETTING_PLAY', cardId: card.id });
    G.locked = false;
    drawPhaseOptions();
    checkFreeball();
    render();
  } else if (G.phase === 'attack') {
    // Os Meteoros passive: every attack gains +2 power
    const meteorosBonus = G.campaignTeam === 'meteoros' ? 2 : 0;
    const total = card.power + G.atkBoost + (G.nextAttackBonus || 0) + meteorosBonus;
    G.atkBoost = 0;
    G.nextAttackBonus = 0;
    if (meteorosBonus > 0) log('🔥 Bônus Os Meteoros: +2 de ataque!');
    log(`🏐 Você executou ${card.name} com Ataque total ${total}!`);
    render();
    setTimeout(() => resolvePlayerAttack(total, card), 700);
  }
}

function rerollOption() {
  if (G.locked || G.pointDone || G.energy < 1 || G.selected.length !== 1) return;
  const idx      = G.selected[0];
  const discarded = G.hand.splice(idx, 1)[0];
  G.discard.push(discarded);
  G.energy -= 1;

  if (G.gameMode === 'multiplayer') sendData({ type: 'REROLL' });

  let phases = [];
  if (G.blockWindow)    phases = ['block'];
  else if (G.defWindow) phases = ['defense', 'coach'];
  else                  phases = [G.phase, 'coach'];
  if (G.phase === 'service' || G.blockWindow || G.coachUsed) phases = phases.filter(p => p !== 'coach');

  let found = [];
  for (let i = G.deck.length - 1; i >= 0 && found.length < 1; i--) {
    if (G.deck[i].phases.some(p => phases.includes(p))) found.push(G.deck.splice(i, 1)[0]);
  }
  if (found.length < 1) {
    G.deck = shuffle([...G.deck, ...G.discard]);
    G.discard = [];
    for (let i = G.deck.length - 1; i >= 0 && found.length < 1; i--) {
      if (G.deck[i].phases.some(p => phases.includes(p))) found.push(G.deck.splice(i, 1)[0]);
    }
  }

  if (found.length > 0) G.hand.splice(idx, 0, found[0]);
  G.selected = [];
  log('🔄 Reciclou 1 opção (-1 energia).');
  checkFreeball();
  render();
}

function applyBonus(card) {
  if (!card.bonus) return;
  if (card.bonus === 'energy1')    { G.energy = Math.min(G.energy + 1, G.maxEnergy); log('+1 Energia!'); }
  if (card.bonus === 'energy2')    { G.energy = Math.min(G.energy + 2, G.maxEnergy); log('+2 Energia!'); }
  if (card.bonus === 'atkBoost2')  { G.atkBoost += 2; log('+2 poder no próximo ataque!'); }
  if (card.bonus === 'atkBoost3')  { G.atkBoost += 3; log('+3 poder no próximo ataque!'); }
  if (card.bonus === 'atkBoost6')  { G.atkBoost += 6; log('+6 poder no próximo ataque!'); }
  if (card.bonus === 'draw1')      { log('🃏 Comunicação! +1 opção extra de carta.'); }
  if (card.bonus === 'aiDefMinus1') { G.aiDefMinus += 1; log(`${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'} defende com -1!`); }
  if (card.bonus === 'aiDefMinus2') { G.aiDefMinus += 2; log(`${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'} defende com -2!`); }
}

function updateCombo(card) {
  if (card.type === 'coach') return;
  if (G.comboIdx < COMBO_SEQ.length && card.type === COMBO_SEQ[G.comboIdx]) {
    G.comboIdx++;
    if (G.comboIdx === COMBO_SEQ.length) {
      sounds.combo();
      G.atkBoost += 2;
      log('🔥 COMBO! +2 poder bônus!');
    }
  } else if (card.type !== 'service') {
    G.comboIdx = 0;
  }
}
