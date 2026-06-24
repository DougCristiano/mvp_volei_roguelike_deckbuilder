# state.js — Global game state

## Purpose
Declares and initializes `G`, the single mutable state object shared by all modules.
Owns all lifecycle functions: `newGame()`, `startPoint()`, `startNextCampaignMatch()`.

## Exports (globals)
| Name | Description |
|---|---|
| `G` | The global game state (mutated by all modules at runtime) |
| `log(msg)` | Prepends to `G.log`; keeps max 40 entries (newest at index 0) |
| `newGame(gameMode, isHost, campaignTeam?)` | Full reset — new match, new deck, first point |
| `startPoint()` | Point-level reset — energy, timers, possession, phase, coach flags |
| `startNextCampaignMatch()` | Advance campaign to next match preserving deck; calls `startPoint()` |

---

## Complete G fields reference
```js
G = {
  // === Mode ===
  gameMode: 'ai' | 'multiplayer' | 'campaign',
  isHost: boolean,

  // === Campaign ===
  campaignTeam: string|null,     // 'meteoros'|'muralha'|'fortaleza' or null
  campaignMatchIndex: number,    // 1-based (1=Jogo1, 2=Semifinal, 3=Final)
  aiDifficulty: 0|1|2,          // 0=easy, 1=medium, 2=hard

  // === Score ===
  pPts: number, aPts: number,    // Current point score
  pSets: number, aSets: number,  // Sets won

  // === Resources ===
  energy: number, maxEnergy: 10,
  aiEnergy: number, maxAiEnergy: 10,

  // === Cards ===
  deck: Card[],
  hand: Card[],         // Always max 3 cards shown
  discard: Card[],
  selected: number[],   // Indices into hand[] (max 2: 1 phase + 1 coach)

  // === Rally state ===
  phase: 'service'|'defense'|'setting'|'attack',
  possession: 'player'|'ai',
  defWindow: boolean,      // Defense decision window open
  blockWindow: boolean,    // Block decision window open
  locked: boolean,         // Blocks all player input
  pointDone: boolean,      // Point ended; waiting for "Próximo Ponto"

  // === Timers ===
  defTimerVal: number, defInterval: id,
  blockTimerVal: number, blockInterval: id,

  // === Combat bonuses ===
  comboIdx: 0|1|2|3,          // Position in COMBO_SEQ
  atkBoost: number,            // Cumulative setting bonus for next attack
  nextAttackBonus: number,     // Defense quality carry-forward (player → player's next attack)
  aiNextAtkBonus: number,      // Defense quality carry-forward (AI → AI's next attack)
  aiDefMinus: number,          // Penalty on AI defense power (from aiDefMinus cards)
  aiAtkPow: number,            // AI's current attack power (set by ai.js:aiTurn)

  // === Flags ===
  aiJustDefended: boolean,     // AI already did first touch (prevents double combo count)
  isDefendingServe: boolean,   // Changes "Defesa" label to "Recepção"
  defenseQuality: object|null, // Last resolved quality tier (debug/future use)
  coachUsed: boolean,          // Coach card used this point — hides coach from next draws
  freeBlockUsed: boolean,      // A Muralha passive: first block per point costs 0 energy
  nextPhaseExtraCard: boolean, // draw1 coach bonus flag (currently resets without extra effect)

  // === Log ===
  log: string[],               // Newest at index 0, max 40 entries

  // === Server ===
  nextServer: 'player'|'ai',  // Who serves next point

  // === Multiplayer sync ===
  isNetworkReceiver: boolean,   // Set when receiving POINT_END from host
  networkPointData: object|null,
}
```

---

## startPoint() resets (every point)
- `energy = maxEnergy`, `aiEnergy = maxAiEnergy`
- `phase = 'service'`, `possession = nextServer`
- `comboIdx`, `atkBoost`, `nextAttackBonus`, `aiNextAtkBonus`, `aiDefMinus` → 0
- `selected = []`, `defWindow = false`, `blockWindow = false`
- `locked = false`, `pointDone = false`
- `aiJustDefended = false`, `isDefendingServe = false`, `defenseQuality = null`
- `coachUsed = false`, `freeBlockUsed = false`, `nextPhaseExtraCard = false`
- Clears both intervals; calls `hidePointResult()`
- Calls `drawPhaseOptions()` if player serves, else `aiTurn()` after 1s

## startNextCampaignMatch() behavior
- Saves `[...G.deck, ...G.hand, ...G.discard]` before reset (preserves reward cards)
- Reads next config from `CAMPAIGN_MATCH_CONFIG[nextIndex - 1]`
- Sets `pSets`, `aSets`, `aiDifficulty` from config
- Calls `startPoint()` to begin the match

---

## Campaign match config (from campaign.js)
| matchIndex | label | pSets | aSets | aiDifficulty |
|---|---|---|---|---|
| 1 | Jogo 1 de 3 | 1 | 0 | 0 (easy) |
| 2 | Semifinal | 1 | 1 | 1 (medium) |
| 3 | Final | 0 | 1 | 2 (hard) |

---

## Invariants
- `startPoint()` must reset ALL combat fields before calling `drawPhaseOptions()` or `aiTurn()`
- `log()` crashes if called before G is initialized (G.log must exist)
- `newGame()` calls `buildDeck()` (deck.js) then `startPoint()` — load order enforced by index.html
- `startNextCampaignMatch()` must NOT call `buildDeck()` — deck grows with reward cards
