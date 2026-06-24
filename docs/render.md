# render.js — UI rendering

## Purpose
All DOM mutations. Reads `G` and maps it to visual elements. **No state mutation allowed here.**
Called after every G change via `render()`.

## Exports (globals)
| Function | Description |
|---|---|
| `render()` | Master call — calls all sub-renderers + moveBall |
| `renderHand()` | Renders card elements in `#hand-cards` |
| `renderResolve()` | Shows/hides `#resolve-panel` with live atk/def power values |
| `renderActions()` | Enables/disables all action buttons based on G state |
| `renderLog()` | Writes last 12 log entries to `#log-area` |
| `moveBall()` | Moves `#ball` to reflect possession/defWindow |
| `logClass(msg)` | Returns CSS class string for a log entry by leading emoji |
| `showPointResult(type, title, desc)` | Shows between-points result panel |
| `hidePointResult()` | Hides result panel, restores hand and action areas |
| `showRewards(rewardCards)` | Renders campaign reward overlay (3 card choices) |
| `showEnd(won)` | Shows end-of-match overlay |

---

## G properties read by this module
| Property | Used in |
|---|---|
| `G.pPts`, `G.aPts` | `render()` — `#point-display` |
| `G.pSets`, `G.aSets` | `render()` — `#sets-display` |
| `G.gameMode` | Phase label, ball label, log text, showEnd |
| `G.campaignMatchIndex` | `render()` — `#campaign-match-label` |
| `G.blockWindow` | Phase label, renderResolve, renderActions |
| `G.defWindow` | Phase label, renderResolve, renderActions |
| `G.isDefendingServe` | Phase label |
| `G.possession` | Phase label, possession badge, moveBall |
| `G.phase` | Phase label |
| `G.pointDone` | Message area, renderResolve |
| `G.locked` | Message area, btn-reroll disabled, btn-skip-block disabled |
| `G.energy`, `G.maxEnergy` | Energy pips (header) |
| `G.aiEnergy`, `G.maxAiEnergy` | AI energy pips |
| `G.comboIdx` | `#combo-badge` visibility |
| `G.deck.length` | `#deck-count` |
| `G.discard.length` | `#discard-count` |
| `G.hand` | `renderHand()` — card elements |
| `G.selected` | `renderHand()` — `.selected` class; `renderResolve()` — live def power |
| `G.aiAtkPow` | `renderResolve()` — `#atk-val` |

---

## DOM element IDs used by render.js
| ID | Purpose |
|---|---|
| `#point-display` | "X — Y" current point score |
| `#sets-display` | "Sets: X × Y" |
| `#campaign-progress` | Container (hidden/shown by gameMode) |
| `#campaign-match-label` | "Jogo 1 de 3" / "Semifinal" / "Final" |
| `#phase-label` | Current phase in PT-BR |
| `#possession-badge` | "Você" or "IA" |
| `#combo-badge` | "🔥 Combo!" visibility |
| `#message-area` | Context instruction text |
| `#energy-pips-header` | Player pip divs |
| `#ai-energy-pips` | AI pip divs |
| `#freeball-notice` | Shown when energy = 0 |
| `#deck-count` | Number on deck pile |
| `#discard-count` | Number on discard pile |
| `#hand-cards` | Container for 3 card elements |
| `#resolve-panel` | Defense/block window panel |
| `#resolve-header` | Panel header text |
| `#timer-wrapper` | Timer bar + count container |
| `#atk-val` | Attacker power in resolve panel |
| `#def-val` | Defender power in resolve panel (colored) |
| `#btn-play` | Jogar Carta |
| `#btn-reroll` | Trocar (1⚡) |
| `#btn-pass` | Passar Bola |
| `#btn-resolve` | Confirmar Defesa |
| `#btn-block` | Confirmar Bloqueio |
| `#btn-skip-block` | Não Bloquear |
| `#btn-next` | Próximo Ponto |
| `#ball` | Ball emoji element |
| `#log-area` | Log sidebar |
| `#overlay` | End-of-match overlay |
| `#overlay-title`, `#overlay-msg` | End overlay content |
| `#rewards-overlay` | Campaign reward picker overlay |
| `#rewards-cards` | Container for reward card elements |
| `#point-result` | Between-points result panel |
| `#point-result-title`, `#point-result-desc` | Result content |
| `#action-area` | Main button row (shown/hidden) |
| `#hand-area` | Hand section (shown/hidden) |
| `#ai-label`, `#player-label`, `#atk-label` | Role labels (set in newGame) |

---

## renderActions() — button visibility matrix
| Condition | play | reroll | pass | resolve | block | skip-block |
|---|---|---|---|---|---|---|
| `defWindow` | hide | show | hide | show | hide | hide |
| `blockWindow` | hide | show | hide | hide | show | show |
| Normal turn | show | show | show | hide | hide | hide |

**Disabled conditions:**
- `btn-reroll`: `G.locked || G.energy < 1 || G.selected.length !== 1`
- `btn-play`: `G.selected.length === 0 || G.locked`
- `btn-pass`: `G.locked || G.phase === 'service' || G.possession !== 'player'`
- `btn-resolve`: `!G.selected.some(i => G.hand[i]?.type !== 'coach')` — requires phase card
- `btn-block`: `!G.selected.some(i => G.hand[i]?.type !== 'coach')` — requires block card
- `btn-skip-block`: `G.locked`

---

## logClass() — emoji → CSS class
| Emoji | Class |
|---|---|
| ✅ 🎉 🏆 | `log-win` |
| ❌ ⏱ | `log-loss` |
| 🛡 🧤 🔁 🏃 🤺 🤖 | `log-ai` |
| + ⚡ 🃏 | `log-energy` |
| 🔥 | `log-combo` |
| — | `log-neutral` |
| ⚖ | `log-combat` |

---

## showRewards() — campaign reward picker
- Renders 3 reward card elements with rarity class (`rarity-basico`, `rarity-intermediario`, `rarity-avancado`)
- On click: calls `addCardToReward(card.id)` then:
  - If `G.gameMode === 'campaign'`: calls `startNextCampaignMatch()`
  - Otherwise: calls `startPoint()`

---

## Invariants
- `render()` is idempotent — safe to call repeatedly
- `renderHand()` calls `canPlay()` from `input.js` — input.js must be loaded before render.js
- `showPointResult()` hides `#action-area` and `#hand-area`
- `hidePointResult()` restores them to `display: flex`
- NEVER write to G from this file
