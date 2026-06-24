// ─── deck.js — Deck management ──────────────────────────────────────────────
// Owner: Deck agent. Handles building, shuffling, and drawing cards.
// Depends on: data.js (CARDS_DB), state.js (G, log)

function buildDeck() {
  let pool = [];
  const types = ['service', 'defense', 'setting', 'attack', 'block'];

  // Base from BASE_DECK_COPIES (defined in campaign.js). Campaign teams shift +2 to their specialty.
  const copies = { ...BASE_DECK_COPIES };
  if (G.campaignTeam && typeof CAMPAIGN_TEAMS !== 'undefined') {
    const bias = CAMPAIGN_TEAMS[G.campaignTeam]?.deckBias;
    if (bias) Object.assign(copies, bias);
  }

  types.forEach(t => {
    const typeCards = CARDS_DB.filter(c => c.type === t && !c.locked);
    const n = copies[t] ?? 3;
    for (let i = 0; i < n; i++) pool.push({ ...typeCards[i % typeCards.length] });
  });
  G.deck = shuffle(pool);
}

function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resetDeck() {
  G.deck = [...G.deck, ...G.hand, ...G.discard];
  G.hand = [];
  G.discard = [];
  G.deck = shuffle(G.deck);
}

function clearHand() {
  G.discard.push(...G.hand);
  G.hand = [];
  G.selected = [];
}

// Returns the list of valid phase identifiers for the current game context.
// Coach is included unless already used this point (G.coachUsed).
// Used by drawPhaseOptions(), rerollOption(), and canPlay().
function getCurrentValidPhases() {
  let phases;
  if (G.blockWindow)    phases = ['block', 'coach'];
  else if (G.defWindow) phases = ['defense', 'coach'];
  else                  phases = [G.phase, 'coach'];
  if (G.coachUsed) phases = phases.filter(p => p !== 'coach');
  return phases;
}

// Draws exactly 3 cards valid for the current phase into the hand.
// Coach appears as one of the 3 slots (not extra) and is excluded when G.coachUsed.
// Recycles discard pile if the deck runs out.
function drawPhaseOptions() {
  clearHand();

  const phases = getCurrentValidPhases();
  G.nextPhaseExtraCard = false; // reset flag (reserved for future use)

  const drawCount = 3;

  let found = [];
  for (let i = G.deck.length - 1; i >= 0 && found.length < drawCount; i--) {
    if (G.deck[i].phases.some(p => phases.includes(p))) {
      found.push(G.deck.splice(i, 1)[0]);
    }
  }

  // Recycle discard if deck ran dry
  if (found.length < drawCount) {
    G.deck = shuffle([...G.deck, ...G.discard]);
    G.discard = [];
    for (let i = G.deck.length - 1; i >= 0 && found.length < drawCount; i--) {
      if (G.deck[i].phases.some(p => phases.includes(p))) {
        found.push(G.deck.splice(i, 1)[0]);
      }
    }
  }

  G.hand = found;
  if (G.hand.length === 0) log(`⚠ Nenhuma opção válida encontrada para ${phases[0]}.`);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { shuffle, buildDeck, resetDeck, clearHand, drawPhaseOptions, getCurrentValidPhases };
}
