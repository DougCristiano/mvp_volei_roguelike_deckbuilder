# deck.js — Deck management

## Purpose
Building, shuffling, and drawing cards from the deck into the hand.

## Exports (globals)
| Function | Description |
|---|---|
| `buildDeck()` | Creates a 42-card deck (7 copies of each type) and shuffles it into `G.deck` |
| `shuffle(arr)` | Fisher-Yates shuffle; returns new array (does not mutate) |
| `resetDeck()` | Merges hand + discard back into deck and reshuffles |
| `clearHand()` | Moves hand to discard, clears selected |
| `drawPhaseOptions()` | Draws up to 3 phase-valid cards from deck into hand |

## Deck composition
42 cards: 6 types × 7 copies each.
The 7 copies cycle through the available cards of each type (round-robin).
This means types with fewer cards repeat; types with 6 cards (defense) cycle only once.

| Type | Unique cards | Copies (total) |
|---|---|---|
| service | 3 | 7 (cycles: srv1 srv2 srv3 srv1 srv2 srv3 srv1) |
| defense | 6 | 7 |
| setting | 3 | 7 |
| attack | 5 | 7 |
| block | 3 | 7 |
| coach | 2 | 7 |

## drawPhaseOptions() logic
1. Clears the current hand to discard.
2. Determines valid phases for the current context:
   - `blockWindow: true` → phases = `['block', 'coach']`
   - `defWindow: true` → phases = `['defense', 'coach']`
   - Otherwise → phases = `[G.phase, 'coach']`
3. Coach excluded only if `G.coachUsed === true` (already used this point).
4. Draws exactly 3 cards matching any phase in the filtered list.
5. If deck runs dry mid-draw, shuffles discard into deck and continues drawing.

**Result**: Coach appears in ALL phases (as long as not used this point) and takes 1 of the 3 slots.

## Invariants
- `clearHand()` must be called before any phase transition to avoid card leaks.
- `resetDeck()` is called at the start of every point (`startPoint` in state.js).
- `shuffle()` is pure — it does not mutate the input array.
