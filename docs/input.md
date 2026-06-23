# input.js — Player input handling

## Purpose
Translates player UI actions into game state changes: card selection, card play,
reroll, combo tracking, and bonus application.

## Exports (globals)
| Function | Description |
|---|---|
| `canPlay(card)` | Returns true if the card is valid and affordable in the current context |
| `selectCard(idx)` | Toggles card selection in `G.selected` |
| `playCard()` | Executes the selected card — routes to service/defense/setting/attack logic |
| `rerollOption()` | Discards selected card, draws replacement (costs 1 energy) |
| `applyBonus(card)` | Applies the card's `bonus` effect to G state |
| `updateCombo(card)` | Advances or resets `G.comboIdx` based on card type |

## playCard() routing
```
phase === 'service'  → error check → passBall / SERVICE_ERROR + endPoint
phase === 'defense'  → advance to 'setting', drawPhaseOptions
phase === 'setting'  → advance to 'attack', drawPhaseOptions
phase === 'attack'   → compute total power, call resolvePlayerAttack()

total attack power = card.power + G.atkBoost + G.nextAttackBonus
  (G.atkBoost and G.nextAttackBonus are both consumed to 0 after use)
```

## applyBonus() keys
| bonus string | Effect |
|---|---|
| `energy1` | +1 energy |
| `energy2` | +2 energy |
| `atkBoost2/3/6` | +N to G.atkBoost |
| `draw1` | Triggers extra card draw (handled inline in playCard) |
| `aiDefMinus1/2` | +N to G.aiDefMinus (deducted from AI defense in resolvePlayerAttack) |

## Combo system (updateCombo)
```
COMBO_SEQ = ['defense', 'setting', 'attack']
comboIdx starts at 0.
- Card type matches COMBO_SEQ[comboIdx] → comboIdx++
- comboIdx reaches 3 → COMBO! G.atkBoost += 2, sounds.combo()
- Card type is 'support' → no change (doesn't break or advance)
- Card type is anything else (and not 'service') → comboIdx resets to 0
```

## Service error probability
```
errorChance = 0.05 + (card.power * 0.03)
  srv1 (power 3): 14% error
  srv2 (power 5): 20% error
  srv3 (power 1):  8% error
```
Error is 50/50 out vs net.
