// ─── ai.js — Artificial intelligence logic ──────────────────────────────────
// Owner: AI agent. AI decision-making for serve, rally, and defense.
// Depends on: data.js (CARDS_DB), state.js (G, log),
//             deck.js (drawPhaseOptions), audio.js (sounds),
//             combat.js (startDefenseWindow, endPoint), render.js (render)
//
// To improve the AI: modify getAIPlay() to use weighted selection,
// or add adaptive logic based on score/energy ratios.

function aiTurn() {
  if (G.pointDone) return;
  sounds.aiTurn();
  log('🤖 IA preparando jogada...');
  render();

  setTimeout(() => {
    // Picks a random affordable card for the given phase.
    // 30% chance to spend 1 extra energy "drawing" the card.
    function getAIPlay(phase, maxCost) {
      let possible = CARDS_DB.filter(c => c.phases.includes(phase) && c.cost <= maxCost && c.power > 0);
      if (possible.length === 0) return { card: null, drew: false, drawCost: 0 };

      let drew = false;
      let drawCost = 0;
      if (Math.random() < 0.30 && maxCost >= 1) {
        drew = true;
        drawCost = 1;
        maxCost -= 1;
        possible = CARDS_DB.filter(c => c.phases.includes(phase) && c.cost <= maxCost && c.power > 0);
        if (possible.length === 0) return { card: null, drew: true, drawCost: 1 };
      }
      return { card: possible[Math.floor(Math.random() * possible.length)], drew, drawCost };
    }

    const targetPhase = (G.phase === 'service') ? 'service' : 'attack';
    let aiCost    = 0;
    let atkBoost  = 0;
    let comboCount = 0;
    let power     = 0;
    let aiRecover = 0;
    const aiCards = [];

    if (targetPhase === 'service') {
      const srvPlay = getAIPlay('service', G.aiEnergy);
      if (srvPlay.drew) { aiCost += srvPlay.drawCost; aiCards.push('🃏 Comprou'); }
      if (srvPlay.card) {
        aiCost += srvPlay.card.cost;
        power   = srvPlay.card.power;
        aiCards.push(srvPlay.card.name);
        log(`🤖 IA sacou: ${aiCards.join(' ➔ ')} (Gasto ${aiCost}⚡)`);
      }
    } else {
      // Full tactical sequence: defense → setting → attack
      if (!G.aiJustDefended) {
        let recPlay = getAIPlay('defense', G.aiEnergy - aiCost);
        if (recPlay.drew) { aiCost += recPlay.drawCost; aiCards.push('🃏 Comprou'); }
        if (recPlay.card) { aiCost += recPlay.card.cost; aiCards.push(recPlay.card.name); comboCount++; }
        else              { aiCards.push('Manchete Improvisada'); }
      } else {
        comboCount++;
        aiCards.push('(Já defendeu)');
      }

      let setPlay = getAIPlay('setting', G.aiEnergy - aiCost);
      if (setPlay.drew) { aiCost += setPlay.drawCost; aiCards.push('🃏 Comprou'); }
      if (setPlay.card) {
        aiCost += setPlay.card.cost;
        aiCards.push(setPlay.card.name);
        comboCount++;
        if (setPlay.card.bonus && setPlay.card.bonus.startsWith('atkBoost')) {
          atkBoost += parseInt(setPlay.card.bonus.replace('atkBoost', ''));
        }
      }

      let atkPlay = getAIPlay('attack', G.aiEnergy - aiCost);
      if (atkPlay.drew) { aiCost += atkPlay.drawCost; aiCards.push('🃏 Comprou'); }
      if (atkPlay.card) {
        aiCost += atkPlay.card.cost;
        aiCards.push(atkPlay.card.name);
        comboCount++;
        power = atkPlay.card.power + atkBoost + (comboCount >= 3 ? 2 : 0) + (G.aiNextAtkBonus || 0);
      } else {
        power = 1 + Math.floor(Math.random() * 2);
        aiCards.push('Freeball (+2⚡)');
        aiRecover = 2;
      }
    }

    G.aiJustDefended = false;
    G.aiNextAtkBonus = 0; // Consume quality bonus
    G.aiEnergy = Math.max(0, G.aiEnergy - aiCost);
    G.aiEnergy = Math.min(G.aiEnergy + aiRecover, G.maxAiEnergy);
    G.aiAtkPow = power;

    if (targetPhase !== 'service') log(`🤖 IA armou jogada: ${aiCards.join(' ➔ ')} (Gasto ${aiCost}⚡)`);
    G.selected = [];
    G.locked   = false;

    if (targetPhase === 'service') {
      const errorChance = 0.05 + (power * 0.03);
      if (Math.random() < errorChance) {
        const isOut = Math.random() < 0.5;
        if (isOut) {
          log('🎉 O saque da IA foi para fora! Ponto seu.');
          endPoint('win', 'Erro de saque da IA (bola para fora).');
        } else {
          log('🎉 O saque da IA bateu na rede! Ponto seu.');
          endPoint('win', 'Erro de saque da IA (bola na rede).');
        }
        G.pPts++;
        G.nextServer = 'player';
        render();
      } else {
        log('🏐 O Saque da IA cruzou a rede...');
        startDefenseWindow(true);
      }
    } else {
      G.blockWindow = true;
      G.phase = 'block';
      log(`⚡ A IA vem para a cortada com poder ${G.aiAtkPow}! Tentar Bloqueio?`);
      drawPhaseOptions();
      G.blockTimerVal = 15.0;
      const bar = document.getElementById('timer-bar');
      if (bar) bar.style.width = '100%';
      clearInterval(G.blockInterval);
      G.blockInterval = setInterval(tickBlockTimer, 100);
      render();
    }
  }, 900);
}
