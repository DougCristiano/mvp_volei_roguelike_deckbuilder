// ─── state.js — Global game state (G) and game lifecycle ────────────────────
// Owner: State agent. Manages G initialization and point/game transitions.
// Depends on: data.js (CARDS_DB), deck.js (buildDeck, resetDeck), render.js (render)

let G = {};

function log(msg) {
  G.log.unshift(msg);
  if (G.log.length > 40) G.log.pop();
}

function newGame(gameMode = 'ai', isHost = false) {
  G = {
    gameMode,
    isHost,

    // Score
    pPts: 0, aPts: 0, pSets: 0, aSets: 0,

    // Resources
    energy: 10, maxEnergy: 10,
    aiEnergy: 10, maxAiEnergy: 10,

    // Cards
    deck: [], hand: [], discard: [],
    selected: [],

    // Rally state
    phase: 'service',
    possession: gameMode === 'multiplayer' ? (isHost ? 'player' : 'ai') : 'player',
    nextServer: gameMode === 'multiplayer' ? (isHost ? 'player' : 'ai') : 'player',
    defWindow: false,
    blockWindow: false,
    locked: false,
    pointDone: false,

    // Timers
    blockTimerVal: 0, blockInterval: null,
    defTimerVal: 0,   defInterval: null,

    // Combat bonuses
    comboIdx: 0,
    atkBoost: 0,
    nextAttackBonus: 0,   // Bonus/malus carried from player defense quality
    aiNextAtkBonus: 0,    // Bonus/malus carried from AI defense quality
    aiDefMinus: 0,
    aiAtkPow: 0,

    // Flags
    aiJustDefended: false,
    isDefendingServe: false,
    defenseQuality: null,
    coachUsed: false,      // Dica do Treinador limited to 1 use per point

    // Log (newest at index 0)
    log: [],
  };

  const aiLabel     = document.getElementById('ai-label');
  const playerLabel = document.getElementById('player-label');
  const atkLabel    = document.getElementById('atk-label');

  if (aiLabel)     aiLabel.textContent     = gameMode === 'multiplayer' ? 'Oponente' : 'IA';
  if (atkLabel)    atkLabel.textContent    = gameMode === 'multiplayer' ? 'Ataque Oponente' : 'Ataque IA';
  if (playerLabel) playerLabel.textContent = (gameMode === 'multiplayer' && isHost) ? 'Host' : 'Você';

  buildDeck();
  startPoint();
}

function startPoint() {
  resetDeck();
  G.energy    = G.maxEnergy;
  G.aiEnergy  = G.maxAiEnergy;
  G.phase     = 'service';
  G.possession = G.nextServer || 'player';
  G.comboIdx  = 0;
  G.atkBoost  = 0;
  G.nextAttackBonus = 0;
  G.aiNextAtkBonus  = 0;
  G.aiDefMinus = 0;
  G.selected   = [];
  G.defWindow  = false;
  G.blockWindow = false;
  G.locked     = false;
  G.pointDone  = false;
  G.aiJustDefended   = false;
  G.isDefendingServe = false;
  G.defenseQuality   = null;
  G.coachUsed        = false;
  clearInterval(G.blockInterval);
  clearInterval(G.defInterval);
  hidePointResult();

  if (G.possession === 'player') {
    log('— Novo ponto. Seu saque —');
    drawPhaseOptions();
  } else {
    log(G.gameMode === 'multiplayer' ? '— Novo ponto. Saque do Oponente —' : '— Novo ponto. Saque da IA —');
    G.locked = true;
    if (G.gameMode === 'ai') setTimeout(() => aiTurn(), 1000);
  }
  render();
}
