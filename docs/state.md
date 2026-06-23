# state.js — Global game state

## Purpose
Declares and initializes `G`, the single mutable state object shared by all modules.
Also owns the two lifecycle functions that reset state: `newGame()` and `startPoint()`.

## Exports (globals)
| Name | Description |
|---|---|
| `G` | The global game state object (mutated by all modules) |
| `log(msg)` | Prepends a message to `G.log`; keeps max 40 entries |
| `newGame(gameMode, isHost)` | Full reset — new match, new deck, first point |
| `startPoint()` | Point-level reset — energy, timers, possession, phase |

## G fields reference
```js
G = {
  // Mode
  gameMode: 'ai' | 'multiplayer',
  isHost: boolean,

  // Score
  pPts, aPts,          // Current point score
  pSets, aSets,        // Sets won

  // Resources
  energy, maxEnergy,        // Player (default 10)
  aiEnergy, maxAiEnergy,    // AI / Opponent (default 10)

  // Cards
  deck: Card[],
  hand: Card[],        // Always max 3 cards shown
  discard: Card[],
  selected: number[],  // Indices into hand[]

  // Rally state
  phase: 'service'|'defense'|'setting'|'attack'|'block',
  possession: 'player'|'ai',
  defWindow: boolean,
  blockWindow: boolean,
  locked: boolean,       // Blocks player input
  pointDone: boolean,    // Point ended; waiting for "next"

  // Timers
  defTimerVal, defInterval,
  blockTimerVal, blockInterval,

  // Combat bonuses
  comboIdx: 0|1|2|3,
  atkBoost: number,         // Cumulative setting bonus
  nextAttackBonus: number,  // Defense quality carry-forward for player
  aiNextAtkBonus: number,   // Defense quality carry-forward for AI
  aiDefMinus: number,       // Penalty on AI defense (from card bonus)
  aiAtkPow: number,         // AI's current attack power (set by aiTurn)

  // Flags
  aiJustDefended: boolean,
  isDefendingServe: boolean,
  defenseQuality: object|null,

  // Log
  log: string[],  // Newest at index 0, max 40 entries
  nextServer: 'player'|'ai',

  // Multiplayer sync flags (set/cleared in multiplayer.js)
  isNetworkReceiver: boolean,
  networkPointData: object|null,
}
```

## Invariants
- `startPoint()` must reset ALL combat-related fields before calling `drawPhaseOptions()` or `aiTurn()`.
- `log()` must be called after G is initialized (G.log must exist).
- `newGame()` calls `buildDeck()` (deck.js) and `startPoint()` — both must be defined before newGame runs (ensured by script load order).
