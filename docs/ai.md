# ai.js — Artificial intelligence

## Purpose
AI decision-making: card selection, serve, rally sequencing, and attack power calculation.

## Exports (globals)
| Function | Description |
|---|---|
| `aiTurn()` | Entry point — orchestrates the AI's full turn (serve or attack sequence) |

## Internal helpers
| Function | Description |
|---|---|
| `getAIPlay(phase, maxCost)` | Picks a random affordable card; 30% chance to spend +1 energy "drawing" |

## AI turn flow
```
aiTurn()
  ↓ 900ms delay (simulates thinking)
  ├── targetPhase === 'service'
  │     → getAIPlay('service')
  │     → error chance (5% + power*3%) → endPoint win/loss
  │     → success → startDefenseWindow(true)
  └── targetPhase === 'attack'
        → getAIPlay('defense') [unless aiJustDefended]
        → getAIPlay('setting')  [may add atkBoost]
        → getAIPlay('attack')   [or freeball if no card]
        → power = card.power + atkBoost + comboBonus + G.aiNextAtkBonus
        → open blockWindow for player
```

## Attack power formula
```
power = atkPlay.card.power
      + atkBoost          (from setting card bonus)
      + (comboCount >= 3 ? 2 : 0)   (full combo bonus)
      + G.aiNextAtkBonus  (from AI's own defense quality last touch)
```

## How to improve the AI
1. **Weighted card selection**: in `getAIPlay()`, replace random pick with weighted pick based on card power relative to G.energy remaining.
2. **Adaptive strategy**: check score ratio (`G.aPts / G.pPts`) and select more aggressive cards when losing.
3. **Energy management**: avoid drawing (30% chance) when energy is already low.
4. **Setting bonus awareness**: prefer set2 (atkBoost6) when energy allows, for guaranteed power spike.

## Do NOT modify
- The 900ms outer `setTimeout` — removing it causes render issues (UI not ready).
- `G.aiJustDefended` flag — checked here to avoid double-counting defense in combo.
- `G.aiNextAtkBonus = 0` reset after computing power — this is a one-shot consume.
