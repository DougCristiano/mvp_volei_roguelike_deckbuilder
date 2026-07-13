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
| `getCurrentValidPhases()` | Returns the valid phase list for the current context (used by input.js too) |

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
Base: `BASE_DECK_CARDS` from `campaign.js` — a **curated** list of card ids per type
(3 each of service/defense/setting/attack/block = 15 cards). The curation guarantees that
defense/setting/attack each cover all 3 tags (`power`/`precision`/`tempo`), so every
tag-combo route is reachable from the first point. `BASE_DECK_COPIES` is derived from the
list lengths (used by campaign.html preview).

Campaign teams shift +2 copies to their specialty type (`CAMPAIGN_TEAMS[team].deckBias`).
Bias slots beyond the curated list are filled with the remaining **unlocked** cards of that
type (CARDS_DB order), wrapping into duplicates only if the type runs out of cards.

| Team | Specialty | Result |
|---|---|---|
| Os Meteoros | attack +2 | 3srv/3def/3set/5atk/3blk = 17 |
| A Muralha | block +2 | 3srv/3def/3set/3atk/5blk = 17 |
| A Fortaleza | defense +2 | 3srv/5def/3set/3atk/3blk = 17 |
| No team (AI mode) | — | 15 cards (base deck) |

> Coach cards (type: 'coach') are NOT part of the base deck — they enter via campaign rewards.
> Locked cards never enter a deck via buildDeck (only via rewards after XP unlock).

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
