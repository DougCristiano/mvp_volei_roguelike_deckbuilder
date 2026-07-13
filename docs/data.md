# data.js — Cards database and constants

## Purpose
Single source of truth for all static game data. No game logic, no DOM access, no state mutation.
Loaded first — all other modules depend on the globals it exposes.

## Exports (globals)
| Name | Type | Description |
|---|---|---|
| `CARDS_DB` | `Card[]` | All 33 cards currently implemented (incl. locked) |
| `PHASE_NAMES` | `object` | Display names for each phase ID |
| `COMBO_SEQ` | `string[]` | `['defense','setting','attack']` |
| `DEFENSE_QUALITY_RANGES` | `object` | Gap → quality tier mapping |
| `CARD_TAGS` | `object` | `{power, precision, tempo}` → `{emoji, name}`. Combo-tag identities (see below) |

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
  tag?: string,      // 'power'|'precision'|'tempo' — only on defense/setting/attack cards. Drives the tag-combo system.
}
```

Note: attack cards previously had an `outcomes` field (point/blocked/out/net probabilities) that was never read by the engine — removed as dead data. Attack success is fully determined by `resolvePlayerAttack()`'s error chance + AI block/defense rolls (see combat.md).

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
| `vantagem_defensiva` | +4 to +6 | 97% | +2 |
| `defesa_dominante` | ≥ +7 | 97% | +4 |

---

---

## Card tags and the combo system

`defense`/`setting`/`attack` cards carry a `tag` (`power` ⚡, `precision` 🎯, `tempo` 🔄 — see `CARD_TAGS`). Playing a card in each of the 3 phases during the same rally (tracked by `G.comboIdx`/`G.comboTags` in `input.js:updateCombo()`) always grants a generic **+2 poder** bonus. If all 3 cards played share the same tag, that generic bonus is replaced by a stronger tag-specific payoff instead:

| Tag | Payoff when all 3 phases match |
|---|---|
| ⚡ `power` | +4 poder no ataque (em vez de +2) |
| 🎯 `precision` | Adversário defende com -3 (`G.aiDefMinus`) |
| 🔄 `tempo` | +2 Energia |

Mismatched tags (or no tag on one of the cards) fall back to the generic +2. This logic lives entirely in `input.js`; `combat.js` and `ai.js` are untouched by it — the AI does not use tags.

---

## Current CARDS_DB (33 cards)

### Service (3)
| id | Nome | Cost | Power |
|---|---|---|---|
| srv1 | Saque Flutuante | 1 | 3 |
| srv2 | Saque Potente | 2 | 5 |
| srv3 | Saque Tático | 0 | 1 |

### Defense (7 unlocked + def7/def8 locked)
| id | Nome | Cost | Power | Bonus | Tag |
|---|---|---|---|---|---|
| def1 | Manchete Firme | 1 | 4 | — | tempo |
| def2 | Mergulho | 0 | 2 | — | tempo |
| def3 | Leitura de Jogo | 2 | 4 | energy2 | precision |
| def4 | Posicionamento Perfeito | 2 | 7 | — | power |
| def5 | Defesa de Manchete | 1 | 5 | — | power |
| def6 | Defesa Heroica | 3 | 10 | — | power |
| def9 | Recepção Perfeita | 2 | 5 | energyRefund1 | precision |

### Setting (4 unlocked + set4 locked)
| id | Nome | Cost | Power | Bonus | Tag |
|---|---|---|---|---|---|
| set1 | Levantamento Alto | 1 | 0 | atkBoost3 | power |
| set2 | Levantamento Rápido | 2 | 0 | atkBoost6 | power |
| set3 | Levantamento de Costas | 1 | 0 | aiDefMinus2 | precision |
| set5 | Levantamento Rasteiro | 0 | 0 | costReduceNext1 | tempo |

### Attack (5 unlocked + atk6/atk7 locked)
| id | Nome | Cost | Power | Bonus | Tag |
|---|---|---|---|---|---|
| atk1 | Cortada Diagonal | 2 | 6 | — | power |
| atk2 | Ponta Aberta | 1 | 3 | — | tempo |
| atk3 | Bola na Linha | 3 | 9 | — | power |
| atk4 | Finta | 1 | 2 | aiDefMinus2 | precision |
| atk5 | Ataque Fundo | 2 | 5 | — | tempo |

### Block (4 unlocked + blk4 locked)
| id | Nome | Cost | Power | Bonus |
|---|---|---|---|---|
| blk1 | Bloqueio Simples | 1 | 3 | — |
| blk2 | Paredão | 2 | 6 | — |
| blk3 | Leitura de Bloqueio | 1 | 4 | — |
| blk5 | Bloqueio Antecipado | 1 | 2 | costReduceNext1 |

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
| `costReduceNext1` | Próxima carta jogada custa -1 energia (mín. 0) | `input.js:applyBonus` (sets `G.costDiscount`, consumido via `input.js:payCost()`) |
| `energyRefund1` | +1 energia se a defesa resultar em `vantagem_defensiva`+ | `combat.js:resolveDefense()` (não passa por `applyBonus`, é condicional ao resultado) |

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
