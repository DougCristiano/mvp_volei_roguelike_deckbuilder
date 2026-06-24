# combat.js — Combat resolution system

## Purpose
All logic that determines the outcome of a rally: defense quality, block resolution,
player vs AI attack/defense, scoring, set/match end. Also owns timers and freeballl.

## Exports (globals)
| Function | Description |
|---|---|
| `getDefenseQuality(gap)` | Maps a gap value to a quality tier object from DEFENSE_QUALITY_RANGES |
| `checkFreeball()` | If player energy is 0, forces a freeball (ball passed, +2 energy) |
| `passBall(forced, isServe)` | Transfers possession to AI; triggers aiTurn() or defense window |
| `resolveBlock()` | Resolves player's block attempt against AI attack |
| `aiResolveBlock(pow, attackCard)` | AI's block attempt against player attack |
| `aiDefendAgainst(pow, attackCard)` | AI's defense resolution after player attack |
| `startDefenseWindow(isServe)` | Opens 15s defense decision window for player |
| `resolveDefense()` | Resolves player's selected defense cards |
| `autoResolve()` | Timer timeout: resolve defense at 0 power (defense fails) |
| `resolvePlayerAttack(pow, card)` | Full AI response to player attack (block + defense) |
| `endPoint(result, desc)` | Marks point done, plays sound, calls checkSet |
| `checkSet(result, desc)` | Applies scoring, triggers rewards/end screen |
| `tickBlockTimer()` | Block countdown interval callback |
| `tickDefTimer()` | Defense countdown interval callback |

---

## G properties used by this module
| Property | Read | Write |
|---|---|---|
| `G.selected` | ✓ | — |
| `G.hand` | ✓ | ✓ (splice in resolveBlock) |
| `G.energy` | ✓ | ✓ |
| `G.aiEnergy` | ✓ | ✓ |
| `G.phase` | ✓ | ✓ |
| `G.possession` | ✓ | ✓ |
| `G.locked` | — | ✓ |
| `G.pointDone` | ✓ | ✓ |
| `G.defWindow` | ✓ | ✓ |
| `G.blockWindow` | ✓ | ✓ |
| `G.pPts`, `G.aPts` | ✓ | ✓ |
| `G.pSets`, `G.aSets` | ✓ | ✓ |
| `G.aiAtkPow` | — | ✓ |
| `G.aiDefMinus` | ✓ | ✓ (consumed to 0) |
| `G.aiNextAtkBonus` | ✓ | ✓ |
| `G.nextAttackBonus` | ✓ | ✓ |
| `G.nextServer` | ✓ | ✓ |
| `G.comboIdx` | — | ✓ (reset on freeball) |
| `G.aiJustDefended` | ✓ | ✓ |
| `G.isDefendingServe` | — | ✓ |
| `G.defenseQuality` | — | ✓ |
| `G.coachUsed` | — | ✓ (set in resolveDefense/resolveBlock) |
| `G.freeBlockUsed` | ✓ | ✓ (A Muralha passive) |
| `G.campaignTeam` | ✓ | — |
| `G.gameMode` | ✓ | — |
| `G.aiDifficulty` | ✓ | — |
| `G.isNetworkReceiver` | ✓ | ✓ |
| `G.blockTimerVal/blockInterval` | ✓ | ✓ |
| `G.defTimerVal/defInterval` | ✓ | ✓ |

---

## Defense quality system (5-tier)
```
gap = defenderPower − attackerPower
getDefenseQuality(gap) → tier object
Math.random() < tier.successRate → defense succeeds
Carry: G.nextAttackBonus (player) or G.aiNextAtkBonus (AI) = tier.nextAtkBonus
```

| Tier key | Gap | Success | nextAtkBonus |
|---|---|---|---|
| `ataque_dominante` | ≤ -7 | 0% | -2 |
| `vantagem_ofensiva` | -6 to -4 | 25% | -1 |
| `equilibrio` | -3 to +3 | 95% | 0 |
| `vantagem_defensiva` | +4 to +6 | 100% | +2 |
| `defesa_dominante` | ≥ +7 | 100% | +4 |

---

## Coach handling in resolveDefense()
```
1. Loop selected: process coach cards first
   - G.coachUsed = true
   - G.energy -= coach.cost
   - applyBonus(coach)   ← energy restored BEFORE defense cards deducted
   - if draw1: G.nextPhaseExtraCard = true
2. Loop selected: process defense cards (type !== 'coach')
   - defPow += card.power
   - G.energy -= card.cost
```

## Coach handling in resolveBlock()
```
blockIdx = G.selected.find(i => G.hand[i].type !== 'coach')
coachIdx = G.selected.find(i => G.hand[i].type === 'coach')
if coachIdx exists:
  G.coachUsed = true; G.energy -= coach.cost; applyBonus(coach)
Then resolve block with blockCard
```

---

## Block probabilities — Player's block (resolveBlock)
| Roll | Probability | Outcome |
|---|---|---|
| < 0.20 | 20% | Direct point (player wins) |
| < 0.40 | 20% | Block out (AI wins) |
| < 0.70 | 30% | Soften (attack halved → defense window) |
| else | 30% | Continue (rally, AI attacks) |

**A Muralha passive**: if `G.campaignTeam === 'muralha' && !G.freeBlockUsed`:
- Block costs 0 energy
- `G.freeBlockUsed = true` after

## Block probabilities — AI's block (aiResolveBlock)
| Roll | Probability | Outcome |
|---|---|---|
| < 0.20 | 20% | AI direct point |
| < 0.40 | 20% | Block out (player wins) |
| else | 60% | Successful block (power halved → AI defends) |

## AI decision to block (resolvePlayerAttack)
```js
const blockChances = [0.30, 0.50, 0.70];  // indexed by G.aiDifficulty
const aiWillBlock = Math.random() < blockChances[G.aiDifficulty ?? 1];
```

---

## A Fortaleza passive (resolveDefense)
```js
if (G.campaignTeam === 'fortaleza') {
  successRate = Math.min(1.0, quality.successRate + 0.05);
}
```
Applied to player defense quality calculation only.

---

## Attack error — player (resolvePlayerAttack)
```
errorChance = 0.05 + (card.power × 0.02)
If triggered → attack goes out → point to AI
Example: power 9 card → 5% + 18% = 23% error
```

---

## Scoring (checkSet)
- `WIN = 5` points (hardcoded)
- Set requires WIN points with ≥2 lead (deuce until +2)
- Campaign mode: `showRewards()` after win (not `showEnd()`) until final match
- Match ends when pSets or aSets reaches WIN_SETS (2 in best-of-3)

---

## Key invariants
- `endPoint()` is idempotent (returns early if `G.pointDone` is already true)
- `checkSet()` only sends `POINT_END` packet when `!G.isNetworkReceiver`
- `G.nextAttackBonus` consumed to 0 in `input.js:playCard()` attack phase
- `G.aiNextAtkBonus` consumed to 0 in `ai.js:aiTurn()` before attack
- `G.aiDefMinus` consumed to 0 after use in resolvePlayerAttack
- `autoResolve()` sends `quality: 'ataque_dominante'` in multiplayer packet (not 'miss')
