# combat.js — Combat resolution system

## Purpose
All logic that determines the outcome of a rally: defense quality, block resolution,
player vs AI attack/defense, scoring, and set/match end.

## Exports (globals)
| Function | Description |
|---|---|
| `getDefenseQuality(gap)` | Maps a gap value to a quality tier object |
| `checkFreeball()` | Triggers a freeball if player energy hits 0 mid-rally |
| `passBall(forced, isServe)` | Transfers possession to AI/opponent |
| `resolveBlock()` | Resolves player's block attempt |
| `startDefenseWindow(isServe)` | Opens the 15s defense decision window |
| `resolveDefense()` | Resolves player's selected defense cards |
| `autoResolve()` | Timer timeout: resolve defense with 0 power |
| `resolvePlayerAttack(pow, card)` | Resolves player attack against AI defense |
| `endPoint(result, desc)` | Marks point done, triggers sound, calls checkSet |
| `checkSet(result, desc)` | Applies scoring; ends set/match if thresholds hit |
| `tickBlockTimer()` | Block timer interval callback |
| `tickDefTimer()` | Defense timer interval callback |

## Defense quality flow (5-tier GDD system)
```
resolveDefense() / resolvePlayerAttack()
  ↓
  gap = defPow - attackPow
  ↓
  getDefenseQuality(gap) → { quality, successRate, nextAtkBonus, ... }
  ↓
  Math.random() < successRate ?
    YES → rally continues, G.nextAttackBonus = nextAtkBonus
    NO  → point to opponent
```

## Resolution tiers (gap = defPow − attackPow)
| Tier key | Gap range | Success | nextAtkBonus | Description |
|---|---|---|---|---|
| `ataque_dominante` | ≤ -7 | 0% | -2 | Attack dominates — direct point |
| `vantagem_ofensiva` | -6 to -4 | 25% | -1 | Attack advantage — partial chance |
| `equilibrio` | -3 to +3 | 95% | 0 | Balanced — defense likely succeeds |
| `vantagem_defensiva` | +4 to +6 | 100% | +2 | Defense advantage — counter ready |
| `defesa_dominante` | ≥ +7 | 100% | +4 | Perfect defense — strong counter |

## Block outcome probabilities (resolveBlock)
| Roll | Probability | Outcome |
|---|---|---|
| < 0.20 | 20% | Direct point for player |
| < 0.40 | 20% | Block goes out (point for AI) |
| < 0.70 | 30% | Soften (aiAtkPow halved, then defense window) |
| else   | 30% | Block touched, AI recovers |

## Scoring constants
- `WIN = 5` points (hardcoded — see DT-04 in AGENT.md)
- Set requires WIN points with ≥2 lead
- Match ends at 1 set (MVP — see Backlog)

## Key invariants
- `endPoint()` is idempotent (returns early if `G.pointDone` is already true).
- `checkSet()` only sends `POINT_END` multiplayer packet when `!G.isNetworkReceiver`.
- `G.nextAttackBonus` is consumed (set to 0) by `input.js:playCard()` when the attack is played.
- `G.aiNextAtkBonus` is consumed by `ai.js:aiTurn()` after computing attack power.
- `autoResolve()` sends `quality: 'ataque_dominante'` (not 'miss') in multiplayer packet.
