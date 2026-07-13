// ─── tests/combat.test.js ────────────────────────────────────────────────────
// Tests gap-based defense resolution (getDefenseQuality) and win-condition
// logic (_checkWinCondition). No DOM or timers involved.

// DEFENSE_QUALITY_RANGES must be in global scope before combat.js is loaded
// because getDefenseQuality() reads it as a free variable (browser-global style).
const { DEFENSE_QUALITY_RANGES } = require('../data.js');
global.DEFENSE_QUALITY_RANGES = DEFENSE_QUALITY_RANGES;

const { getDefenseQuality, _checkWinCondition } = require('../combat.js');

// ── getDefenseQuality ─────────────────────────────────────────────────────────

describe('getDefenseQuality — tier classification', () => {
  // ataque_dominante: gap <= -7
  test('gap -10 → ataque_dominante', () => {
    expect(getDefenseQuality(-10).quality).toBe('ataque_dominante');
  });

  test('gap -7 → ataque_dominante (exact boundary)', () => {
    expect(getDefenseQuality(-7).quality).toBe('ataque_dominante');
  });

  // vantagem_ofensiva: -6 to -4
  test('gap -6 → vantagem_ofensiva (boundary)', () => {
    expect(getDefenseQuality(-6).quality).toBe('vantagem_ofensiva');
  });

  test('gap -5 → vantagem_ofensiva', () => {
    expect(getDefenseQuality(-5).quality).toBe('vantagem_ofensiva');
  });

  test('gap -4 → vantagem_ofensiva (boundary)', () => {
    expect(getDefenseQuality(-4).quality).toBe('vantagem_ofensiva');
  });

  // equilibrio: -3 to +3
  test('gap -3 → equilibrio (boundary)', () => {
    expect(getDefenseQuality(-3).quality).toBe('equilibrio');
  });

  test('gap 0 → equilibrio (exact zero)', () => {
    expect(getDefenseQuality(0).quality).toBe('equilibrio');
  });

  test('gap +3 → equilibrio (boundary)', () => {
    expect(getDefenseQuality(3).quality).toBe('equilibrio');
  });

  // vantagem_defensiva: +4 to +6
  test('gap +4 → vantagem_defensiva (boundary)', () => {
    expect(getDefenseQuality(4).quality).toBe('vantagem_defensiva');
  });

  test('gap +5 → vantagem_defensiva', () => {
    expect(getDefenseQuality(5).quality).toBe('vantagem_defensiva');
  });

  test('gap +6 → vantagem_defensiva (boundary)', () => {
    expect(getDefenseQuality(6).quality).toBe('vantagem_defensiva');
  });

  // defesa_dominante: >= +7
  test('gap +7 → defesa_dominante (boundary)', () => {
    expect(getDefenseQuality(7).quality).toBe('defesa_dominante');
  });

  test('gap +20 → defesa_dominante (extreme)', () => {
    expect(getDefenseQuality(20).quality).toBe('defesa_dominante');
  });
});

describe('getDefenseQuality — successRate per tier', () => {
  test('ataque_dominante has 0% success', () => {
    expect(getDefenseQuality(-10).successRate).toBe(0);
    expect(getDefenseQuality(-7).successRate).toBe(0);
  });

  test('vantagem_ofensiva has 25% success', () => {
    expect(getDefenseQuality(-6).successRate).toBe(0.25);
    expect(getDefenseQuality(-4).successRate).toBe(0.25);
  });

  test('equilibrio has 95% success', () => {
    expect(getDefenseQuality(0).successRate).toBe(0.95);
    expect(getDefenseQuality(-3).successRate).toBe(0.95);
    expect(getDefenseQuality(3).successRate).toBe(0.95);
  });

  test('vantagem_defensiva has 97% success', () => {
    expect(getDefenseQuality(4).successRate).toBe(0.97);
    expect(getDefenseQuality(6).successRate).toBe(0.97);
  });

  test('defesa_dominante has 97% success', () => {
    expect(getDefenseQuality(7).successRate).toBe(0.97);
    expect(getDefenseQuality(20).successRate).toBe(0.97);
  });
});

describe('getDefenseQuality — nextAtkBonus per tier', () => {
  test('ataque_dominante carries -2 attack penalty', () => {
    expect(getDefenseQuality(-10).nextAtkBonus).toBe(-2);
  });

  test('vantagem_ofensiva carries -1 attack penalty', () => {
    expect(getDefenseQuality(-5).nextAtkBonus).toBe(-1);
  });

  test('equilibrio carries 0 bonus (neutral)', () => {
    expect(getDefenseQuality(0).nextAtkBonus).toBe(0);
  });

  test('vantagem_defensiva carries +2 attack bonus', () => {
    expect(getDefenseQuality(5).nextAtkBonus).toBe(2);
  });

  test('defesa_dominante carries +4 attack bonus', () => {
    expect(getDefenseQuality(10).nextAtkBonus).toBe(4);
  });
});

describe('getDefenseQuality — result shape', () => {
  const testGaps = [-10, -6, 0, 5, 10];

  test.each(testGaps)('gap %d always returns an object with required fields', (gap) => {
    const result = getDefenseQuality(gap);
    expect(result).toHaveProperty('quality');
    expect(result).toHaveProperty('successRate');
    expect(result).toHaveProperty('nextAtkBonus');
    expect(result).toHaveProperty('desc');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('min');
    expect(result).toHaveProperty('max');
  });

  test('quality key in result is always a known tier', () => {
    const VALID_TIERS = Object.keys(DEFENSE_QUALITY_RANGES);
    testGaps.forEach(gap => {
      expect(VALID_TIERS).toContain(getDefenseQuality(gap).quality);
    });
  });
});

// ── _checkWinCondition ────────────────────────────────────────────────────────

describe('_checkWinCondition — no winner yet', () => {
  test('0-0: no winner', () => expect(_checkWinCondition(0, 0)).toBeNull());
  test('4-4: no winner (both at 4)', () => expect(_checkWinCondition(4, 4)).toBeNull());
  test('4-0: no winner (not reached WIN)', () => expect(_checkWinCondition(4, 0)).toBeNull());
  test('5-4: no winner (only 1-point lead)', () => expect(_checkWinCondition(5, 4)).toBeNull());
  test('5-5: no winner (tied at WIN)', () => expect(_checkWinCondition(5, 5)).toBeNull());
  test('6-5: no winner (only 1-point lead at 6)', () => expect(_checkWinCondition(6, 5)).toBeNull());
});

describe('_checkWinCondition — player wins', () => {
  test('5-3: player wins (exactly WIN with 2-lead)', () => {
    expect(_checkWinCondition(5, 3)).toBe('player');
  });

  test('5-0: player wins (WIN with 5-lead)', () => {
    expect(_checkWinCondition(5, 0)).toBe('player');
  });

  test('6-4: player wins (above WIN with 2-lead)', () => {
    expect(_checkWinCondition(6, 4)).toBe('player');
  });

  test('7-5: player wins (deuce scenario)', () => {
    expect(_checkWinCondition(7, 5)).toBe('player');
  });

  test('10-8: player wins (extended deuce)', () => {
    expect(_checkWinCondition(10, 8)).toBe('player');
  });
});

describe('_checkWinCondition — ai wins', () => {
  test('3-5: ai wins', () => expect(_checkWinCondition(3, 5)).toBe('ai'));
  test('0-5: ai wins', () => expect(_checkWinCondition(0, 5)).toBe('ai'));
  test('4-6: ai wins', () => expect(_checkWinCondition(4, 6)).toBe('ai'));
  test('5-7: ai wins (deuce)', () => expect(_checkWinCondition(5, 7)).toBe('ai'));
});

describe('_checkWinCondition — custom WIN value', () => {
  test('WIN=3: (3,1) → player wins', () => {
    expect(_checkWinCondition(3, 1, 3)).toBe('player');
  });

  test('WIN=3: (2,1) → null', () => {
    expect(_checkWinCondition(2, 1, 3)).toBeNull();
  });

  test('WIN=3: (1,3) → ai wins', () => {
    expect(_checkWinCondition(1, 3, 3)).toBe('ai');
  });
});
