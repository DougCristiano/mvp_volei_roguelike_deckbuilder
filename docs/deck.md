# deck.js — Deck management

## Purpose
Building, shuffling, and drawing cards from the deck into the hand.
Does not contain game logic — only pure deck operations.

## Exports (globals)
| Function | Description |
|---|---|
| `buildDeck()` | Creates campaign deck (base copies + team bias), shuffles into `G.deck` |
| `shuffle(arr)` | Fisher-Yates; returns new array, does NOT mutate input |
| `resetDeck()` | Merges hand + discard back into deck and reshuffles (called each point) |
| `clearHand()` | Moves hand to discard, clears selected |
| `drawPhaseOptions()` | Draws exactly 3 phase-valid cards from deck into hand |

---

## G properties used by this module
| Property | Read | Write |
|---|---|---|
| `G.deck` | ✓ | ✓ |
| `G.hand` | ✓ | ✓ |
| `G.discard` | ✓ | ✓ |
| `G.selected` | — | ✓ (clearHand sets to []) |
| `G.phase` | ✓ | — |
| `G.defWindow` | ✓ | — |
| `G.blockWindow` | ✓ | — |
| `G.coachUsed` | ✓ | — |
| `G.nextPhaseExtraCard` | — | ✓ (reset to false after draw) |
| `G.campaignTeam` | ✓ | — |

---

## buildDeck() — deck composition
Base: `BASE_DECK_COPIES` from `campaign.js` (total ~14 cards without bias).
Campaign teams shift +2 copies to their specialty type (`CAMPAIGN_TEAMS[team].deckBias`).

| Team | Specialty | Result |
|---|---|---|
| Os Meteoros | attack +2 | 3srv/3def/2set/5atk/3blk = 16 |
| A Muralha | block +2 | 3srv/3def/2set/3atk/5blk = 16 |
| A Fortaleza | defense +2 | 3srv/5def/2set/3atk/3blk = 16 |
| No team (AI mode) | — | 42 cards: 7 copies each of 6 types |

> Coach cards (type: 'coach') are always included in every deck build via the normal 7-per-type rule.

---

## drawPhaseOptions() logic

1. Calls `clearHand()` — moves current hand to discard
2. Builds valid phase list:
   - `blockWindow: true` → `['block', 'coach']`
   - `defWindow: true` → `['defense', 'coach']`
   - Otherwise → `[G.phase, 'coach']`
3. If `G.coachUsed` is true → removes `'coach'` from the list
4. Draws cards from the END of `G.deck` (stack order, not random per draw)
5. A card matches if `card.phases.some(p => phases.includes(p))`
6. If deck runs out before 3 cards: shuffles `G.discard` back into `G.deck`, continues
7. Always draws exactly **3 cards** (coach counts as one of the 3 slots)
8. Resets `G.nextPhaseExtraCard = false` (flag consumed)

**Important**: coach appears naturally as 1-of-3 options when available — it replaces a phase card slot, it does NOT add a 4th card.

---

## Invariants
- `clearHand()` must be called before any phase transition to avoid card leaks
- `resetDeck()` is called at the start of every point via `state.js:startPoint()`
- `shuffle()` is pure — safe to call on any array without side effects
- Never call `buildDeck()` between campaign matches — deck carries reward cards
