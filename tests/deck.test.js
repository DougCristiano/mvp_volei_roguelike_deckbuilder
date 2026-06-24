// ─── tests/deck.test.js ──────────────────────────────────────────────────────
// Tests shuffle purity, buildDeck size/composition, clearHand state mutations,
// and drawPhaseOptions phase filtering (including coach exclusion rules).

const { CARDS_DB } = require('../data.js');

// Deck functions reference these as browser globals — set them before require.
global.CARDS_DB = CARDS_DB;
global.log = jest.fn(); // silences log() calls inside deck functions

// Shared G factory — use this in beforeEach so each test gets a clean state.
function makeG(overrides = {}) {
  return {
    deck: [], hand: [], discard: [], selected: [],
    phase: 'service',
    blockWindow: false,
    defWindow: false,
    coachUsed: false,
    log: [],
    ...overrides,
  };
}

// G must exist before deck.js loads (buildDeck writes to G.deck immediately
// in the module scope — this sets a safe initial value).
global.G = makeG();

const { shuffle, buildDeck, resetDeck, clearHand, drawPhaseOptions } =
  require('../deck.js');

// ── shuffle ───────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  test('returns array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  test('contains exactly the same elements', () => {
    const arr = [10, 20, 30, 40, 50];
    expect(shuffle(arr).sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  test('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  test('returns a new array reference', () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr)).not.toBe(arr);
  });

  test('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  test('handles single-element array', () => {
    expect(shuffle([99])).toEqual([99]);
  });

  test('handles two-element array (both orderings possible)', () => {
    const result = shuffle([1, 2]);
    expect(result.sort()).toEqual([1, 2]);
  });
});

// ── buildDeck ────────────────────────────────────────────────────────────────

describe('buildDeck', () => {
  beforeEach(() => { global.G = makeG(); });

  test('produces exactly 42 cards', () => {
    buildDeck();
    expect(G.deck).toHaveLength(42);
  });

  test('each of the 6 types appears exactly 7 times', () => {
    buildDeck();
    const types = ['service', 'setting', 'attack', 'defense', 'block', 'coach'];
    types.forEach(t => {
      const count = G.deck.filter(c => c.type === t).length;
      expect(count).toBe(7);
    });
  });

  test('all deck cards have valid types', () => {
    const VALID_TYPES = ['service', 'defense', 'setting', 'attack', 'block', 'coach'];
    buildDeck();
    G.deck.forEach(c => expect(VALID_TYPES).toContain(c.type));
  });

  test('all deck cards have required fields', () => {
    buildDeck();
    G.deck.forEach(c => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('type');
      expect(c).toHaveProperty('cost');
      expect(c).toHaveProperty('power');
      expect(Array.isArray(c.phases)).toBe(true);
    });
  });

  test('deck cards are copies, not the original CARDS_DB references', () => {
    buildDeck();
    G.deck.forEach(deckCard => {
      const original = CARDS_DB.find(c => c.id === deckCard.id);
      expect(deckCard).not.toBe(original); // different object reference
      expect(deckCard.id).toBe(original.id); // same data
    });
  });

  test('repeated calls produce different orderings (statistical)', () => {
    buildDeck();
    const order1 = G.deck.map(c => c.id).join(',');
    buildDeck();
    const order2 = G.deck.map(c => c.id).join(',');
    // This could flake in astronomically unlikely cases, but 42! orderings make it safe.
    expect(order1).not.toBe(order2);
  });
});

// ── resetDeck ────────────────────────────────────────────────────────────────

describe('resetDeck', () => {
  beforeEach(() => { global.G = makeG(); });

  test('merges hand and discard back into deck', () => {
    G.deck    = [{ id: 'atk1', phases: ['attack'], cost: 2, power: 6, type: 'attack' }];
    G.hand    = [{ id: 'def1', phases: ['defense'], cost: 1, power: 4, type: 'defense' }];
    G.discard = [{ id: 'srv1', phases: ['service'], cost: 1, power: 3, type: 'service' }];
    resetDeck();
    expect(G.deck).toHaveLength(3);
    expect(G.hand).toHaveLength(0);
    expect(G.discard).toHaveLength(0);
  });

  test('deck after reset contains all original card IDs', () => {
    G.deck    = [{ id: 'atk1', phases: ['attack'], cost: 2, power: 6, type: 'attack' }];
    G.hand    = [{ id: 'def1', phases: ['defense'], cost: 1, power: 4, type: 'defense' }];
    G.discard = [{ id: 'srv1', phases: ['service'], cost: 1, power: 3, type: 'service' }];
    resetDeck();
    const ids = G.deck.map(c => c.id).sort();
    expect(ids).toEqual(['atk1', 'def1', 'srv1'].sort());
  });
});

// ── clearHand ────────────────────────────────────────────────────────────────

describe('clearHand', () => {
  beforeEach(() => { global.G = makeG(); });

  test('moves all hand cards to discard', () => {
    G.hand    = [{ id: 'def1' }, { id: 'atk1' }];
    G.discard = [{ id: 'srv1' }];
    clearHand();
    expect(G.discard).toHaveLength(3);
  });

  test('empties the hand', () => {
    G.hand = [{ id: 'def1' }, { id: 'atk1' }];
    clearHand();
    expect(G.hand).toHaveLength(0);
  });

  test('clears selected indices', () => {
    G.hand     = [{ id: 'def1' }];
    G.selected = [0];
    clearHand();
    expect(G.selected).toHaveLength(0);
  });

  test('is idempotent when hand is already empty', () => {
    G.hand    = [];
    G.discard = [{ id: 'srv1' }];
    clearHand();
    expect(G.discard).toHaveLength(1);
    expect(G.hand).toHaveLength(0);
  });
});

// ── drawPhaseOptions ─────────────────────────────────────────────────────────

describe('drawPhaseOptions — draw count', () => {
  beforeEach(() => {
    global.G = makeG({ phase: 'service' });
    buildDeck();
  });

  test('draws at most 3 cards', () => {
    drawPhaseOptions();
    expect(G.hand.length).toBeLessThanOrEqual(3);
  });

  test('hand is always an array after draw', () => {
    drawPhaseOptions();
    expect(Array.isArray(G.hand)).toBe(true);
  });
});

describe('drawPhaseOptions — service phase', () => {
  beforeEach(() => {
    global.G = makeG({ phase: 'service', blockWindow: false, defWindow: false, coachUsed: false });
    buildDeck();
  });

  test('draws only service-phase cards', () => {
    drawPhaseOptions();
    G.hand.forEach(c => expect(c.phases).toContain('service'));
  });

  test('never draws coach cards in service phase', () => {
    drawPhaseOptions();
    G.hand.forEach(c => expect(c.type).not.toBe('coach'));
  });
});

describe('drawPhaseOptions — block phase', () => {
  beforeEach(() => {
    global.G = makeG({ phase: 'block', blockWindow: true, defWindow: false });
    buildDeck();
  });

  test('draws only block-phase cards when blockWindow is true', () => {
    drawPhaseOptions();
    G.hand.forEach(c => expect(c.phases).toContain('block'));
  });

  test('never draws coach cards during block window', () => {
    drawPhaseOptions();
    G.hand.forEach(c => expect(c.type).not.toBe('coach'));
  });
});

describe('drawPhaseOptions — attack phase with coach', () => {
  beforeEach(() => {
    global.G = makeG({ phase: 'attack', blockWindow: false, defWindow: false, coachUsed: false });
    buildDeck();
  });

  test('all drawn cards include "attack" in phases (attack cards + coach cards qualify)', () => {
    // Coach cards have phases: ['defense','setting','attack'] — 'attack' is included.
    // Both attack and coach cards are valid in this phase, and both contain 'attack'.
    drawPhaseOptions();
    G.hand.forEach(c => expect(c.phases).toContain('attack'));
  });

  test('excludes coach cards when coachUsed=true', () => {
    G.coachUsed = true;
    drawPhaseOptions();
    G.hand.forEach(c => expect(c.type).not.toBe('coach'));
  });
});

describe('drawPhaseOptions — defense window', () => {
  beforeEach(() => {
    global.G = makeG({ phase: 'defense', blockWindow: false, defWindow: true, coachUsed: false });
    buildDeck();
  });

  test('draws only defense or coach cards when defWindow is true', () => {
    drawPhaseOptions();
    G.hand.forEach(c => {
      const valid = c.phases.includes('defense') || c.type === 'coach';
      expect(valid).toBe(true);
    });
  });
});

describe('drawPhaseOptions — deck recycling', () => {
  test('recycles discard pile when deck runs out mid-draw', () => {
    // Give a near-empty deck with only 1 matching card, rest in discard
    global.G = makeG({ phase: 'service', blockWindow: false, defWindow: false, coachUsed: false });
    const srv = CARDS_DB.find(c => c.type === 'service');
    G.deck    = [{ ...srv }];
    G.discard = [{ ...srv }, { ...srv }];

    drawPhaseOptions();

    // Should draw at least 1 (from deck) plus possibly more from recycled discard
    expect(G.hand.length).toBeGreaterThanOrEqual(1);
    G.hand.forEach(c => expect(c.phases).toContain('service'));
  });
});
