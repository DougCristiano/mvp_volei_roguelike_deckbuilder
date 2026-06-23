// ─── multiplayer.js — PeerJS peer-to-peer network ───────────────────────────
// Owner: Multiplayer agent. All PeerJS connection, data sending, and incoming message handling.
// Depends on: data.js (CARDS_DB, DEFENSE_QUALITY_RANGES), state.js (G, log, startPoint),
//             combat.js (startDefenseWindow, endPoint), render.js (render)

let peer = null;
let conn = null;

// Sends a data packet to the opponent. Always includes local energy for sync.
function sendData(data) {
  if (conn && conn.open) {
    data.energy = G.energy;
    conn.send(data);
  }
}

function initializePeer() {
  try {
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    peer = new Peer(shortId);

    peer.on('open', id => {
      document.getElementById('player-id-display').textContent = id;
      document.getElementById('btn-start-multiplayer').textContent = 'Compartilhe seu ID';
      document.getElementById('connection-status').textContent = 'Sala criada! Aguardando conexão...';
    });

    peer.on('connection', newConn => {
      if (conn && conn.open) { newConn.close(); return; }
      conn = newConn;
      setupConnectionHandlers(true); // I am the host
    });

    peer.on('error', err => {
      console.error(err);
      document.getElementById('connection-status').textContent = 'Erro de conexão. Tente recarregar a página.';
    });
  } catch (e) {
    console.error(e);
    document.getElementById('connection-status').textContent = 'Erro ao iniciar o serviço de rede.';
  }
}

function connectToPeer(remoteId) {
  document.getElementById('connection-status').textContent = `Conectando a ${remoteId}...`;
  conn = peer.connect(remoteId);
  setupConnectionHandlers(false); // I am the client
}

function setupConnectionHandlers(isHost) {
  conn.on('open', () => {
    document.getElementById('connection-status').textContent = `Conectado a ${conn.peer}!`;
    setTimeout(() => {
      document.getElementById('main-menu-overlay').style.display = 'none';
      document.getElementById('app').style.display = 'grid';
      newGame('multiplayer', isHost);
    }, 1500);
  });

  conn.on('data', data => {
    console.log('Ação recebida:', data);

    // Mirror opponent energy in all incoming packets
    if (data.energy !== undefined) G.aiEnergy = data.energy;

    if (data.type === 'REROLL') {
      log('🧑‍💻 Oponente trocou uma carta (-1⚡).');
      render();
    }

    if (data.type === 'PLAY_CARD') {
      const card = CARDS_DB.find(c => c.id === data.cardId);
      if (card) { log(`🧑‍💻 Oponente jogou: ${card.name} (Gasto ${card.cost}⚡)`); render(); }
    }

    if (data.type === 'SERVICE_ERROR') {
      if (G.pointDone) return;
      const isOut = data.errorType === 'out';
      if (isOut) {
        log('🎉 O saque do Oponente foi para fora! Ponto seu.');
        endPoint('win', 'Erro de saque (bola para fora).');
      } else {
        log('🎉 O saque do Oponente bateu na rede! Ponto seu.');
        endPoint('win', 'Erro de saque (bola na rede).');
      }
      G.pPts++;
      G.nextServer = 'player';
    }

    if (data.type === 'POINT_END') {
      const myRole  = G.isHost ? 'host'   : 'client';
      const iWon    = data.winnerRole === myRole;
      G.pPts   = G.isHost ? data.hostPts   : data.clientPts;
      G.aPts   = G.isHost ? data.clientPts : data.hostPts;
      G.pSets  = G.isHost ? data.hostSets  : data.clientSets;
      G.aSets  = G.isHost ? data.clientSets : data.hostSets;
      G.nextServer = (data.nextServerRole === myRole) ? 'player' : 'ai';
      log(iWon ? `🎉 Ponto seu! ${data.reason}` : `❌ Ponto do Oponente. ${data.reason}`);
      G.isNetworkReceiver = true;
      G.networkPointData  = data;
      endPoint(iWon ? 'win' : 'loss', data.reason);
      G.isNetworkReceiver = false;
      G.networkPointData  = null;
    }

    if (data.type === 'SERVICE_SUCCESS') {
      log('🏐 O Saque do Oponente cruzou a rede...');
      G.aiAtkPow   = data.power;
      G.possession = 'player';
      G.locked     = false;
      startDefenseWindow(true);
    }

    if (data.type === 'PASS_BALL') {
      log(`↩ Oponente passou a bola${data.forced ? ' (Freeball)' : ''} (+2⚡).`);
      G.aiEnergy   = Math.min(G.aiEnergy + 2, G.maxAiEnergy);
      G.possession = 'player';
      G.locked     = false;
      G.phase      = 'defense';
      G.aiAtkPow   = 1;
      startDefenseWindow(false);
    }

    if (data.type === 'ATTACK') {
      log(`⚡ O Oponente vem para a cortada com poder ${data.power}! Tentar Bloqueio?`);
      G.aiAtkPow   = data.power;
      G.possession = 'player';
      G.locked     = false;
      G.blockWindow = true;
      G.phase      = 'block';
      drawPhaseOptions();
      G.blockTimerVal = 15.0;
      const bar = document.getElementById('timer-bar');
      if (bar) bar.style.width = '100%';
      clearInterval(G.blockInterval);
      G.blockInterval = setInterval(tickBlockTimer, 100);
      render();
    }

    if (data.type === 'BLOCK_SKIPPED') {
      log('🏃 O Oponente deixou o bloqueio passar. Vai tentar a defesa...');
    }

    if (data.type === 'BLOCK_RESULT') {
      const card  = CARDS_DB.find(c => c.id === data.cardId);
      const cName = card ? card.name : '';
      if (data.resultType === 'POINT_DIRECT') {
        if (G.pointDone) return;
        log(`🧱 O bloqueio ${cName} do Oponente parou a bola! Ponto do Oponente.`);
        G.aPts++; G.nextServer = 'ai';
        endPoint('loss', 'Bloqueio direto do adversário.');
      } else if (data.resultType === 'OUT') {
        if (G.pointDone) return;
        log('✅ O bloqueio do Oponente foi para fora! Ponto seu!');
        G.pPts++; G.nextServer = 'player';
        endPoint('win', 'Bloqueio fora do adversário.');
      } else if (data.resultType === 'SOFTEN') {
        log(`🧤 O bloqueio ${cName} do Oponente amorteceu seu ataque.`);
      } else if (data.resultType === 'CONTINUE') {
        log(`🔁 O bloqueio ${cName} do Oponente devolveu a bola fácil para você!`);
        G.possession = 'player'; G.locked = false;
        startDefenseWindow(false);
      }
    }

    if (data.type === 'DEFENSE_SUCCESS') {
      const tier       = data.quality ? DEFENSE_QUALITY_RANGES[data.quality] : { emoji: '', desc: '' };
      const qualityStr = data.quality ? `${tier.emoji} ${tier.desc}` : '';
      log(`🛡️ O Oponente defendeu (${data.defPow}) ${qualityStr}! A posse passou.`);
      G.possession = 'ai';
      G.locked     = true;
      render();
    }

    if (data.type === 'DEFENSE_FAIL') {
      if (G.pointDone) return;
      const pow        = data.defPow !== undefined ? data.defPow : 0;
      const tier       = data.quality ? DEFENSE_QUALITY_RANGES[data.quality] : { emoji: '', desc: '' };
      const qualityStr = data.quality ? `${tier.emoji} ${tier.desc}` : '';
      log(`✅ ${qualityStr} O Oponente não conseguiu defender (Def: ${pow}). Ponto seu!`);
      G.pPts++;
      G.nextServer = 'player';
      endPoint('win', 'Ataque superou a defesa do adversário.');
    }
  });

  conn.on('close', () => {
    document.getElementById('overlay-title').textContent = '🔌 Desconectado';
    document.getElementById('overlay-msg').textContent   = 'O oponente se desconectou da partida.';
    document.getElementById('overlay-btn').textContent   = 'Novo Jogo';
    document.getElementById('overlay').style.display    = 'flex';
  });
}
