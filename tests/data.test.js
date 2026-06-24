// ─── tests/data.test.js ──────────────────────────────────────────────────────
// Validates static integrity of CARDS_DB and DEFENSE_QUALITY_RANGES.
// No game state or DOM needed — pure data assertions.

const { CARDS_DB, PHASE_NAMES, COMBO_SEQ, DEFENSE_QUALITY_RANGES } =
  require('../data.js');

const VALID_TYPES  = ['service', 'defense', 'setting', 'attack', 'block', 'coach'];
const VALID_LEVELS = ['basico', 'intermediario', 'avancado'];
const VALID_PHASES = ['service', 'defense', 'setting', 'attack', 'block'];
const BONUS_VALUES = ['energy2', 'atkBoost3', 'atkBoost6', 'aiDefMinus2', 'draw1'];

// ── CARDS_DB ─────────────────────────────────────────────────────────────────

describe('CARDS_DB — size', () => {
  test('has exactly 22 cards', () => {
    expect(CARDS_DB).toHaveLength(22);
  });

  test('type distribution is 3-6-3-5-3-2 (srv-def-set-atk-blk-cch)', () => {
    const counts = {};
    CARDS_DB.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    expect(counts.service).toBe(3);
    expect(counts.defense).toBe(6);
    expect(counts.setting).toBe(3);
    expect(counts.attack).toBe(5);
    expect(counts.block).toBe(3);
    expect(counts.coach).toBe(2);
  });
});

describe('CARDS_DB — schema', () => {
  test.each(CARDS_DB)('$name: has all required fields', (card) => {
    expect(typeof card.id).toBe('string');
    expect(card.id.length).toBeGreaterThan(0);
    expect(typeof card.name).toBe('string');
    expect(VALID_TYPES).toContain(card.type);
    expect(VALID_LEVELS).toContain(card.level);
    expect(typeof card.cost).toBe('number');
    expect(typeof card.power).toBe('number');
    expect(typeof card.desc).toBe('string');
    expect(Array.isArray(card.phases)).toBe(true);
    expect(card.phases.length).toBeGreaterThan(0);
  });

  test.each(CARDS_DB)('$name: cost and power are non-negative', (card) => {
    expect(card.cost).toBeGreaterThanOrEqual(0);
    expect(card.power).toBeGreaterThanOrEqual(0);
  });

  test.each(CARDS_DB)('$name: all phase values are valid', (card) => {
    card.phases.forEach(p => expect(VALID_PHASES).toContain(p));
  });

  test.each(CARDS_DB)('$name: bonus field is valid when present', (card) => {
    if (card.bonus !== undefined) {
      expect(BONUS_VALUES).toContain(card.bonus);
    }
  });

  test('all card IDs are unique', () => {
    const ids = CARDS_DB.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all card names are unique', () => {
    const names = CARDS_DB.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('CARDS_DB — type-specific rules', () => {
  test('coach cards include defense, setting, and attack phases', () => {
    CARDS_DB.filter(c => c.type === 'coach').forEach(c => {
      expect(c.phases).toContain('defense');
      expect(c.phases).toContain('setting');
      expect(c.phases).toContain('attack');
    });
  });

  test('coach cards do NOT include service or block phases', () => {
    CARDS_DB.filter(c => c.type === 'coach').forEach(c => {
      expect(c.phases).not.toContain('service');
      expect(c.phases).not.toContain('block');
    });
  });

  test('service cards only appear in service phase', () => {
    CARDS_DB.filter(c => c.type === 'service').forEach(c => {
      expect(c.phases).toEqual(['service']);
    });
  });

  test('block cards only appear in block phase', () => {
    CARDS_DB.filter(c => c.type === 'block').forEach(c => {
      expect(c.phases).toEqual(['block']);
    });
  });

  test('defense cards only appear in defense phase', () => {
    CARDS_DB.filter(c => c.type === 'defense').forEach(c => {
      expect(c.phases).toEqual(['defense']);
    });
  });
});

// ── DEFENSE_QUALITY_RANGES ────────────────────────────────────────────────────

describe('DEFENSE_QUALITY_RANGES — tiers present', () => {
  const EXPECTED_TIERS = [
    'ataque_dominante',
    'vantagem_ofensiva',
    'equilibrio',
    'vantagem_defensiva',
    'defesa_dominante',
  ];

  test('has exactly 5 tiers', () => {
    expect(Object.keys(DEFENSE_QUALITY_RANGES)).toHaveLength(5);
  });

  test.each(EXPECTED_TIERS)('tier "%s" exists', (tier) => {
    expect(DEFENSE_QUALITY_RANGES).toHaveProperty(tier);
  });
});

describe('DEFENSE_QUALITY_RANGES — tier schema', () => {
  test.each(Object.entries(DEFENSE_QUALITY_RANGES))(
    'tier "%s" has all required fields',
    (key, tier) => {
      expect(typeof tier.min).toBe('number');
      expect(typeof tier.max).toBe('number');
      expect(typeof tier.successRate).toBe('number');
      expect(typeof tier.nextAtkBonus).toBe('number');
      expect(typeof tier.desc).toBe('string');
      expect(typeof tier.emoji).toBe('string');
      expect(tier.min).toBeLessThanOrEqual(tier.max);
      expect(tier.successRate).toBeGreaterThanOrEqual(0);
      expect(tier.successRate).toBeLessThanOrEqual(1);
    }
  );
});

describe('DEFENSE_QUALITY_RANGES — values', () => {
  test('success rates match GDD spec', () => {
    expect(DEFENSE_QUALITY_RANGES.ataque_dominante.successRate).toBe(0.00);
    expect(DEFENSE_QUALITY_RANGES.vantagem_ofensiva.successRate).toBe(0.25);
    expect(DEFENSE_QUALITY_RANGES.equilibrio.successRate).toBe(0.95);
    expect(DEFENSE_QUALITY_RANGES.vantagem_defensiva.successRate).toBe(1.00);
    expect(DEFENSE_QUALITY_RANGES.defesa_dominante.successRate).toBe(1.00);
  });

  test('nextAtkBonus values match GDD spec', () => {
    expect(DEFENSE_QUALITY_RANGES.ataque_dominante.nextAtkBonus).toBe(-2);
    expect(DEFENSE_QUALITY_RANGES.vantagem_ofensiva.nextAtkBonus).toBe(-1);
    expect(DEFENSE_QUALITY_RANGES.equilibrio.nextAtkBonus).toBe(0);
    expect(DEFENSE_QUALITY_RANGES.vantagem_defensiva.nextAtkBonus).toBe(2);
    expect(DEFENSE_QUALITY_RANGES.defesa_dominante.nextAtkBonus).toBe(4);
  });

  test('gap boundaries match GDD spec', () => {
    const r = DEFENSE_QUALITY_RANGES;
    expect(r.ataque_dominante.max).toBe(-7);
    expect(r.vantagem_ofensiva.min).toBe(-6);
    expect(r.vantagem_ofensiva.max).toBe(-4);
    expect(r.equilibrio.min).toBe(-3);
    expect(r.equilibrio.max).toBe(3);
    expect(r.vantagem_defensiva.min).toBe(4);
    expect(r.vantagem_defensiva.max).toBe(6);
    expect(r.defesa_dominante.min).toBe(7);
  });

  test('extreme tiers use Infinity correctly', () => {
    expect(DEFENSE_QUALITY_RANGES.ataque_dominante.min).toBe(-Infinity);
    expect(DEFENSE_QUALITY_RANGES.defesa_dominante.max).toBe(Infinity);
  });
});

// ── COMBO_SEQ & PHASE_NAMES ──────────────────────────────────────────────────

describe('COMBO_SEQ', () => {
  test('is exactly [defense, setting, attack] in order', () => {
    expect(COMBO_SEQ).toEqual(['defense', 'setting', 'attack']);
  });
});

describe('PHASE_NAMES', () => {
  test('has display names for all 5 phases', () => {
    ['service', 'defense', 'setting', 'attack', 'block'].forEach(p => {
      expect(PHASE_NAMES).toHaveProperty(p);
      expect(typeof PHASE_NAMES[p]).toBe('string');
      expect(PHASE_NAMES[p].length).toBeGreaterThan(0);
    });
  });
});
