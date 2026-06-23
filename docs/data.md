# data.js — Cards database and constants

## Purpose
Single source of truth for all static game data. No game logic, no DOM access, no state mutation.

## Exports (globals)
| Name | Type | Description |
|---|---|---|
| `CARDS_DB` | `Card[]` | All 24 cards in the game |
| `PHASE_NAMES` | `object` | Display names for each phase ID |
| `COMBO_SEQ` | `string[]` | Sequence required to complete a combo |
| `DEFENSE_QUALITY_RANGES` | `object` | Gap-to-quality-tier mapping |

## Card schema
```js
{
  id: string,         // Unique identifier (e.g. 'def1')
  name: string,       // Display name (PT-BR)
  type: string,       // 'service' | 'defense' | 'setting' | 'attack' | 'block' | 'support'
  cost: number,       // Energy cost to play
  power: number,      // Primary power value used in resolution
  desc: string,       // Short description for the card UI
  phases: string[],   // Phases where this card is valid
  bonus?: string,     // Optional bonus effect key (see input.js:applyBonus)
  outcomes?: object,  // Optional attack probability table (for future use)
}
```

## DEFENSE_QUALITY_RANGES schema
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

Gap = `defPow - attackPow`. Negative gap means attack is stronger.

| Tier | Gap range | Success | nextAtkBonus |
|---|---|---|---|
| `critica` | ≥ 4 | 100% | +3 |
| `boa` | 0 – 3 | 95% | +1 |
| `ruim` | -3 – -1 | 30% | -1 |
| `miss` | ≤ -4 | 0% | -2 |

## How to add a card
1. Add an entry to `CARDS_DB` with a unique `id`.
2. If adding a new `bonus` effect, implement it in `input.js:applyBonus()`.
3. Update the card table in `AGENT.md`.

## Do NOT modify
- The `id` field of existing cards — multiplayer uses `cardId` for sync.
- `COMBO_SEQ` order — changes break the combo system in `input.js:updateCombo`.
- `DEFENSE_QUALITY_RANGES` keys — used by string reference in `combat.js` and `multiplayer.js`.
