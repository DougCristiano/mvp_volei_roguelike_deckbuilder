// ─── progression.js — XP and card unlock system ──────────────────────────────
// Owner: Progression agent. Manages persistent XP per category and card unlocks.
// Loaded in index.html (after campaign.js) and catalog.html (after data.js).
// Does NOT depend on G — reads/writes localStorage directly.
// Depends on: CARDS_DB (data.js), CAMPAIGN_TEAMS (campaign.js, optional)

const PROGRESSION_KEY = 'ascension_progression';

const _DEFAULT_PROG = {
  xp: { service: 0, defense: 0, setting: 0, attack: 0, block: 0, coach: 0 },
  unlockedCards: [],
};

function loadProgression() {
  try {
    const raw = localStorage.getItem(PROGRESSION_KEY);
    if (!raw) return { xp: { ..._DEFAULT_PROG.xp }, unlockedCards: [] };
    const parsed = JSON.parse(raw);
    return {
      xp: { ..._DEFAULT_PROG.xp, ...(parsed.xp || {}) },
      unlockedCards: Array.isArray(parsed.unlockedCards) ? parsed.unlockedCards : [],
    };
  } catch (e) {
    return { xp: { ..._DEFAULT_PROG.xp }, unlockedCards: [] };
  }
}

function saveProgression(prog) {
  try { localStorage.setItem(PROGRESSION_KEY, JSON.stringify(prog)); } catch (e) {}
}

// XP constants
const XP_BASE          = 10;   // earned per match regardless of result
const XP_WIN           = 20;   // bonus on match victory
const XP_ACT_COMPLETE  = 50;   // bonus on winning the entire campaign (all 3 matches)
const XP_SPECIALTY_MULT = 1.5; // multiplier applied to team's specialty type

// teamId: key in CAMPAIGN_TEAMS (e.g. 'meteoros')
// won: true if player won this match
// isActComplete: true if this win finishes the full campaign
function earnMatchXP(teamId, won, isActComplete) {
  const prog = loadProgression();
  const types = ['service', 'defense', 'setting', 'attack', 'block', 'coach'];

  const teams = typeof CAMPAIGN_TEAMS !== 'undefined' ? CAMPAIGN_TEAMS : {};
  const specialtyType = teams[teamId]?.deckBias
    ? Object.keys(teams[teamId].deckBias)[0]
    : null;

  types.forEach(type => {
    let amount = XP_BASE;
    if (won) amount += XP_WIN;
    if (isActComplete) amount += XP_ACT_COMPLETE;
    if (type === specialtyType) amount = Math.round(amount * XP_SPECIALTY_MULT);
    prog.xp[type] = (prog.xp[type] || 0) + amount;
  });

  saveProgression(prog);
  return prog;
}

// Returns true if the player has enough XP to unlock the card
function canUnlock(cardId) {
  const cards = typeof CARDS_DB !== 'undefined' ? CARDS_DB : [];
  const card = cards.find(c => c.id === cardId);
  if (!card || !card.unlockCost) return false;
  const prog = loadProgression();
  return (prog.xp[card.unlockCost.type] || 0) >= card.unlockCost.amount;
}

// Spends XP and marks card as unlocked. Returns false if not affordable.
function unlockCard(cardId) {
  if (!canUnlock(cardId)) return false;
  const cards = typeof CARDS_DB !== 'undefined' ? CARDS_DB : [];
  const card = cards.find(c => c.id === cardId);
  if (!card || !card.unlockCost) return false;
  const prog = loadProgression();
  if (prog.unlockedCards.includes(cardId)) return true;
  prog.xp[card.unlockCost.type] -= card.unlockCost.amount;
  prog.unlockedCards.push(cardId);
  saveProgression(prog);
  return true;
}

// Returns a Set of card IDs that have been unlocked via XP
function getUnlockedCardIds() {
  return new Set(loadProgression().unlockedCards);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadProgression, saveProgression, earnMatchXP, canUnlock, unlockCard, getUnlockedCardIds };
}
