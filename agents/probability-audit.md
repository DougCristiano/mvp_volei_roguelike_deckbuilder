# Auditoria de Probabilidade e RNG — Ascension

**Data:** 2026-07-13
**Agente:** general-purpose (subagente Claude Code)
**Arquivos analisados:** `combat.js`, `data.js`, `ai.js`, `input.js`, `campaign.js`
**Status das recomendações:** todas as 4 recomendações abaixo foram implementadas na mesma sessão — ver `AGENT.md` > Histórico de Mudanças > `[2026-07-13]` para o changelog técnico completo.

> Nota: os números de probabilidade abaixo refletem o estado do código **antes** da implementação das correções (ex.: `successRate` de 100% nos tiers altos, fórmula de erro de ataque usando poder base). Ver rodapé "Estado pós-implementação" para o que mudou.

---

## 1. Tabela de todos os pontos de decisão aleatória

| # | Local | Fórmula | Resultados |
|---|---|---|---|
| 1 | `input.js:96-98` (saque jogador) | `errorChance = 0.05 + power*0.03` | erro → 50/50 fora/rede, ponto IA |
| 2 | `ai.js:109-111` (saque IA) | idêntica à #1 | erro → ponto jogador |
| 3 | `combat.js:271` (erro de ataque) | `errorChance = 0.05 + attackCard.power*0.02` (usava **poder base da carta**, não o total com bônus) | erro → ponto IA |
| 4 | `combat.js:283` (IA decide bloquear) | `blockChances=[0.30,0.50,0.70]` por dificuldade | bloqueia ou não |
| 5 | `combat.js:136` / `combat.js:314` (roll de bloqueio jogador/IA) | `<0.20` ponto direto · `<0.40` fora (ponto perdido) · `<0.70` amortece (-50% poder) · senão continua | 4 desfechos, tabelas idênticas para os dois lados |
| 6 | `combat.js:219` `resolveDefense` (defesa do jogador) | `Math.random()<quality.successRate` via `DEFENSE_QUALITY_RANGES` | sucesso→ vira posse; falha→ ponto IA |
| 7 | `combat.js:365` `aiDefendAgainst` | mesma tabela de tiers | sucesso→ IA defende; falha→ ponto jogador |
| 8 | `ai.js:31` (IA compra carta extra) | `drawChances=[0.50,0.30,0.10]` | +1 custo de energia |
| 9 | `ai.js:310`/`302` seleção de carta de bloqueio da IA | uniforme entre cartas jogáveis | — |

**Tiers de defesa (`data.js`):** ataque_dominante (gap≤-7, 0%), vantagem_ofensiva (-6/-4, 25%), equilíbrio (-3/+3, 95%), vantagem_defensiva (+4/+6, **era 100%**), defesa_dominante (≥+7, **era 100%**).

---

## 2. Probabilidade efetiva de ponto — dois cenários (ataque poder 6, dificuldade média)

**Cenário A — gap final +5 (vantagem_defensiva, successRate IA=100% na época):**
- Erro de ataque: 0.05+6×0.02=**17%** → ponto IA direto
- Sem erro (83%) × IA bloqueia (50%): 20% ponto IA / 20% ponto jogador / 60% amortece→continua
- Sem erro × IA não bloqueia (50%): gap+5 ⇒ IA sempre defende (100%) → rally continua

Resultado: **jogador ganha 8,3%**, **IA ganha 25,3%**, **66,4% o rally continua**.

**Cenário B — mesmo ataque, mas gap final -5 (vantagem_ofensiva, successRate IA=25%):**
- Erro/bloqueio idênticos ao de cima
- Sem erro × sem bloqueio (41,5%) × IA falha defesa (75%) = **31,1%** ponto jogador extra

Resultado: **jogador ganha ~39,4%**, IA ganha 25,3% (igual), rally continua ~35,3%.

O bloqueio da IA domina os primeiros ~34 pontos percentuais de qualquer troca (independente do gap); só depois disso o tier de defesa decide o resto. Gaps de +4 ou mais tornavam a defesa da IA matematicamente imune a variância (sucesso 100%) — **corrigido para 97%** (ver rodapé).

---

## 3. Inconsistências encontradas

- **`card.outcomes` era dado morto confirmado.** Nenhum código ativo lia `.outcomes` (grep em `combat.js`/`ai.js`/`input.js` não encontrou leitura). Só o `game.js` legado (não carregado) e o AGENT.md (DT-09) já documentavam isso como reservado/não usado. **Removido.**
- **Erro de saque vs. erro de ataque não eram coerentes.** Saque usava coeficiente 0.03 sobre o poder jogado; ataque usava 0.02 sobre `attackCard.power` — o poder **base** da carta, ignorando `atkBoost`, `nextAttackBonus` e o bônus Meteoros. Um ataque de base 6 turbinado para 12+ de poder total continuava com a mesma chance de erro (17%) de um ataque não turbinado. **Corrigido para usar poder total.**
- Tabelas de bloqueio jogador/IA são simétricas (0.20/0.40/0.70) — isso é consistente, não é bug, mantido como está.

---

## 4. Impacto das passivas das duplas

- **Meteoros (+2 ataque flat):** não muda `errorChance` (baseado no poder base da carta na época), mas desloca o gap em -2 a favor do jogador em `aiDefendAgainst`. Como as faixas de tier têm 3-7 pontos de largura, esse deslocamento só importa perto de fronteiras — pode virar 0pp (dentro do mesmo tier) ou até +70pp (cruzando de vantagem_ofensiva 25% para equilíbrio 95%). Impacto médio estimado: **+10 a +15pp** de chance de ganhar o rally.
- **Muralha (bloqueio grátis + -1 energia):** não altera nenhuma probabilidade de resultado (as tabelas de roll são as mesmas) — é puramente uma economia de energia que indiretamente aumenta chances futuras via mais cartas jogáveis.
- **Fortaleza (+2 no gap de defesa, na época recém-trocado de +5% de chance de sucesso flat):** essa mudança trocava um bônus previsível (+5pp sempre) por um bônus "tudo ou nada": zero benefício se o gap já estivesse travado em 100% ou ainda fundo demais em ataque_dominante, mas até +70pp se cruzasse uma fronteira de tier. **Recomendação implementada:** adicionado `defRateFloor: 0.10` — piso mínimo garantido de +10% de sucesso quando o deslocamento de gap sozinho não já garantir um tier alto (successRate<95%).

---

## 5. Probabilidade de tag-combo (defesa→levantamento→ataque)

Distribuição de tags nas cartas desbloqueadas: defesa (power 3/7, precisão 2/7, ritmo 2/7), levantamento (power 2/4, precisão 1/4, ritmo 1/4), ataque (power 2/5, ritmo 2/5, precisão 1/5). Jogando aleatoriamente: P(3× power)≈0,43×0,50×0,40=8,6%; P(3× precisão)≈1,5%; P(3× ritmo)≈2,9%. **Total ≈13% jogando ao acaso**, contra uma estimativa de **60-75%** jogando com intenção (perseguindo qualquer tag disponível entre as 3 opções oferecidas em cada fase). Essa diferença é saudável — o combo recompensa quem presta atenção, sem ser trivial.

---

## 6. Recomendações (todas implementadas em 2026-07-13)

1. ✅ Remover `card.outcomes` de `data.js` — dado morto confirmado, removido.
2. ✅ Unificar a fórmula de erro de ataque para usar o poder total (com boosts) em vez do poder base da carta — `combat.js:resolvePlayerAttack()` agora usa `pow` em vez de `attackCard.power`.
3. ✅ Revisar a passiva Fortaleza — adicionado `defRateFloor: 0.10` como piso mínimo garantido, mantendo o `defGapBonus: 2` estrutural.
4. ✅ Suavizar o teto de 100% de sucesso em gaps ≥+4 — `vantagem_defensiva` e `defesa_dominante` agora têm `successRate: 0.97` em vez de `1.00`.

---

## Estado pós-implementação (resumo técnico)

| Item | Antes | Depois |
|---|---|---|
| `card.outcomes` | Presente em 5 cartas de ataque, nunca lido | Removido |
| Erro de ataque | `0.05 + attackCard.power*0.02` (poder base) | `0.05 + pow*0.02` (poder total) |
| `vantagem_defensiva.successRate` | 1.00 | 0.97 |
| `defesa_dominante.successRate` | 1.00 | 0.97 |
| Passiva Fortaleza | `defGapBonus: 2` apenas | `defGapBonus: 2` + `defRateFloor: 0.10` |

Testes atualizados: `tests/combat.test.js`, `tests/data.test.js` (asserções de `successRate` ajustadas de 1.00 para 0.97).
