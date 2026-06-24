# Testing Guide — ASCENSION

## Quick Start

```bash
npm install        # install Jest (devDependencies only)
npm test           # run all tests once
npm run test:watch # re-run on file change (TDD)
npm run test:coverage # generate HTML coverage report
```

---

## Architecture

The game is **vanilla JS with browser globals** (no ES modules, no bundler).
Tests use a **Node.js + Jest** environment where:

1. `data.js` exports constants via a conditional `module.exports` (no-op in browser).
2. `combat.js` and `deck.js` do the same — and their functions read `CARDS_DB`,
   `DEFENSE_QUALITY_RANGES`, and `G` as **global variables**.
3. Each test file sets `global.CARDS_DB`, `global.DEFENSE_QUALITY_RANGES`, and
   `global.G` before calling any game function.

This means **no production file changes are needed** to add tests for a new
pure function — just export it at the bottom of its module.

---

## Test Files

| File | What it covers | Assertions |
|---|---|---|
| `tests/data.test.js` | Card schema, IDs unique, type/level/phase validity, DEFENSE_QUALITY_RANGES shape & values | ~35 |
| `tests/combat.test.js` | `getDefenseQuality` at every boundary, `_checkWinCondition` win/loss/draw cases | ~40 |
| `tests/deck.test.js` | `shuffle` purity, `buildDeck` size & composition, `clearHand` state, `drawPhaseOptions` phase filtering & coach exclusion | ~35 |

**Total: ~110 assertions.**

---

## What Is NOT Tested

These require a real DOM or timers — not worth mocking for this project stage:

| Code | Reason not unit-tested |
|---|---|
| `render.js` | 100% DOM manipulation |
| `audio.js` | Web Audio API |
| `ai.js` | Calls `setTimeout`, `render`, `startDefenseWindow` |
| `input.js` | Calls `render`, `sounds`, `document.querySelectorAll` |
| `multiplayer.js` | Requires PeerJS P2P network |
| `checkSet` / `endPoint` | Call `render`, `showEnd`, `showPointResult` |

When those functions grow more logic worth testing, extract pure helpers (like
`_checkWinCondition`) and test those.

---

## Adding a New Test

### 1 — New card in CARDS_DB
`data.test.js` already validates every card with `test.each(CARDS_DB)`.
Just add the card to `data.js` — the tests will pick it up automatically and
fail if any required field is missing.

### 2 — New defense tier in DEFENSE_QUALITY_RANGES
Update the assertions in `data.test.js`:
- `'has exactly 5 tiers'` → change the count
- `'tier "X" exists'` → add the new tier key
- `'success rates match GDD spec'` → add the new rate
- `'gap boundaries match GDD spec'` → add the new boundary

Then add gap values in `combat.test.js` to cover the new tier.

### 3 — New pure function in combat.js or deck.js
1. Add the function to `module.exports` at the bottom of the file.
2. Create a `describe` block in the matching test file.
3. Import with: `const { yourFn } = require('../combat.js');`

---

## CI / Merge Gate

The workflow `.github/workflows/ci.yml` runs on every push to `main` and every
PR targeting `main`. Jobs:

```
push / PR to main
       │
       ▼
  npm ci
       │
       ▼
  npm test --ci
       │
  pass? → merge allowed
  fail? → PR blocked
```

### Enabling Branch Protection (GitHub UI)

1. Go to **Settings → Branches → Add rule**.
2. Branch name: `main`.
3. Check: **Require status checks to pass before merging**.
4. Search for and add: `Run Test Suite`.
5. Check: **Require branches to be up to date before merging**.
6. Save.

After this, every PR to `main` must pass CI before it can be merged.

---

## Coverage Thresholds

`jest.config.js` enforces **≥ 70% line coverage** on the three testable modules
(`data.js`, `combat.js`, `deck.js`). CI will fail if coverage drops below this.

To see the current coverage:

```bash
npm run test:coverage
# open coverage/lcov-report/index.html in your browser
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ReferenceError: G is not defined` | Make sure the test file sets `global.G = makeG()` in `beforeEach` |
| `ReferenceError: CARDS_DB is not defined` | Add `global.CARDS_DB = require('../data.js').CARDS_DB` at the top of the test file |
| `Cannot find module '../combat.js'` | Confirm `module.exports` is at the bottom of `combat.js` |
| Tests pass locally but fail in CI | Check Node version (`node --version`) — CI uses Node 20 |
