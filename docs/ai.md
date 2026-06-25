# ai.js — Artificial intelligence

## Purpose
AI decision-making: card selection, serve, rally sequencing, and attack power calculation.
The AI is a full mirror of the Player (same phases, same card types, same energy rules).

## Exports (globals)
| Function | Description |
|---|---|
| `aiTurn()` | Entry point — orchestrates AI's full turn (serve or attack sequence) |

## Internal helpers
| Function | Description |
|---|---|
| `getAIPlay(phase, maxCost?)` | Picks a card for the AI; may spend energy to "draw" better options |

---

## G properties used by this module
| Property | Read | Write |
|---|---|---|
| `G.aiEnergy` | ✓ | ✓ |
| `G.aiAtkPow` | — | ✓ |
| `G.aiNextAtkBonus` | ✓ | ✓ (consumed to 0 after use) |
| `G.aiJustDefended` | ✓ | ✓ |
| `G.aiDifficulty` | ✓ | — |
| `G.deck` | ✓ | — |
| `G.discard` | ✓ | — |
| `G.phase` | — | — |
| `G.possession` | ✓ | ✓ |
| `G.locked` | — | ✓ |
| `G.pPts`, `G.aPts` | ✓ | ✓ (service error: pPts++) |
| `G.nextServer` | — | ✓ (service error: set to 'player') |
| `G.ballFx` | — | ✓ (set before endPoint on serve error) |
| `G.comboIdx` | — | — (AI uses local comboCount) |
| `G.nextAttackBonus` | — | ✓ (via quality from startDefenseWindow callbacks) |
| `G.gameMode` | ✓ | — |
| `G.log` | — | ✓ (via log()) |

---

## AI difficulty scaling

### getAIPlay() — draw chance
```js
const drawChances = [0.50, 0.30, 0.10];  // G.aiDifficulty: 0=easy, 1=medium, 2=hard
```
- Higher difficulty → lower draw chance → AI keeps more energy
- On "draw": spend 1 aiEnergy to pick a different card from remaining pool

### getAIPlay() — card selection
```js
if (G.aiDifficulty === 2) {
  possible.sort((a, b) => b.power - a.power); // Hard: always picks highest power
}
const picked = possible[0]; // Easy/medium: random after sort
// (For easy/medium, possible is shuffled before getAIPlay is called)
```

### Block chance (in combat.js:resolvePlayerAttack)
```js
const blockChances = [0.30, 0.50, 0.70]; // [easy, medium, hard]
```
AI blocks player attack with this probability. 60% is default hardcoded for player blocking AI.

---

## AI turn flow
```
aiTurn()
  ↓ G.locked = true, 900ms delay (simulates thinking)
  ├── possession === 'ai' (AI serves)
  │     → getAIPlay('service')
  │     → error chance: 5% + power×3%
  │     → on error: set G.ballFx (out/net) + endPoint
  │     → on success: ballSeq([{tx:24, ty:45, at:0}]) + startDefenseWindow(true)
  │       (bola animates to player receptor, IA serve reaches)
  └── possession !== 'ai' (AI attacks after winning defense)
        1. Defense (if !aiJustDefended):
           → getAIPlay('defense')
           → consume G.aiNextAtkBonus
        2. Setting:
           → getAIPlay('setting')  (or freeball if aiEnergy = 0)
           → atkBoost from card.bonus (atkBoost3/atkBoost6)
           → comboCount++
        3. Attack:
           → getAIPlay('attack')  (or freeball)
           → power = card.power + atkBoost + (comboCount >= 3 ? 2 : 0) + G.aiNextAtkBonus
           → G.aiNextAtkBonus = 0  (consumed)
           → open blockWindow for player
```

**Serve choreography** (when AI serves successfully):
- Ball animates to player receptor at `{tx:24, ty:45}` (left side, back/receiver)
- No further ballSeq — player's reception/set/attack are click-driven, so moveBall() resumes normal phase-based logic


---

## Attack power formula
```
aiAtkPow = atkPlay.card.power
          + atkBoost          (from setting card: atkBoost3 or atkBoost6)
          + (comboCount >= 3 ? 2 : 0)   (full combo bonus)
          + G.aiNextAtkBonus  (from AI's own defense quality last touch)
```
`G.aiAtkPow` is set for use in `render.js:renderResolve()` (shows attacker power in defense panel).

---

## AI capabilities
- **Serves** with error chance (same formula as player)
- **Defends** with defense card (considers aiDefMinus penalty)
- **Blocks** player attacks (probability depends on `G.aiDifficulty`)
- **Attacks** with full defense → setting → attack sequence
- **Freeball** when aiEnergy hits 0 mid-sequence

---

## Do NOT modify
- The 900ms outer `setTimeout` — removing it causes render/state timing issues
- `G.aiJustDefended` flag — prevents double-counting defense in local combo tracking
- `G.aiNextAtkBonus = 0` reset — one-shot consume; do not carry between attacks
