// ─── state.js — Global game state (G) and game lifecycle ────────────────────
// Owner: State agent. Manages G initialization and point/game transitions.
// Depends on: data.js (CARDS_DB), deck.js (buildDeck, resetDeck), render.js (render)

let G = {};

function log(msg) {
  G.log.unshift(msg);
  if (G.log.length > 40) G.log.pop();
}

function newGame(gameMode = 'ai', isHost = false, campaignTeam = null, aiDifficultyOverride = null) {
  const matchCfg = campaignTeam ? CAMPAIGN_MATCH_CONFIG[0] : null;

  G = {
    gameMode,
    isHost,
    campaignTeam,   // id string ('meteoros'|'muralha'|'fortaleza') or null

    // Campaign match tracking
    campaignMatchIndex: campaignTeam ? 1 : 0,
    aiDifficulty: aiDifficultyOverride !== null ? aiDifficultyOverride : (matchCfg ? matchCfg.aiDifficulty : 0),

    // Score — driven by match config for campaign
    pPts: 0, aPts: 0,
    pSets: matchCfg ? matchCfg.pSets : 0,
    aSets: matchCfg ? matchCfg.aSets : 0,

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
    comboTags: [],        // tags of defense/setting/attack cards played this rally (tag-combo detection)
    atkBoost: 0,
    costDiscount: 0,      // costReduceNext1 bonus: energy discount applied to the next card played
    nextAttackBonus: 0,   // Bonus/malus carried from player defense quality
    aiNextAtkBonus: 0,    // Bonus/malus carried from AI defense quality
    aiDefMinus: 0,
    aiAtkPow: 0,

    // Flags
    aiJustDefended: false,
    isDefendingServe: false,
    defenseQuality: null,
    coachUsed: false,           // Dica do Treinador limited to 1 use per point
    freeBlockUsed: false,       // A Muralha passive: first block per point costs 0 energy
    nextPhaseExtraCard: false,  // draw1 coach bonus: next drawPhaseOptions draws 4 instead of 3

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

  // Campaign: announce the team, passive and match label in the log
  if (campaignTeam && typeof CAMPAIGN_TEAMS !== 'undefined' && CAMPAIGN_TEAMS[campaignTeam]) {
    const t = CAMPAIGN_TEAMS[campaignTeam];
    log(`${t.emoji} Dupla: ${t.name} (${t.players.join(' & ')})`);
    log(`⚡ Passivo: ${t.passive}`);
    if (matchCfg) log(`🏆 ${matchCfg.label} — Boa sorte!`);
  }
}

// Advance to the next campaign match, preserving the grown deck.
// Called after the player picks a reward card at the end of each match.
function startNextCampaignMatch() {
  const nextIndex = G.campaignMatchIndex + 1;

  // All 3 matches completed — player won the campaign
  if (nextIndex > CAMPAIGN_MATCH_CONFIG.length) {
    showEnd(true);
    return;
  }

  const matchCfg  = CAMPAIGN_MATCH_CONFIG[nextIndex - 1];
  const savedDeck = [...G.deck, ...G.hand, ...G.discard]; // preserve all cards (deck + hand + discard)

  // Reset match state without rebuilding the deck
  G.campaignMatchIndex = nextIndex;
  G.aiDifficulty       = matchCfg.aiDifficulty;
  G.pSets              = matchCfg.pSets;
  G.aSets              = matchCfg.aSets;
  G.pPts               = 0;
  G.aPts               = 0;
  G.nextServer         = 'player';
  G.comboIdx           = 0;
  G.comboTags          = [];
  G.atkBoost           = 0;
  G.costDiscount       = 0;
  G.nextAttackBonus    = 0;
  G.aiNextAtkBonus     = 0;
  G.aiDefMinus         = 0;
  G.aiAtkPow           = 0;
  G.aiJustDefended     = false;
  G.isDefendingServe   = false;
  G.defenseQuality     = null;
  G.coachUsed          = false;
  G.freeBlockUsed      = false;
  G.nextPhaseExtraCard = false;
  G.selected           = [];
  G.hand               = [];
  G.discard            = [];
  G.deck               = savedDeck;

  clearInterval(G.blockInterval);
  clearInterval(G.defInterval);

  log(`— ${matchCfg.label} —`);
  log(`🎯 Dificuldade ${['Fácil', 'Médio', 'Difícil'][matchCfg.aiDifficulty]} | Sets: ${matchCfg.pSets}×${matchCfg.aSets}`);

  startPoint();
}

function startPoint() {
  resetDeck();
  G.energy    = G.maxEnergy;
  G.aiEnergy  = G.maxAiEnergy;
  G.phase     = 'service';
  G.possession = G.nextServer || 'player';
  G.comboIdx  = 0;
  G.comboTags = [];
  G.atkBoost  = 0;
  G.costDiscount = 0;
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
  G.coachUsed          = false;
  G.freeBlockUsed      = false;
  G.nextPhaseExtraCard = false;
  clearInterval(G.blockInterval);
  clearInterval(G.defInterval);
  G.ballFx = null;
  if (typeof clearBallSeq === 'function') clearBallSeq();
  hidePointResult();

  if (G.possession === 'player') {
    log('— Novo ponto. Seu saque —');
    drawPhaseOptions();
  } else {
    log(G.gameMode === 'multiplayer' ? '— Novo ponto. Saque do Oponente —' : '— Novo ponto. Saque da IA —');
    G.locked = true;
    if (G.gameMode !== 'multiplayer') setTimeout(() => aiTurn(), 1000);
  }
  render();
}
