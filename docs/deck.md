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
| support | 2 | 7 |

## drawPhaseOptions() logic
1. Clears the current hand to discard.
2. Determines valid phases for the current context (defWindow/blockWindow/phase).
3. Picks up to 3 matching cards from the END of the deck (stack, not random).
4. If deck runs dry mid-draw, shuffles discard into deck and continues drawing.
5. Support cards are excluded during service and block phases.

## Invariants
- `clearHand()` must be called before any phase transition to avoid card leaks.
- `resetDeck()` is called at the start of every point (`startPoint` in state.js).
- `shuffle()` is pure — it does not mutate the input array.
