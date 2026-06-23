# render.js — UI rendering

## Purpose
All DOM mutations. Reads `G` and maps it to visual elements. No state mutation allowed.

## Exports (globals)
| Function | Description |
|---|---|
| `render()` | Master render call — updates score, phase, energy, log, hand, actions, ball |
| `renderHand()` | Renders card elements in `#hand-cards` |
| `renderResolve()` | Shows/hides and styles `#resolve-panel` with live atk/def values |
| `renderActions()` | Enables/disables all action buttons based on current G state |
| `renderLog()` | Writes last 12 log entries to `#log-area` with CSS class coloring |
| `moveBall()` | Moves `#ball` emoji to reflect possession / defWindow |
| `logClass(msg)` | Returns a CSS class string based on the leading emoji of the message |
| `showPointResult(type, title, desc)` | Shows the between-points result panel |
| `hidePointResult()` | Hides result panel, re-shows hand and action areas |
| `showEnd(won)` | Shows end-of-match overlay |

## CSS class color rules (logClass)
| Emoji prefix | Class | Color |
|---|---|---|
| ✅ 🎉 🏆 | `log-win` | Green |
| ❌ ⏱ | `log-loss` | Red/coral |
| 🛡 🧤 🔁 🏃 🤺 🤖 | `log-ai` | Muted |
| + ⚡ 🃏 | `log-energy` | Gold |
| 🔥 | `log-combo` | Orange |
| — | `log-neutral` | Gray |
| ⚖ | `log-combat` | Blue |

## Invariants
- `render()` is called after every state change — it is safe to call repeatedly.
- `renderHand()` calls `canPlay()` from `input.js` — render.js depends on input.js being loaded first.
- `renderResolve()` reads `G.selected` to compute live defense power display.
- `showPointResult()` hides `#action-area` and `#hand-area`; `hidePointResult()` restores them to `flex`.

## Do NOT add to this file
- State mutation (G.xxx = ...) — read only.
- Business logic or probability calculation.
- Timer management — that lives in combat.js.
