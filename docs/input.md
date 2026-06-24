# input.js — Player input handling

## Purpose
Translates player UI actions into game state changes: card selection, card play, reroll,
bonus application, combo tracking. Enforces the 1-phase + 1-coach combo selection constraint.

## Exports (globals)
| Function | Description |
|---|---|
| `canPlay(card)` | Returns true if card is valid and affordable right now |
| `selectCard(idx)` | Toggles selection; enforces max 2 cards (1 phase + 1 optional coach) |
| `playCard()` | Applies coach bonus, then plays phase card; routes by phase |
| `rerollOption()` | Discards selected card, draws 1 replacement (costs 1 energy) |
| `applyBonus(card)` | Applies `card.bonus` side effect to G |
| `updateCombo(card)` | Advances or resets `G.comboIdx` based on card type |

---

## G properties used by this module
| Property | Read | Write |
|---|---|---|
| `G.hand` | ✓ | ✓ (splice in reroll) |
| `G.selected` | ✓ | ✓ |
| `G.energy` | ✓ | ✓ |
| `G.phase` | ✓ | ✓ |
| `G.locked` | ✓ | ✓ |
| `G.pointDone` | ✓ | — |
| `G.defWindow` | ✓ | — |
| `G.blockWindow` | ✓ | — |
| `G.coachUsed` | ✓ | ✓ (set true when coach played) |
| `G.nextPhaseExtraCard` | — | ✓ (set true if draw1 bonus) |
| `G.atkBoost` | — | ✓ |
| `G.nextAttackBonus` | ✓ | ✓ (consumed to 0 on attack) |
| `G.aiDefMinus` | — | ✓ |
| `G.comboIdx` | ✓ | ✓ |
| `G.possession` | ✓ | — |
| `G.campaignTeam` | ✓ | — |
| `G.gameMode` | ✓ | — |
| `G.log` | — | ✓ (via log()) |
| `G.pPts`, `G.aPts` | — | ✓ (service error: aPts++) |
| `G.nextServer` | — | ✓ (service error: set to 'ai') |
| `G.discard` | — | ✓ (via clearHand, reroll) |
| `G.deck` | — | ✓ (reroll draws from deck) |

---

## canPlay(card) — full logic
```js
// Coach: only playable AFTER a phase card is already selected
if (card.type === 'coach') {
  if (G.coachUsed) return false;
  const hasPhaseCard = G.selected.some(i => G.hand[i]?.type !== 'coach');
  if (!hasPhaseCard) return false;
  const selCost = G.selected.reduce((s, i) => s + (G.hand[i]?.cost || 0), 0);
  return card.cost + selCost <= G.energy;
}
// All other cards: use centralized phase list from deck.js
const phases = getCurrentValidPhases();
return card.phases.some(p => phases.includes(p)) && card.cost <= G.energy;
```

## selectCard(idx) — selection rules
```
Goal: G.selected always has max 2 entries (1 phase card + 1 optional coach)

Deselect (card already in selected):
  - If removing phase card → clear ALL selected (coach can't be alone)
  - If removing coach → splice just coach out

Select (new card):
  - Coach → append to selected (canPlay guarantees a phase card exists)
  - Phase card → keep existing coach if any, replace phase card
    G.selected = [coachIdx || nothing] + [phaseIdx]
```

---

## playCard() — order of operations
```
1. Find phaseIdx  = G.selected.find(i => G.hand[i].type !== 'coach')
2. Find coachIdx  = G.selected.find(i => G.hand[i].type === 'coach')
3. Guard: if no phase card, return early
4. G.locked = true; sounds.cardPlay()
5. Apply coach bonus:
   a. G.coachUsed = true
   b. G.energy -= coach.cost
   c. applyBonus(coach)  ← energy2 restores BEFORE phase cost debit
   d. if coach.bonus === 'draw1': G.nextPhaseExtraCard = true
6. G.energy -= phase.cost
7. applyBonus(phase)
8. log(...)
9. updateCombo(phase)
10. sendData (if multiplayer)
11. clearHand()
12. Route by phase: 'service' | 'defense' | 'setting' | 'attack'
```

## Phase routing after playCard
| Phase | Action |
|---|---|
| `service` | Error check (5% + power×3%) → endPoint loss, or passBall(true, true) |
| `defense` | Advance to 'setting', drawPhaseOptions() |
| `setting` | Advance to 'attack', drawPhaseOptions(), sendData SETTING_PLAY |
| `attack` | Total = power + atkBoost + nextAttackBonus + meteorosBonus → resolvePlayerAttack() |

**Attack bonus passive**: `getCampaignTeam()?.passives?.attackBonus ?? 0` — data-driven, no hardcoded team IDs

---

## applyBonus() — all effects
| bonus key | Effect on G |
|---|---|
| `energy2` | `G.energy = min(G.energy + 2, G.maxEnergy)` |
| `energy1` | `G.energy = min(G.energy + 1, G.maxEnergy)` |
| `atkBoost2` | `G.atkBoost += 2` |
| `atkBoost3` | `G.atkBoost += 3` |
| `atkBoost6` | `G.atkBoost += 6` |
| `draw1` | Log only (G.nextPhaseExtraCard set in playCard, not here) |
| `aiDefMinus1` | `G.aiDefMinus += 1` |
| `aiDefMinus2` | `G.aiDefMinus += 2` |

---

## updateCombo(card)
```
COMBO_SEQ = ['defense', 'setting', 'attack']
- coach type → ignored (no break, no advance)
- matches COMBO_SEQ[comboIdx] → comboIdx++; if comboIdx === 3 → COMBO! atkBoost += 2
- non-matching, non-service → comboIdx = 0
```

---

## rerollOption() — phase list
Uses `getCurrentValidPhases()` from `deck.js` — same logic as `drawPhaseOptions()` and `canPlay()`.
A card matches if `card.phases.some(p => phases.includes(p))`.
