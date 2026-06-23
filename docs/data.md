# data.js — Cards database and constants

## Purpose
Single source of truth for all static game data. No game logic, no DOM access, no state mutation.

## Exports (globals)
| Name | Type | Description |
|---|---|---|
| `CARDS_DB` | `Card[]` | All 22 cards currently implemented |
| `PHASE_NAMES` | `object` | Display names for each phase ID |
| `COMBO_SEQ` | `string[]` | Sequence required to complete a combo |
| `DEFENSE_QUALITY_RANGES` | `object` | Gap-to-quality-tier mapping (5-tier GDD system) |

## Card schema
```js
{
  id: string,         // Unique identifier (e.g. 'def1')
  name: string,       // Display name (PT-BR)
  type: string,       // 'service' | 'defense' | 'setting' | 'attack' | 'block' | 'coach'
  level: string,      // 'basico' | 'intermediario' | 'avancado'
  cost: number,       // Energy cost to play
  power: number,      // Primary power value used in resolution
  desc: string,       // Short description for the card UI
  phases: string[],   // Phases where this card is valid
  bonus?: string,     // Optional bonus effect key (see input.js:applyBonus)
  outcomes?: object,  // Optional attack probability table (unused until engine update)
}
```

## Type: 'coach' (Dica do Treinador)
Coach cards are tactical interventions that simulate real-time coaching instructions.
- Available phases: `['defense', 'setting', 'attack']`
- **NOT** available during `service` or `block` phases
- **Limited to 1 use per point** (`G.coachUsed` flag in state.js)
- After playing, the hand is refreshed in the current phase (coach does not advance phase)

## Level field
| Value | Meaning |
|---|---|
| `'basico'` | Low power/cost, suitable for starter decks, no conditional effects |
| `'intermediario'` | Medium power, may have secondary effects |
| `'avancado'` | High power/cost or strong effects, endgame cards |

The `level` field is currently metadata only — no engine filters or gates on level exist yet.
It is used in the 120-card design catalog (`docs/card-catalog.md`) for progression planning.

## DEFENSE_QUALITY_RANGES schema (5-tier GDD system)
```js
{
  qualityKey: {
    min: number,          // Minimum gap (inclusive)
    max: number,          // Maximum gap (inclusive)
    desc: string,         // Display name
    emoji: string,        // Visual indicator
    nextAtkBonus: number, // Bonus applied to player's next attack power
    successRate: number,  // 0.0–1.0 probability of defense succeeding
  }
}
```

Gap = `defPow - attackPow`. Positive gap = defense wins; negative = attack wins.

| Tier key | Gap range | Success | nextAtkBonus | Flavor |
|---|---|---|---|---|
| `ataque_dominante` | ≤ -7 | 0% | -2 | 💥 Ataque Dominante |
| `vantagem_ofensiva` | -6 to -4 | 25% | -1 | ⚡ Vantagem Ofensiva |
| `equilibrio` | -3 to +3 | 95% | 0 | ⚖️ Equilíbrio |
| `vantagem_defensiva` | +4 to +6 | 100% | +2 | 🛡️ Vantagem Defensiva |
| `defesa_dominante` | ≥ +7 | 100% | +4 | ⭐ Defesa Dominante |

## How to add a card
1. Add an entry to `CARDS_DB` with a unique `id` and include a `level` field.
2. If adding a new `bonus` effect, implement it in `input.js:applyBonus()`.
3. Update the card table in `AGENT.md`.
4. Check if the card is a `'coach'` type — see coach behavior above.

## Do NOT modify
- The `id` field of existing cards — multiplayer uses `cardId` for sync.
- `COMBO_SEQ` order — changes break the combo system in `input.js:updateCombo`.
- `DEFENSE_QUALITY_RANGES` keys — used by string reference in `combat.js` and `multiplayer.js`.
