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
    const typeCards = CARDS_DB.filter(c => c.type === t);
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

// Draws up to 3 cards valid for the current phase into the hand.
// Coach cards are excluded when G.coachUsed is true or during service/block phases.
// Recycles discard pile if the deck runs out.
function drawPhaseOptions() {
  clearHand();

  let phases = [];
  if (G.blockWindow)      phases = ['block'];
  else if (G.defWindow)   phases = ['defense', 'coach'];
  else                    phases = [G.phase, 'coach'];

  // Coach is not available during service or when already used this point
  if (G.phase === 'service' || G.coachUsed) {
    phases = phases.filter(p => p !== 'coach');
  }

  let found = [];
  for (let i = G.deck.length - 1; i >= 0 && found.length < 3; i--) {
    if (G.deck[i].phases.some(p => phases.includes(p))) {
      found.push(G.deck.splice(i, 1)[0]);
    }
  }

  // Recycle discard if deck ran dry
  if (found.length < 3) {
    G.deck = shuffle([...G.deck, ...G.discard]);
    G.discard = [];
    for (let i = G.deck.length - 1; i >= 0 && found.length < 3; i--) {
      if (G.deck[i].phases.some(p => phases.includes(p))) {
        found.push(G.deck.splice(i, 1)[0]);
      }
    }
  }

  G.hand = found;
  if (G.hand.length === 0) log(`⚠ Nenhuma opção válida encontrada para ${phases[0]}.`);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { shuffle, buildDeck, resetDeck, clearHand, drawPhaseOptions };
}
