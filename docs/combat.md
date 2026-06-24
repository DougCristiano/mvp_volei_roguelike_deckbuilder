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
| `aiResolveBlock(pow, attackCard)` | Resolves AI's block attempt against player attack |
| `aiDefendAgainst(pow, attackCard)` | Resolves AI's defense against player attack |
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

## Block outcome probabilities (Player's block)
| Roll | Probability | Outcome |
|---|---|---|
| < 0.20 | 20% | Direct point (player) |
| < 0.40 | 20% | Block goes out (point to AI) |
| < 0.70 | 30% | Soften (attack power halved, then defense window) |
| else   | 30% | Block touched, rally continues to AI attack |

## Block outcome probabilities (AI's block against player attack)
| Roll | Probability | Outcome |
|---|---|---|
| < 0.20 | 20% | Direct point (AI) |
| < 0.40 | 20% | Block goes out (point to player) |
| else   | 60% | Successful block (attack power halved to 50%, AI defends) |

## AI decision to block
- **60% chance**: AI attempts to block when player attacks
- **40% chance**: AI skips block, goes straight to defense

## Attack error (player)
- **Chance**: 5% base + (card.power × 2%)
- If triggered: attack goes out → point to AI
- Example: power 3 card = ~11% error chance; power 9 card = ~23% error chance

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
