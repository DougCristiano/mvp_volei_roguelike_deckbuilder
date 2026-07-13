# CARTAS.md — Guia Completo do Sistema de Cartas

> **Fonte da verdade:** `data.js` (CARDS_DB). Este documento é a visão consolidada de design.
> Atualizado em: 2026-07-13 · **33 cartas implementadas** (25 disponíveis desde o início + 8 desbloqueáveis por XP)
> Para as 120 cartas futuras ainda não implementadas, ver `docs/card-catalog.md` (design only).

---

## 1. Anatomia de uma carta

| Campo | O que é |
|---|---|
| **Tipo** | `service`, `defense`, `setting`, `attack`, `block` ou `coach` — define em qual fase do rally a carta pode ser jogada |
| **Custo** | Energia (⚡) gasta para jogar. Você tem 10⚡ por ponto; zerar a energia força uma bola livre |
| **Poder** | Valor usado na resolução (gap de defesa, força do ataque). Settings e coaches têm poder 0 — o valor deles está no bônus |
| **Tag** | ⚡ Potência / 🎯 Precisão / 🔄 Ritmo — identidade de combo (só em defense/setting/attack). Aparece como emoji no canto da carta |
| **Bônus** | Efeito extra ao jogar (ver §5) |
| **Nível** | 🟢 básico / 🟡 intermediário / 🔴 avançado — raridade nas recompensas (60/30/10 de peso) |

---

## 2. As 33 cartas

### 🏐 Saque (4)
| id | Carta | Nível | Custo | Poder | Bônus | Como obter |
|---|---|---|---|---|---|---|
| srv1 | Saque Flutuante | 🟢 | 1 | 3 | — | Deck base |
| srv2 | Saque Potente | 🟡 | 2 | 5 | — | Deck base |
| srv3 | Saque Tático | 🟢 | 0 | 1 | — | Deck base |
| srv4 | Saque Viagem | 🟡 | 2 | 6 | — | 🔒 120 XP de Saque |

> Saques não têm tag (o combo começa na defesa). Quanto maior o poder do saque, maior a chance de erro: `5% + poder×3%` (Saque Potente = 20% de erro; Tático = 8%).

### 🛡️ Defesa (9)
| id | Carta | Nível | Custo | Poder | Tag | Bônus | Como obter |
|---|---|---|---|---|---|---|---|
| def1 | Manchete Firme | 🟢 | 1 | 4 | 🔄 | — | Deck base |
| def2 | Mergulho | 🟢 | 0 | 2 | 🔄 | — | Recompensa |
| def3 | Leitura de Jogo | 🟡 | 2 | 4 | 🎯 | +2 Energia | Deck base |
| def4 | Posicionamento Perfeito | 🟡 | 2 | 7 | ⚡ | — | Deck base |
| def5 | Defesa de Manchete | 🟡 | 1 | 5 | ⚡ | — | Recompensa |
| def6 | Defesa Heroica | 🔴 | 3 | 10 | ⚡ | — | Recompensa |
| def9 | Recepção Perfeita | 🟡 | 2 | 5 | 🎯 | +1⚡ se defesa sair Vantagem Defensiva+ | Recompensa |
| def7 | Defesa Raspando | 🟡 | 1 | 6 | 🔄 | — | 🔒 120 XP de Defesa |
| def8 | Interceptação | 🔴 | 2 | 8 | 🎯 | +2 Energia | 🔒 250 XP de Defesa |

### 🤲 Levantamento (5)
| id | Carta | Nível | Custo | Poder | Tag | Bônus | Como obter |
|---|---|---|---|---|---|---|---|
| set1 | Levantamento Alto | 🟢 | 1 | 0 | ⚡ | +3 poder no ataque | Deck base |
| set2 | Levantamento Rápido | 🔴 | 2 | 0 | ⚡ | +6 poder no ataque | Recompensa |
| set3 | Levantamento de Costas | 🟡 | 1 | 0 | 🎯 | Adversário defende com -2 | Deck base |
| set5 | Levantamento Rasteiro | 🟢 | 0 | 0 | 🔄 | Próxima carta custa -1⚡ | Deck base |
| set4 | Tabela de Braço | 🟡 | 2 | 0 | ⚡ | +6 poder no ataque | 🔒 120 XP de Levantamento |

### ⚡ Ataque (7)
| id | Carta | Nível | Custo | Poder | Tag | Bônus | Como obter |
|---|---|---|---|---|---|---|---|
| atk1 | Cortada Diagonal | 🟡 | 2 | 6 | ⚡ | — | Deck base |
| atk2 | Ponta Aberta | 🟢 | 1 | 3 | 🔄 | — | Deck base |
| atk3 | Bola na Linha | 🔴 | 3 | 9 | ⚡ | — | Recompensa |
| atk4 | Finta | 🟡 | 1 | 2 | 🎯 | Adversário defende com -2 | Deck base |
| atk5 | Ataque Fundo | 🟢 | 2 | 5 | 🔄 | — | Recompensa |
| atk6 | Cortada Cruzada | 🟡 | 2 | 7 | ⚡ | — | 🔒 120 XP de Ataque |
| atk7 | Ataque Pipe | 🔴 | 3 | 10 | ⚡ | +2 poder no próximo ataque | 🔒 250 XP de Ataque |

> O erro de ataque escala com o poder **total** (base + boosts): `5% + total×2%`. Um ataque turbinado para 15 tem 35% de chance de sair — potência tem preço.

### 🧱 Bloqueio (5)
| id | Carta | Nível | Custo | Poder | Bônus | Como obter |
|---|---|---|---|---|---|---|
| blk1 | Bloqueio Simples | 🟢 | 1 | 3 | — | Deck base |
| blk2 | Paredão | 🟡 | 2 | 6 | — | Deck base |
| blk3 | Leitura de Bloqueio | 🟢 | 1 | 4 | — | Deck base |
| blk5 | Bloqueio Antecipado | 🟢 | 1 | 2 | Próxima carta custa -1⚡ | Recompensa |
| blk4 | Duplo Bloqueio | 🟡 | 2 | 7 | — | 🔒 120 XP de Bloqueio |

> Bloqueios não têm tag (ficam fora da sequência de combo). Resultado do bloqueio: 20% ponto direto / 20% bola fora (ponto perdido) / 30% amortece o ataque pela metade / 30% rally continua.

### 📋 Técnico (3) — meta-cartas
| id | Carta | Nível | Custo | Poder | Bônus | Como obter |
|---|---|---|---|---|---|---|
| cch1 | Foco do Técnico | 🟢 | 0 | 0 | +2 Energia | Recompensa |
| cch2 | Chamada do Técnico | 🟡 | 1 | 0 | +1 opção extra de carta | Recompensa |
| cch3 | Estratégia do Técnico | 🔴 | 1 | 0 | +3 poder no próximo ataque | 🔒 150 XP de Técnico |

> **Regras do Técnico:** 1 uso por ponto; só pode ser jogado **junto** com uma carta de fase (nunca sozinho); o bônus dele resolve **antes** do custo da carta de fase (ex: Foco do Técnico devolve 2⚡ antes de pagar o ataque). Não entra no deck base — só via recompensas.

---

## 3. Sistema de Combos

### Combo genérico (sequência)
Jogar **defesa → levantamento → ataque** no mesmo rally = **+2 de poder no ataque**. Qualquer combinação de cartas serve.

### Combos de tag (trinca da mesma identidade)
Se as **3 cartas da sequência tiverem a mesma tag**, o bônus genérico é substituído por um payoff mais forte:

| Trinca | Payoff | Em vez de |
|---|---|---|
| ⚡⚡⚡ **Combo de Potência** | **+4 poder** no ataque | +2 |
| 🎯🎯🎯 **Combo de Precisão** | Adversário defende com **-3** (acumula com os debuffs das cartas!) | +2 poder |
| 🔄🔄🔄 **Combo de Ritmo** | **+2 Energia** de volta | +2 poder |

### Rotas concretas (deck base — todas garantidas desde o 1º ponto)

**⚡ Rota de Potência** — `Posicionamento Perfeito → Levantamento Alto → Cortada Diagonal`
Custo 5⚡ · Ataque final: 6 + 3 (set1) + 4 (combo) = **13**. A rota de dano bruto. Upgrades: def6, set2, atk3/atk6/atk7 elevam o teto para 9+6+4 = **19** (com 23% de erro — risco real).

**🎯 Rota de Precisão** — `Leitura de Jogo → Levantamento de Costas → Finta`
Custo 4⚡ (def3 devolve 2 → líquido 2⚡) · Ataque de só 2, MAS a defesa adversária sofre **-2 (set3) -2 (atk4) -3 (combo) = -7**. Contra uma defesa de 8, o gap vira 2-1 = +1... na prática o ataque fraco vence porque o adversário defende com quase nada. A rota "mago de debuff". Upgrades: def8/def9.

**🔄 Rota de Ritmo** — `Manchete Firme → Levantamento Rasteiro → Ponta Aberta`
Custo: 1⚡ (def1) + 0 (set5) + 0 (atk2 com desconto do set5) = **1⚡ total**, e o combo devolve +2⚡ → **você TERMINA o rally com mais energia do que gastou**. Ataque modesto (3), mas sustenta rallies longos e alimenta os pontos seguintes. Upgrades: def7, atk5, blk5.

### Regras de quebra
- Jogar uma carta fora da sequência esperada (ou de tag diferente no meio) **não cancela** o combo genérico — só o payoff de tag (cai no +2).
- Saque não participa nem quebra o combo. Técnico é ignorado (não quebra).
- O progresso zera a cada novo ponto.

---

## 4. Como ganhar cartas

### 4.1 Deck base da campanha (15 cartas, curado)
Todas as duplas começam com: `srv1, srv2, srv3 · def1, def3, def4 · set1, set3, set5 · atk1, atk2, atk4 · blk1, blk2, blk3`.
A curadoria garante que **as 3 rotas de combo existem desde o primeiro ponto** (definida em `campaign.js:BASE_DECK_CARDS`).

### 4.2 Bônus de especialidade da dupla (+2 cartas)
Cada dupla adiciona +2 cartas do seu tipo especialista (as próximas não-bloqueadas do banco):
- **Os Meteoros** (ataque): + `atk3` Bola na Linha, `atk5` Ataque Fundo → deck 17
- **A Muralha** (bloqueio): + `blk5` Bloqueio Antecipado + 1 repetida → deck 17
- **A Fortaleza** (defesa): + `def2` Mergulho, `def5` Defesa de Manchete → deck 17

### 4.3 Recompensas de vitória (durante a campanha)
Ao vencer cada partida, você escolhe **1 de 3 cartas** para adicionar ao deck:
- Cartas que você **desbloqueou com XP** e ainda não tem **aparecem garantidas** nas opções (prioridade máxima)
- As demais vagas são sorteadas por raridade: 🟢 60% / 🟡 30% / 🔴 10%
- Nunca oferece carta que você já tem no deck

### 4.4 Desbloqueio por XP (permanente, entre campanhas)
Cada partida rende XP **por categoria** (salvo em localStorage, persiste entre campanhas):

| Evento | XP |
|---|---|
| Jogar uma partida | +10 por categoria |
| Vencer a partida | +20 extra |
| Completar a campanha (3 vitórias) | +50 extra |
| Especialidade da sua dupla | ×1.5 em cima do total |

Exemplo: vencer uma partida com Os Meteoros = 30 XP em tudo, **45 XP em Ataque**.

**Tabela de desbloqueio** (gasta o XP da categoria, no catálogo `catalog.html`):

| Carta | Custo |
|---|---|
| srv4 Saque Viagem | 120 XP Saque |
| def7 Defesa Raspando | 120 XP Defesa |
| def8 Interceptação | 250 XP Defesa |
| set4 Tabela de Braço | 120 XP Levantamento |
| atk6 Cortada Cruzada | 120 XP Ataque |
| atk7 Ataque Pipe | 250 XP Ataque |
| blk4 Duplo Bloqueio | 120 XP Bloqueio |
| cch3 Estratégia do Técnico | 150 XP Técnico |

Depois de desbloqueada, a carta entra no pool de recompensas **com prioridade garantida** (§4.3).

### 4.5 Troca em jogo (reroll)
Durante qualquer fase: selecionar 1 carta e usar **Trocar (1⚡)** descarta e compra outra opção válida da mesma fase.

---

## 5. Referência de bônus

| Bônus | Efeito | Cartas |
|---|---|---|
| `energy2` | +2⚡ imediato | def3, def8, cch1 |
| `energyRefund1` | +1⚡ **se** a defesa resultar em Vantagem Defensiva ou Defesa Dominante | def9 |
| `atkBoost2/3/6` | +N poder no próximo ataque (acumula) | atk7 (+2), set1/cch3 (+3), set2/set4 (+6) |
| `aiDefMinus2` | Adversário defende com -2 (acumula) | set3, atk4 |
| `costReduceNext1` | A próxima carta jogada custa -1⚡ (mín. 0) | set5, blk5 |
| `draw1` | +1 opção extra de carta | cch2 |

---

## 6. Interação com as passivas das duplas

| Dupla | Passiva | Sinergia de cartas |
|---|---|---|
| 🔥 **Os Meteoros** | +2 poder em todo ataque | Amplifica a rota ⚡; até a Finta (2) vira ameaça (4). Cuidado: o +2 também aumenta a chance de erro do ataque |
| 🧱 **A Muralha** | 1º bloqueio do ponto grátis; demais -1⚡ | blk5 fica custo 0 e ainda desconta a próxima carta; bloquear sempre vale a tentativa |
| 🛡️ **A Fortaleza** | +2 no gap de defesa; +10% de sucesso quando o gap não basta | def9 dispara o refund com mais frequência (gap deslocado alcança Vantagem Defensiva mais fácil); rota 🎯 e defesas ⚡ ficam mais confiáveis |

---

## 7. Tiers de defesa (contexto para def9 e para a rota 🎯)

Gap = poder da defesa − poder do ataque (após debuffs):

| Tier | Gap | Sucesso | Bônus no próximo ataque |
|---|---|---|---|
| 💥 Ataque Dominante | ≤ -7 | 0% | -2 |
| ⚡ Vantagem Ofensiva | -6 a -4 | 25% | -1 |
| ⚖️ Equilíbrio | -3 a +3 | 95% | 0 |
| 🛡️ Vantagem Defensiva | +4 a +6 | 97% | +2 |
| ⭐ Defesa Dominante | ≥ +7 | 97% | +4 |

Defender bem não só salva o ponto — **carrega bônus pro seu contra-ataque** (+2/+4), que soma com levantamentos e combos.

---

## 8. Roadmap de cartas (futuro)

- **120 cartas desenhadas** aguardando implementação em `docs/card-catalog.md` (30 ataque, 30 defesa, 22 levantamento, 22 bloqueio, 16 saque), organizadas em 8 archetypes de build (Potência, Técnica, Resistência, Leitura de Jogo, Pressão, Bloqueio, Recepção, Moral)
- Efeitos **condicionais** (ex: "se o placar estiver empatado...") dependem de um motor de condições ainda não implementado (backlog)
- Visão de "Atos": a cada Ato (10-15 partidas), o jogador escolheria ~5 cartas novas — a campanha atual de 3 partidas é o demo desse loop
