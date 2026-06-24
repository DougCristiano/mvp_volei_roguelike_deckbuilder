# data.js — Cards database and constants

## Purpose
Single source of truth for all static game data. No game logic, no DOM access, no state mutation.
Loaded first — all other modules depend on the globals it exposes.

## Exports (globals)
| Name | Type | Description |
|---|---|---|
| `CARDS_DB` | `Card[]` | All 22 cards currently implemented |
| `PHASE_NAMES` | `object` | Display names for each phase ID |
| `COMBO_SEQ` | `string[]` | `['defense','setting','attack']` |
| `DEFENSE_QUALITY_RANGES` | `object` | Gap → quality tier mapping |

---

## Card schema
```js
{
  id: string,        // Unique identifier ('def1', 'cch2'…). Never change existing IDs — multiplayer uses them.
  name: string,      // PT-BR display name
  type: string,      // 'service'|'defense'|'setting'|'attack'|'block'|'coach'
  level: string,     // 'basico'|'intermediario'|'avancado' (metadata only, no engine gate)
  cost: number,      // Energy cost to play (≥ 0)
  power: number,     // Primary power in resolution. Coach cards always have power: 0
  desc: string,      // Short PT-BR description shown on card
  phases: string[],  // Valid phase identifiers for this card type
  bonus?: string,    // Optional bonus key — must match a case in input.js:applyBonus()
  outcomes?: object, // Reserved: attack probability table (not consumed by engine yet)
}
```

## Phase values per type
| Card type | phases value | Available in |
|---|---|---|
| `service` | `['service']` | Service only |
| `defense` | `['defense']` | Defense window only |
| `setting` | `['setting']` | Setting phase only |
| `attack` | `['attack']` | Attack phase only |
| `block` | `['block']` | Block window only |
| `coach` | `['coach']` | ALL phases (controlled by G.coachUsed, not phases[]) |

---

## Coach cards — special rules
- `phases: ['coach']` — not a real phase ID; drawPhaseOptions() handles coach separately
- `power: 0` — never adds to defense/attack power calculations
- **1 per point** — `G.coachUsed` flag prevents a second coach in same point
- Must be combined with a phase card (cannot play coach alone)
- Bonus applied before the phase card's cost is debited

---

## DEFENSE_QUALITY_RANGES
Gap = `defenderPower − attackerPower`. Positive = defense wins; negative = attack wins.

| Tier key | Gap | Success | nextAtkBonus |
|---|---|---|---|
| `ataque_dominante` | ≤ -7 | 0% | -2 |
| `vantagem_ofensiva` | -6 to -4 | 25% | -1 |
| `equilibrio` | -3 to +3 | 95% | 0 |
| `vantagem_defensiva` | +4 to +6 | 100% | +2 |
| `defesa_dominante` | ≥ +7 | 100% | +4 |

---

## Current CARDS_DB (22 cards)

### Service (3)
| id | Nome | Cost | Power |
|---|---|---|---|
| srv1 | Saque Flutuante | 1 | 3 |
| srv2 | Saque Potente | 2 | 5 |
| srv3 | Saque Tático | 0 | 1 |

### Defense (6)
| id | Nome | Cost | Power | Bonus |
|---|---|---|---|---|
| def1 | Manchete Firme | 1 | 4 | — |
| def2 | Mergulho | 0 | 2 | — |
| def3 | Leitura de Jogo | 2 | 4 | energy2 |
| def4 | Posicionamento Perfeito | 2 | 7 | — |
| def5 | Defesa de Manchete | 1 | 5 | — |
| def6 | Defesa Heroica | 3 | 10 | — |

### Setting (3)
| id | Nome | Cost | Power | Bonus |
|---|---|---|---|---|
| set1 | Levantamento Alto | 1 | 0 | atkBoost3 |
| set2 | Levantamento Rápido | 2 | 0 | atkBoost6 |
| set3 | Levantamento de Costas | 1 | 0 | aiDefMinus2 |

### Attack (5)
| id | Nome | Cost | Power | Bonus |
|---|---|---|---|---|
| atk1 | Cortada Diagonal | 2 | 6 | — |
| atk2 | Ponta Aberta | 1 | 3 | — |
| atk3 | Bola na Linha | 3 | 9 | — |
| atk4 | Finta | 1 | 2 | aiDefMinus2 |
| atk5 | Ataque Fundo | 2 | 5 | — |

### Block (3)
| id | Nome | Cost | Power |
|---|---|---|---|
| blk1 | Bloqueio Simples | 1 | 3 |
| blk2 | Paredão | 2 | 6 |
| blk3 | Leitura de Bloqueio | 1 | 4 |

### Coach (2)
| id | Nome | Level | Cost | Power | Bonus |
|---|---|---|---|---|---|
| cch1 | Foco do Técnico | basico | 0 | 0 | energy2 |
| cch2 | Chamada do Técnico | intermediario | 1 | 0 | draw1 |

---

## Bonus effects reference
| bonus key | Effect | Applied in |
|---|---|---|
| `energy2` | +2 energia (before phase card cost) | `input.js:applyBonus` |
| `atkBoost3` | +3 ao próximo ataque | `input.js:applyBonus` |
| `atkBoost6` | +6 ao próximo ataque | `input.js:applyBonus` |
| `aiDefMinus2` | IA defende com -2 | `input.js:applyBonus` |
| `draw1` | Coach garantido no próximo draw | `input.js:applyBonus` (sets G.nextPhaseExtraCard) |

---

## How to add a card
1. Add to `CARDS_DB` with unique `id`, valid `type`, correct `phases[]`, and a `level`
2. If new `bonus` key, implement in `input.js:applyBonus()`
3. Update card table in AGENT.md > "Banco de Cartas Atual"
4. Tests in `tests/data.test.js` will auto-validate schema and uniqueness

## Do NOT modify
- Existing `id` values — multiplayer uses cardId for sync
- `COMBO_SEQ` order — combo system in `input.js:updateCombo` depends on it
- `DEFENSE_QUALITY_RANGES` keys — referenced by string in `combat.js` and `multiplayer.js`
