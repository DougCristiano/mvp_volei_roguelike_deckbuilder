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
| `G.comboIdx` | — | ✓ (set to 1 in resolveDefense; reset on freeball) |
| `G.comboTags` | — | ✓ (seeded with defense card's tag in resolveDefense) |
| `G.costDiscount` | ✓ | ✓ (consumed via `payCost()` in resolveDefense/resolveBlock) |
| `G.aiJustDefended` | ✓ | ✓ |
| `G.isDefendingServe` | — | ✓ |
| `G.defenseQuality` | — | ✓ |
| `G.coachUsed` | — | ✓ (set in resolveDefense/resolveBlock) |
| `G.freeBlockUsed` | ✓ | ✓ (A Muralha passive) |
| `G.ballFx` | — | ✓ (set before endPoint to show final ball position) |
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
| `vantagem_defensiva` | +4 to +6 | 97% | +2 |
| `defesa_dominante` | ≥ +7 | 97% | +4 |

---

## Coach handling in resolveDefense()
```
1. Loop selected: process coach cards first
   - G.coachUsed = true
   - G.energy -= payCost(coach.cost)
   - applyBonus(coach)   ← energy restored BEFORE defense cards deducted
   - if draw1: G.nextPhaseExtraCard = true
2. Loop selected: process defense cards (type !== 'coach')
   - defPow += card.power
   - G.energy -= payCost(card.cost)
   - applyBonus(card)    ← fixed: previously only coach cards got this call, so def3/def8's energy2 never fired
   - G.comboTags = [card.tag]; G.comboIdx = 1
   - if card.bonus === 'energyRefund1': tracked for the success branch (see below)
```

## Coach handling in resolveBlock()
```
blockIdx = G.selected.find(i => G.hand[i].type !== 'coach')
coachIdx = G.selected.find(i => G.hand[i].type === 'coach')
if coachIdx exists:
  G.coachUsed = true; G.energy -= payCost(coach.cost); applyBonus(coach)
Then resolve block with blockCard: G.energy -= payCost(blockCost); applyBonus(blockCard)
```

---

## Block probabilities — Player's block (resolveBlock)
| Roll | Probability | Outcome |
|---|---|---|
| < 0.20 | 20% | Direct point (player wins) |
| < 0.40 | 20% | Block out (AI wins) |
| < 0.70 | 30% | Soften (attack halved → defense window) |
| else | 30% | Continue (rally, AI attacks) |

**A Muralha passive**: if `!G.freeBlockUsed`, first block of the point costs 0 (`G.freeBlockUsed = true` after). Every subsequent block costs `-team.passives.blockCostReduction` (currently 1, min 0).

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
AI card pools in `aiResolveBlock()`/`aiDefendAgainst()` exclude `locked: true` cards —
the AI plays from the same pool as the player.

---

## Campaign passives (data-driven via getCampaignTeam())
Passives are read from `CAMPAIGN_TEAMS[team].passives` — no hardcoded team IDs in combat.js.

```js
// A Muralha — freeBlock (first use) + blockCostReduction (every use after)
const team = getCampaignTeam();
if (team?.passives?.freeBlock && !G.freeBlockUsed) { blockCost = 0; G.freeBlockUsed = true; }
else if (team?.passives?.blockCostReduction) { blockCost = Math.max(0, blockCost - team.passives.blockCostReduction); }

// A Fortaleza — defGapBonus (structural: added directly to the gap before tier lookup)
//            + defRateFloor (guaranteed minimum successRate bump when the gap shift alone
//              doesn't already land in equilibrio/vantagem_defensiva/defesa_dominante)
const defGapBonus = team?.passives?.defGapBonus ?? 0;
const gap = defPow - G.aiAtkPow + defGapBonus;
const rateFloor = team?.passives?.defRateFloor ?? 0;
if (rateFloor > 0 && quality.successRate < 0.95) successRate = Math.min(1.0, quality.successRate + rateFloor);
```

To add a new passive that affects combat, add the key to the team's `passives` object in `campaign.js` and read it here via `getCampaignTeam()?.passives?.newKey`.

## Cost payment and discounts (`payCost()`)
Every energy deduction in `resolveDefense()`/`resolveBlock()` goes through `payCost(cost)` (defined in `input.js`), which consumes any pending `G.costDiscount` set by the `costReduceNext1` bonus (`set5`, `blk5` in `data.js`).

## energyRefund1 (def9 "Recepção Perfeita")
In `resolveDefense()`'s success branch: if the resolved defense card had `bonus === 'energyRefund1'` and `quality.quality` is `vantagem_defensiva` or `defesa_dominante`, refund 1 energy (capped at `G.maxEnergy`).

---

## Attack error — player (resolvePlayerAttack)
```
errorChance = 0.05 + (pow × 0.02)   // pow = TOTAL power (base + atkBoost + nextAttackBonus + team bonus)
If triggered → attack goes out → point to AI
Example: base power 6 card boosted to 12 total → 5% + 24% = 29% error
```
Note: prior to 2026-07-13 this used `attackCard.power` (base card power only), so boosted attacks
carried the same error chance as unboosted ones. Fixed to use `pow` (the total actually resolved),
consistent with the service error formula in `input.js`/`ai.js` (which already uses total power played).

---

## Ball animation outcomes (G.ballFx)

Before each `endPoint()`, set `G.ballFx = {tx, ty}` to show where the ball ends up visually:

| Outcome | ballFx | Location |
|---------|--------|----------|
| Serve out (player) | `{tx:96, ty:33}` | Behind IA's baseline (long serve) |
| Serve net (player) | `{tx:45, ty:72}` | Stops at net, doesn't cross |
| Serve out (IA) | `{tx:4, ty:33}` | Behind player's baseline |
| Serve net (IA) | `{tx:55, ty:72}` | Stops at net, doesn't cross |
| Block point (player) | `{tx:74, ty:33}` | Floor of IA's court (on line) |
| Block out (player) | `{tx:4, ty:33}` | Out behind player's baseline |
| Block point (IA) | `{tx:26, ty:33}` | Floor of player's court (on line) |
| Block out (IA) | `{tx:96, ty:33}` | Out behind IA's baseline |
| Attack point (player) | `{tx:74, ty:33}` | Floor of IA's court (on line) |
| Attack out (player) | `{tx:96, ty:33}` | Out behind IA's baseline |
| Defense fail (player) | `{tx:26, ty:33}` | Floor of player's court (on line) |

`G.ballFx` is cleared by `startPoint()` so next point has clean state.

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
