# input.js — Player input handling

## Purpose
Translates player UI actions into game state changes: card selection, card play,
reroll, combo tracking, and bonus application. Enforces the 1-phase + 1-coach combo system.

## Exports (globals)
| Function | Description |
|---|---|
| `canPlay(card)` | Returns true if the card is valid and affordable in the current context (coach requires phase card) |
| `selectCard(idx)` | Toggles card selection in `G.selected`, enforcing max 2 cards (1 phase + 1 coach) |
| `playCard()` | Executes the selected card(s) — applies coach bonus first, then phase card |
| `rerollOption()` | Discards selected card, draws replacement (costs 1 energy) |
| `applyBonus(card)` | Applies the card's `bonus` effect to G state |
| `updateCombo(card)` | Advances or resets `G.comboIdx` based on card type (coach doesn't break/advance) |

## selectCard() behavior (1 phase + 1 coach combo)
```
Goal: Allow max 2 cards in G.selected at all times
- If card is coach:
  - Must have a phase card already selected (canPlay checks this)
  - Append to G.selected
- If card is phase card:
  - Replace any existing phase card, preserve existing coach (if present)
  - G.selected = [coachIdx || empty] + [phaseIdx]
- Deselect:
  - If deselecting phase card → clear all (coach can't be alone)
  - If deselecting coach → just remove coach
```

## playCard() routing
```
1. Separate phase and coach cards from G.selected
2. Validate that phase card exists (obliga)
3. Apply coach bonus (energy restored BEFORE phase card cost debit)
4. Set G.coachUsed = true, set flag for next phase if draw1
5. Clear hand, discard both cards
6. Route phase card by phase:
   - 'service' → error check → passBall / SERVICE_ERROR + endPoint
   - 'defense' → advance to 'setting', drawPhaseOptions
   - 'setting' → advance to 'attack', drawPhaseOptions
   - 'attack' → compute total power, call resolvePlayerAttack()

total attack power = card.power + G.atkBoost + G.nextAttackBonus
  (G.atkBoost and G.nextAttackBonus are both consumed to 0 after use)
```

## applyBonus() keys
| bonus string | Effect |
|---|---|
| `energy1` | +1 energy |
| `energy2` | +2 energy (applied BEFORE phase card cost debit) |
| `atkBoost2/3/6` | +N to G.atkBoost |
| `draw1` | Sets G.nextPhaseExtraCard flag (coach guaranteed on next draw) |
| `aiDefMinus1/2` | +N to G.aiDefMinus (deducted from AI defense in resolvePlayerAttack) |

## Combo system (updateCombo)
```
COMBO_SEQ = ['defense', 'setting', 'attack']
comboIdx starts at 0.
- Card type matches COMBO_SEQ[comboIdx] → comboIdx++
- comboIdx reaches 3 → COMBO! G.atkBoost += 2, sounds.combo()
- Card type is 'coach' → no change (doesn't break or advance)
- Card type is anything else (and not 'service') → comboIdx resets to 0
```

**Important**: Coach cards are ignored by combo tracking — they're modifiers, not part of the sequence.

## Service error probability
```
errorChance = 0.05 + (card.power * 0.03)
  srv1 (power 3): 14% error
  srv2 (power 5): 20% error
  srv3 (power 1):  8% error
```
Error is 50/50 out vs net.
