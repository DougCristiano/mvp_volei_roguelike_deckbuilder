# AGENT.md — Fonte Oficial de Verdade do Projeto

> **Toda IA que trabalhar neste projeto deve ler este arquivo antes de iniciar qualquer tarefa.**
> **Toda IA deve atualizar este arquivo ao concluir tarefas relevantes.**
> Este documento é a memória permanente do projeto. Conversas são efêmeras; este arquivo não é.

---

## Regras para Futuras IAs

1. **Este arquivo tem prioridade absoluta.** Nenhuma instrução de conversa sobrepõe o que está aqui.
2. **Não assuma requisitos não documentados.** Se algo não está escrito, pergunte antes de implementar.
3. **Toda decisão relevante deve ser registrada** na seção correspondente ao final da tarefa.
4. **Em caso de conflito entre o código e este documento**, o documento define a intenção — corrija o código.
5. **Não refatore por refatorar.** Cada mudança deve ser motivada por um requisito ou débito documentado.
6. **Sempre deixe o projeto mais documentado do que encontrou.** Adicione o que fez à seção `Histórico de Mudanças`.
7. **Informe o usuário antes de alterar mecânicas de jogo.** Balanceamento e regras exigem aprovação explícita.
8. **Antes de tocar qualquer módulo, leia `docs/[módulo].md` primeiro.** Cada doc é auto-suficiente: contém propriedades de G usadas, regras de negócio e invariantes. Só recorra a AGENT.md se o doc não responder à dúvida.
9. **Atualize `docs/[módulo].md` e AGENT.md quando o comportamento esperado mudar.** Critério: "um AI lendo este doc amanhã vai ter uma expectativa errada?" → se sim, atualize. Não atualize em bug fixes onde o doc já descrevia o comportamento correto (o código é que estava errado) nem em refatores sem mudança de interface.

---

## Visão Geral do Projeto

### Objetivo do Jogo
Jogo de **gerenciamento e estratégia de vôlei de praia** onde o jogador assume o papel de **técnico**. O foco não é o controle direto dos atletas em tempo real, mas a **tomada de decisão tática**: escolher ações, gerenciar recursos e ler o estado da partida para vencer rallies e sets.

### Público-alvo
- Jogadores casuais/intermediários que apreciam jogos de estratégia com tema esportivo
- Fãs de deckbuilders e roguelikes
- Público brasileiro (idioma principal: Português do Brasil)

### Plataforma
- Web (browser) — HTML/CSS/JavaScript puro, sem framework
- Responsivo: celulares modernos até monitores 4K
- Sem instalação, sem backend obrigatório para o modo single-player

### Diferenciais do Produto
- Decisões com peso real: cada carta jogada consome recursos e tem consequências
- Sistema de Combo que recompensa sequências táticas corretas
- Multiplayer peer-to-peer via PeerJS (sem servidor dedicado)
- Visual limpo de tema praia com feedback sonoro via Web Audio API
- Janelas de decisão com timer (bloqueio e defesa) criam urgência

### Filosofia de Design
> **"Informação suficiente para decidir, peso real para cada escolha."**

1. O jogador sempre tem informação estratégica visível
2. Nenhuma tela ou popup bloqueia dados críticos (energia, placar, fase)
3. Recursos são escassos — gastar mal tem consequência imediata
4. Recompensar leitura de jogo e planejamento, não reflexo rápido
5. A interface serve à estratégia, nunca a atrapalha

---

## Game Design Document (GDD)

### Loop Principal
```
[Menu] → [Iniciar Ponto] → [Saque] → [Rally] → [Resultado do Ponto]
             ↑                                          |
             └──────────────[Próximo Ponto]─────────────┘
                                 ↓
                          [Fim do Set] → [Fim da Partida]
```

### Fluxo de um Rally (modo AI)
```
Saque do Jogador
  ├── Erro (5% + power*3%) → out → Ponto da IA
  └── Saque bem-sucedido
        └── Janela de Defesa da IA (15s)
              ├── Defesa falha → Ponto do Jogador
              └── Defesa OK → IA vai para Levantamento → Ataque
                    └── Ataque da IA para o Jogador
                          ├── Erro do Ataque (5% + power*2%) → Ponto do Jogador
                          └── Ataque OK
                                └── IA Tenta Bloquear? (60% chance)
                                      ├── Bloqueia Direto (20%) → Ponto da IA
                                      ├── Para fora (20%) → Ponto do Jogador
                                      └── Bloqueia bem-sucedido (60%) → Poder reduzido a 50%
                                            └── Janela de Bloqueio do Jogador (15s)
                                                  ├── Jogador bloqueia → 20% ponto / 20% fora / 60% bem-sucedido (poder reduzido)
                                                  └── Sem bloqueio → Janela de Defesa (15s)
                                                        └── gap = defPow − attackPow → quality tier
                                                              ├── success → Defesa OK → Levantamento → Ataque
                                                              └── falha → Ponto da IA

Saque da IA
  └── Janela de Defesa do Jogador (15s)
        └── gap = defPow − aiAtkPow → quality tier
              ├── success → Posse do Jogador + nextAttackBonus → Levantamento → Ataque
              │     └── (mesmo fluxo com bloqueio da IA)
              └── falha → Ponto da IA
```

#### Sistema de Qualidade de Defesa — 5 Tiers GDD (gap-based)
| Tier | Chave | Gap | Taxa de Sucesso | nextAtkBonus |
|---|---|---|---|---|
| 💥 Ataque Dominante | `ataque_dominante` | ≤ -7 | 0% | -2 |
| ⚡ Vantagem Ofensiva | `vantagem_ofensiva` | -6 a -4 | 25% | -1 |
| ⚖️ Equilíbrio | `equilibrio` | -3 a +3 | 95% | 0 |
| 🛡️ Vantagem Defensiva | `vantagem_defensiva` | +4 a +6 | 100% | +2 |
| ⭐ Defesa Dominante | `defesa_dominante` | ≥ +7 | 100% | +4 |

`nextAttackBonus` é aplicado automaticamente no próximo ataque do time que defendeu.
Tanto o jogador (`G.nextAttackBonus`) quanto a IA (`G.aiNextAtkBonus`) acumulam o bônus.

### Fases do Rally (PHASE_NAMES)
| Fase | ID | Descrição |
|---|---|---|
| Saque | `service` | Primeiro toque, inicia o rally |
| Defesa/Recepção | `defense` | Primeiro toque defensivo |
| Levantamento | `setting` | Segundo toque, prepara o ataque |
| Ataque | `attack` | Terceiro toque ofensivo |
| Bloqueio | `block` | Reação rápida ao ataque adversário |

### Condições de Vitória
- **Ponto**: vencer o rally
- **Set**: atingir 5 pontos com vantagem mínima de 2 (ex.: 5×3 ✓, 5×4 ✗)
- **Partida** (MVP): 1 set define o vencedor (configurável — ver Backlog)

### Sistemas Principais

#### Sistema de Cartas
- Baralho de **42 cartas** montado no início de cada ponto (`buildDeck`): 7 cópias de cada tipo (service, setting, attack, defense, block, coach)
- A mão exibe **3 opções** relevantes à fase atual
- Trocar uma carta custa **1 de energia** (`rerollOption`)
- Baralho se reconstrói automaticamente quando esgota (embaralha o descarte)
- Cada carta tem: `id`, `name`, `type`, `level`, `cost`, `power`, `desc`, `phases[]`, `bonus?`

**Seleção de Cartas (Combo Coach)**
- Cada ação de jogo permite **máximo 2 cartas**: 1 de fase (obrigatória) + 1 coach (opcional)
- Não é possível jogar só coach ou 2 cartas da mesma fase
- **Cartas Coach (Dica do Treinador)**: tipo `'coach'`, aparecem em **todas as fases** de jogo
  - Sempre têm `phases:['coach']` (sem fase específica)
  - Sempre têm `power:0` (modificador, não contribuem a poder de defesa/ataque)
  - Limite de **1 por ponto** (`G.coachUsed = true`); desaparecem das mãos subsequentes do mesmo ponto
  - Bônus aplicado **antes** da carta de fase (permite energy2 restaurar energia antes de debitar custo)
  - Em janelas de bloqueio/defesa: coach conta como 1 da seleção multi-select, mas sem conflitar com carta de bloqueio/defesa

#### Sistema de Energia
- Jogador: 10 de energia máxima (`G.energy = 10`, `G.maxEnergy = 10`)
- IA: 10 de energia máxima (`G.aiEnergy = 10`, `G.maxAiEnergy = 10`)
- Energia exibida como **pips visuais** no header para ambos
- Energia se **recupera ao máximo** a cada novo ponto (`startPoint`)
- Energia zera → **Freeball** (bola livre enviada ao adversário, +2 energia de recuperação)
- Passar a bola voluntariamente concede **+2 energia**

#### Sistema de Combo
- Sequência confirmada: `COMBO_SEQ = ['defense', 'setting', 'attack']`
- Completar a sequência completa concede **+2 de poder** no ataque e dispara efeito sonoro
- A defesa bem-sucedida inicia o combo (`G.comboIdx = 1`)
- Carta de `coach` não quebra o combo

#### Sistema de Bônus de Cartas
| bonus | Efeito |
|---|---|
| `energy2` | +2 energia imediata (restaura antes de debitar carta de fase) |
| `atkBoost3` | +3 no poder do próximo ataque |
| `atkBoost6` | +6 no poder do próximo ataque |
| `aiDefMinus2` | Adversário defende com -2 no próximo ataque |
| `draw1` | Garante que coach aparece no próximo draw (sem efeito adicional) |

#### Timers de Decisão
- **Bloqueio**: 15 segundos (`G.blockTimerVal`, `tickBlockTimer`)
- **Defesa**: 15 segundos (`G.defTimerVal`, `tickDefTimer`)
- Timeout = resolve automaticamente com poder 0 (derrota na defesa) ou sem bloqueio

### Banco de Cartas Atual (CARDS_DB)

#### Saque (3 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| srv1 | Saque Flutuante | 1 | 3 | — |
| srv2 | Saque Potente | 2 | 5 | — |
| srv3 | Saque Tático | 0 | 1 | — |

#### Defesa (6 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| def1 | Manchete Firme | 1 | 4 | — |
| def2 | Mergulho | 0 | 2 | — |
| def3 | Leitura de Jogo | 2 | 4 | energy2 |
| def4 | Posicionamento Perfeito | 2 | 7 | — |
| def5 | Defesa de Manchete | 1 | 5 | — |
| def6 | Defesa Heroica | 3 | 10 | — |

#### Levantamento (3 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| set1 | Levantamento Alto | 1 | 0 | atkBoost3 |
| set2 | Levantamento Rápido | 2 | 0 | atkBoost6 |
| set3 | Levantamento de Costas | 1 | 0 | aiDefMinus2 |

#### Ataque (5 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| atk1 | Cortada Diagonal | 2 | 6 | — |
| atk2 | Ponta Aberta | 1 | 3 | — |
| atk3 | Bola na Linha | 3 | 9 | — |
| atk4 | Finta | 1 | 2 | aiDefMinus2 |
| atk5 | Ataque Fundo | 2 | 5 | — |

> Resolvido (ver Histórico de Mudanças): o campo `outcomes` (point/blocked/out/net) foi removido
> por ser dado morto — nunca era lido pela resolução de combate. Erro de ataque é `resolvePlayerAttack()`
> (`combat.js`); bloqueio/defesa da IA seguem a lógica de gap-based defense quality normalmente.

#### Bloqueio (3 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| blk1 | Bloqueio Simples | 1 | 3 | — |
| blk2 | Paredão | 2 | 6 | — |
| blk3 | Leitura de Bloqueio | 1 | 4 | — |

#### Coach / Dica do Treinador (2 cartas — disponíveis em **todas as fases**; **limite 1 por ponto**)
| id | Nome | Nível | Custo | Poder | Bônus |
|---|---|---|---|---|---|
| cch1 | Foco do Técnico | basico | 0 | 0 | energy2 |
| cch2 | Chamada do Técnico | intermediario | 1 | 0 | draw1 |

**Observações:**
- Coach sempre tem `phases: ['coach']` (não aparece em fases específicas, mas em TODAS)
- Coach sempre tem `power: 0` — não afeta cálculo de poder de defesa ou ataque
- Jogar coach requer **obrigatoriamente** uma carta de fase no mesmo turno
- Bônus coach é aplicado **antes** da carta de fase (order of operations: coach → energy restoration → phase card cost → phase effects)

### IA (modo single-player)
- **Seleciona cartas aleatoriamente** do pool filtrado por fase e custo disponível
- **30% de chance** de "comprar" uma carta antes de jogar (custo extra de -1 energia)
- Tenta executar sequência completa: defesa → levantamento → ataque
- Defende o ataque do jogador com a melhor carta que puder pagar
- Marcador `G.aiJustDefended` evita dupla contagem da defesa no combo da IA

---

## Mecânicas Confirmadas

### Qualidade de Defesa — 5 Tiers GDD ✅ Implementada
- Sistema de gap entre poder de defesa e poder de ataque
- **5 tiers simétricos** (migrado de 4 para 5 em 2026-06):
  - `ataque_dominante` (gap ≤-7, 0%, -2), `vantagem_ofensiva` (-6 a -4, 25%, -1)
  - `equilibrio` (-3 a +3, 95%, 0), `vantagem_defensiva` (+4 a +6, 100%, +2), `defesa_dominante` (≥+7, 100%, +4)
- Mudança-chave vs sistema anterior: gap -3–-1 antes era 30% (tier `ruim`), agora é 95% (tier `equilibrio`)
- `nextAttackBonus` para jogador, `aiNextAtkBonus` para IA — carry-forward automático
- Feedback visual via emoji e gap explícito no log

### Saque com Tipos de Erro ✅ Implementada
- Erro de saque dividido em "para fora" e "na rede" (50/50)
- Válido para jogador e IA; campo `errorType: 'out'|'net'` no multiplayer

### Energia ✅ Implementada
- Cada equipe possui energia máxima de 10
- Energia é exibida visivelmente para ambos no header (pips dourados)
- Cada carta jogada reduz energia pelo seu custo
- Trocar uma carta de mão custa 1 de energia
- Energia zera → freeball automático (lock + +2 energia de recuperação)
- Passar a bola voluntariamente concede +2 energia
- Energia se recupera ao máximo no início de cada ponto

### Fadiga ⏳ Planejada — Não Implementada
- Sistema global de fadiga acumulada entre rallies
- Fadiga aumenta conforme o número de rallies cresce
- Fadiga exibida em porcentagem
- Fadiga influencia: consumo de energia por carta, poder máximo das jogadas, recuperação de energia entre pontos
- **Débito técnico**: definir curva de fadiga e impacto no balanceamento antes de implementar

### Combo ✅ Implementado
- Sequência `defense → setting → attack` completa concede +2 poder de ataque
- Badge visual de combo ativo ("🔥 Combo!")
- Carta de suporte não quebra a sequência

### Tomada de Decisão Estratégica ✅ Parcialmente Implementada
- O jogador escolhe qual carta jogar em cada fase
- Pode trocar cartas com custo de energia
- Pode passar a bola voluntariamente (recupera energia, perde a fase ofensiva)
- Timer cria urgência real nas janelas de bloqueio e defesa
- **Visão futura**: o jogador assume papel de técnico com decisões de escala de jogadores, táticas de time, substituições

---

## UX e Interface

### Regras Invioláveis de UX

1. **Energia do jogador sempre visível** — nunca esconder os pips de energia durante decisões
2. **Energia do adversário sempre visível** — informação estratégica crítica para decisões de ataque/defesa
3. **Placar sempre acessível** — pontos e sets visíveis no header durante toda a partida
4. **Nenhum popup bloqueia o estado do jogo** — o painel de resolução (`#resolve-panel`) é in-flow, não absolute
5. **Informações críticas no campo visual primário** — header com score + energia é a âncora visual da tela

### Layout do Jogo (CSS Grid)
```
┌─────────────────────────────────────────┬───────────┐
│  #opponent-dashboard (flex, 3 seções)   │           │
│  [Você + energia] [Sets/Pts] [IA + nrg] │  #log-    │
├─────────────────────────────────────────┤  area     │
│                                         │ (col-rev  │
│  #court (quadra + rede + bola)          │  flex,    │
│                                         │  scroll)  │
├─────────────────────────────────────────┴───────────┤
│  #player-dashboard (flex coluna, full width)        │
│  [fase/badge] [resolve-panel] [hand] [ações]        │
└─────────────────────────────────────────────────────┘
```

### Estrutura CSS Grid do `#app`
```css
grid-template-columns: 1fr 220px;
grid-template-rows: auto 1fr auto;
height: 100svh; /* fallback: 100vh */
```

| Elemento | grid-column | grid-row |
|---|---|---|
| `#opponent-dashboard` | 1 | 1 |
| `#court` | 1 | 2 |
| `#log-area` | 2 | 1 / 3 |
| `#player-dashboard` | 1 / -1 | 3 |

### Header (`#opponent-dashboard`)
- `display: flex` — **não grid**
- `.header-energy` tem `flex: 1` — garante que ambos os lados crescem igualmente
- `.right-energy` tem `flex-direction: row-reverse` + `justify-content: flex-start` — **ATENÇÃO**: em `row-reverse`, `flex-start` = borda direita
- `.header-center` usa `flex: 0 0 auto` implícito — centralizado matematicamente entre os dois `flex:1`

### Log Sidebar (`#log-area`)
- `flex-direction: column-reverse` — entradas mais recentes aparecem no FUNDO
- `G.log.unshift(msg)` + `slice(0,12)` — os 12 mais recentes, mais novo no índice 0
- Com `column-reverse`, índice 0 renderiza visualmente no FUNDO (mais próximo do dashboard)
- Overflow: entradas antigas sobem e ficam invisíveis — sem necessidade de `scrollTop` via JS

### Painéis de Decisão (Janelas)
- `#resolve-panel`: **in-flow** (não position:absolute) dentro de `#decision-arena`
- `.block-mode`: borda coral/laranja — janela de bloqueio
- `.def-mode`: borda azul/sky — janela de defesa
- `#timer-wrapper`: exibe barra + contador numérico (`#timer-count`) lado a lado

### Botões de Ação
| Botão | ID | Contexto |
|---|---|---|
| Jogar Carta | `#btn-play` | Turno normal do jogador |
| Trocar (1⚡) | `#btn-reroll` | Sempre visível, desabilitado quando sem energia/seleção |
| Passar Bola | `#btn-pass` | Turno normal, exceto service e blockWindow |
| Confirmar Defesa | `#btn-resolve` | Somente defWindow |
| Confirmar Bloqueio | `#btn-block` | Somente blockWindow |
| Não Bloquear | `#btn-skip-block` | Somente blockWindow |
| Próximo Ponto | `#btn-next` | Somente point-result visível |

### Responsividade

| Breakpoint | Comportamento |
|---|---|
| `≥ 2560px` | Log 420px, cartas 144px, fontes grandes |
| `≥ 1920px` | Log 300px, cartas 110px |
| `≤ 1024px` | Log 190px, cartas 86px |
| `≤ 768px` | Single column, log vira faixa horizontal (52px) em `grid-row: 3` |
| `≤ 600px` | Cartas scroll horizontal (`nowrap` + `snap`), botões menores |
| `≤ 375px` | Cartas 63px, fontes mínimas |

### Tema Visual
Tema praia, claro. Variáveis CSS em `:root`:

| Variável | Valor | Uso |
|---|---|---|
| `--sand` | `#F5EDD6` | Fundo das cartas, áreas de areia |
| `--sand-dark` | `#E8D9B0` | Background dos dashboards |
| `--sand-border` | `#C9B87A` | Bordas gerais |
| `--sky` | `#2A6FA8` | Cor primária (botões, links) |
| `--sky-light` | `#5B9FD4` | Hover/acento |
| `--teal` | `#1D9E75` | Sucesso, pontos do jogador |
| `--coral` | `#D85A30` | Perigo, pontos da IA, bloqueio |
| `--energy-gold` | `#D4A017` | Pips de energia |
| `--text-dark` | `#2C2416` | Texto principal |
| `--text-mid` | `#6B5530` | Texto secundário |
| `--text-light` | `#9B8055` | Texto de apoio/labels |
| `--card-bg` | `#FFFDF5` | Background das cartas |

---

## Arquitetura Técnica

### Stack Atual
- **Frontend**: HTML5 + CSS3 + JavaScript ES6 (vanilla, sem framework)
- **Multiplayer**: PeerJS 1.5.4 (`https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`)
- **Áudio**: Web Audio API (oscilador + gain, sem arquivos externos)
- **Backend**: Nenhum — modo AI é 100% client-side
- **Banco de dados**: Nenhum — estado em memória (`G` object) + `CARDS_DB` hardcoded

### Estrutura de Arquivos
```
mvp_volei_roguelike_deckbuilder/
├── index.html          # HTML structure and UI elements (main menu + game UI)
├── campaign.html       # Team selection screen — 3 doubles teams, stats, passives; sets localStorage → index.html
├── campaign.js         # CAMPAIGN_TEAMS data + getCampaignTeam(); loaded after data.js
├── catalog.html        # Card collection viewer — unlocked (22) + locked (~99) cards, filters, progress bar
├── wiki.html           # Interactive encyclopedia — mechanics, card database, archetypes, stats, glossary
├── style.css           # All CSS: theme, layout, responsiveness
├── AGENT.md            # This file — project source of truth
├── BACKLOG.md          # Project backlog: completed features, in-progress, tiers 1-5 roadmap
├── TESTING.md          # Test guide: how to run, what is tested, adding new tests, CI setup
├── package.json        # Jest devDependency only (no build system — game is vanilla JS)
├── jest.config.js      # testEnvironment:node, match tests/**/*.test.js, 70% coverage threshold
│
├── tests/
│   ├── data.test.js    # Card schema, ID uniqueness, type/level/phase validity (~35 assertions)
│   ├── combat.test.js  # getDefenseQuality all boundaries, _checkWinCondition win/draw/loss (~40)
│   └── deck.test.js    # shuffle purity, buildDeck composition, clearHand, drawPhaseOptions (~35)
│
└── .github/
    └── workflows/
        └── ci.yml      # GitHub Actions: runs npm test on push/PR to main; uploads coverage artifact
│
├── data.js             # CARDS_DB, PHASE_NAMES, COMBO_SEQ, DEFENSE_QUALITY_RANGES
├── audio.js            # Web Audio API: playSound(), sounds{}
├── state.js            # G (global state), log(), newGame(), startPoint()
├── deck.js             # buildDeck(), shuffle(), resetDeck(), clearHand(), drawPhaseOptions()
├── render.js           # render(), renderHand(), renderResolve(), renderActions(), renderLog()
├── input.js            # canPlay(), selectCard(), playCard(), rerollOption(), applyBonus(), updateCombo()
├── combat.js           # getDefenseQuality(), resolveDefense(), resolveBlock(), resolvePlayerAttack(),
│                       # startDefenseWindow(), endPoint(), checkSet(), passBall(), checkFreeball()
├── ai.js               # aiTurn() — AI decision making
├── multiplayer.js      # sendData(), initializePeer(), connectToPeer(), setupConnectionHandlers()
├── main.js             # DOM event bindings, menu logic (no game logic here)
│
├── game.js             # ⚠ DEPRECATED — historical reference, not loaded by index.html
│
└── docs/               # Per-module documentation for agents
    ├── data.md
    ├── audio.md
    ├── state.md
    ├── deck.md
    ├── render.md
    ├── input.md
    ├── combat.md
    ├── ai.md
    ├── multiplayer.md
    └── card-catalog.md  # Design document: 120 cartas (design only, não em data.js)
```

### Script load order (index.html)
```
data.js → audio.js → state.js → deck.js → render.js
→ input.js → combat.js → ai.js → multiplayer.js → main.js
```
All files share a global scope (no ES modules). Functions declared in file A are available
to file B if A appears earlier in the load order, OR if the call happens at runtime
(not at module initialization time). Circular runtime references are fine.

### Agent file ownership
| Agent role | Primary file | Also touches |
|---|---|---|
| Data / Balancing | `data.js` | `AGENT.md` (card table) |
| Audio | `audio.js` | — |
| State / Lifecycle | `state.js` | — |
| Deck / Cards | `deck.js` | — |
| UI / Render | `render.js` | `index.html`, `style.css` |
| Input / UX | `input.js` | `render.js` (minor) |
| Combat / Mechanics | `combat.js` | `data.js` (DEFENSE_QUALITY_RANGES) |
| AI | `ai.js` | `combat.js` (startDefenseWindow) |
| Multiplayer | `multiplayer.js` | `combat.js` (endPoint) |
| Infra / Bootstrap | `main.js` | `index.html` |

### Estado Global (`G`)
```js
G = {
  // Modo
  gameMode: 'ai' | 'multiplayer',
  isHost: boolean,

  // Placar
  pPts, aPts,        // Pontos do rally atual
  pSets, aSets,      // Sets ganhos

  // Recursos
  energy, maxEnergy,     // Jogador (padrão: 10)
  aiEnergy, maxAiEnergy, // IA/Oponente (padrão: 10)

  // Cartas
  deck: Card[],
  hand: Card[],    // Sempre máx. 3 cartas exibidas
  discard: Card[],
  selected: number[], // Índices na mão

  // Estado do rally
  phase: 'service'|'defense'|'setting'|'attack'|'block',
  possession: 'player'|'ai',
  defWindow: boolean,    // Janela de defesa ativa
  blockWindow: boolean,  // Janela de bloqueio ativa
  locked: boolean,       // Bloqueia input do jogador
  pointDone: boolean,    // Ponto finalizado, aguardando "Próximo"

  // Timers
  defTimerVal, defInterval,
  blockTimerVal, blockInterval,

  // Bônus acumulados
  atkBoost,           // Bônus de levantamento no próximo ataque
  nextAttackBonus,    // Bônus/malus de qualidade de defesa (jogador → próximo ataque)
  aiNextAtkBonus,     // Bônus/malus de qualidade de defesa (IA → próximo ataque)
  aiDefMinus,         // Penalidade na defesa da IA (de carta bonus)
  aiAtkPow,           // Poder do ataque atual da IA (usado na resolução)

  // Combo
  comboIdx: 0|1|2|3,  // Posição no COMBO_SEQ

  // Flags de estado
  aiJustDefended: boolean,   // IA já fez o 1º toque
  isDefendingServe: boolean, // Defesa é de saque (muda label)
  defenseQuality: object|null, // Última qualidade de defesa resolvida
  coachUsed: boolean,        // Dica do Treinador usada nesse ponto (limite 1)

  // Log
  log: string[],  // máx. 40 entradas, mais novo no índice 0

  // Saque
  nextServer: 'player'|'ai',

  // Multiplayer sync (temporary flags)
  isNetworkReceiver: boolean,
  networkPointData: object|null,
}
```

### Fluxo de Mensagens Multiplayer (PeerJS)
| type | Direção | Descrição |
|---|---|---|
| `PLAY_CARD` | → oponente | Carta jogada (cardId) |
| `REROLL` | → oponente | Carta trocada |
| `PASS_BALL` | → oponente | Bola passada (forced?) |
| `SERVICE_ERROR` | → oponente | Erro de saque |
| `SERVICE_SUCCESS` | → oponente | Saque OK (power) |
| `ATTACK` | → oponente | Ataque lançado (power) |
| `BLOCK_SKIPPED` | → oponente | Bloqueio ignorado |
| `BLOCK_RESULT` | → oponente | Resultado do bloqueio (cardId, resultType) |
| `DEFENSE_SUCCESS` | → oponente | Defesa OK (defPow) |
| `DEFENSE_FAIL` | → oponente | Defesa falhou (defPow) |
| `POINT_END` | bilateral | Fim do ponto (winnerRole, hostPts, clientPts) |

Toda mensagem embute `data.energy = G.energy` para sincronizar energia do remetente.

---

## Decisões Arquiteturais

| Data | Decisão | Motivo | Impacto |
|---|---|---|---|
| 2025 | Vanilla JS sem framework | MVP rápido, sem dependências, fácil de hospedar | Sem hot reload, sem componentes; toda UI via DOM imperativo |
| 2025 | PeerJS para multiplayer | Sem custo de servidor, P2P simples para 2 jogadores | Depende de servidores STUN/TURN da PeerJS; pode falhar em redes corporativas |
| 2025 | Estado global único `G` | Simplicidade para MVP | Dificulta testes unitários; aceitar para MVP |
| 2025 | Cartas hardcoded em CARDS_DB | Sem necessidade de DB para MVP | Adicionar cartas requer alterar game.js; planejar JSON externo no futuro |
| 2026-06 | Header `display:flex` com `flex:1` nos energy sections | `display:grid 1fr 1fr 1fr` deixava espaço vazio à direita da IA | Centralização matemática perfeita do score; right-energy usa `justify-content: flex-start` em `row-reverse` |
| 2026-06 | Log `flex-direction: column-reverse` | Entradas novas no fundo sem necessidade de `scrollTop` JS | Entrada mais recente sempre visível; `G.log.unshift` + `slice(0,12)` funciona sem alteração |
| 2026-06 | `#opponent-dashboard` span apenas `grid-column:1` | Span `1/-1` posicionava energia da IA sobre a área do log | Log agora é sidebar real (`grid-row: 1/3`); header alinhado com bordas do court |
| 2026-06 | Responsividade via CSS puro | Sem JS para breakpoints; `@media` + `@supports` | Breakpoints: 375px / 600px / 768px / 1024px / 1920px / 2560px; mobile usa scroll snap nas cartas |
| 2026-06 | `100svh` com `@supports` fallback | `100vh` no iOS Safari inclui barra de endereço | Layout não redimensiona ao esconder/mostrar barra do browser |
| 2026-06 | `env(safe-area-inset-*)` | iPhones com notch/home indicator | `#player-dashboard` e `#opponent-dashboard` respeitam as áreas seguras |

---

## Roadmap

### MVP (Estado Atual — Funcional)
- [x] Fluxo completo de rally (saque, defesa, levantamento, ataque, bloqueio)
- [x] Sistema de energia (10 por equipe, pips visuais)
- [x] Sistema de combo (defense → setting → attack)
- [x] IA funcional (lógica simples, 30% chance de "comprar" carta)
- [x] Multiplayer P2P via PeerJS
- [x] Timer de decisão (bloqueio e defesa, 15s cada)
- [x] Log de ações com `flex-direction: column-reverse`
- [x] Placar de pontos e sets no header
- [x] Som via Web Audio API
- [x] Tema visual de praia (CSS custom properties)
- [x] Layout responsivo (375px → 4K)
- [x] Header com flex (alinhamento correto de energia)

### Próximas Funcionalidades (Backlog Alta Prioridade)
- [ ] **Sistema de Fadiga**: fadiga global acumulada por rally, exibida em %, afeta energia e poder
- [ ] **Partida melhor de 3 sets** (atualmente 1 set = fim de jogo; `WIN = 5` hardcoded)
- [ ] **Deck builder pré-partida**: jogador monta seu deck antes de iniciar
- [ ] **Mais cartas**: ampliar `CARDS_DB` com variações por tipo
- [ ] **Tela de seleção de modo** mais polida

### Melhorias Futuras (Backlog Média/Baixa Prioridade)
- [ ] Progressão roguelike entre partidas (desbloquear cartas, upgrades)
- [ ] Múltiplos oponentes de IA com perfis distintos
- [ ] Animação da bola no court durante o rally
- [ ] Efeitos visuais de combo e pontos
- [ ] Localização para outros idiomas
- [ ] Leaderboard / estatísticas persistidas (requer backend)
- [ ] Modo torneio (bracket)
- [ ] Cartas especiais de set-piece (saques variados, ataques especiais)

---

## Backlog

### Alta Prioridade
| Item | Descrição |
|---|---|
| Sistema de Fadiga | Mecânica central não implementada; afeta balanceamento inteiro |
| Melhor de 3 sets | Partida termina em 1 set — MVP aceitável mas raso |
| Mais variedade de cartas | 21 cartas no total; pouca variação por tipo |
| Lógica de IA melhorada | IA atual usa aleatoriedade; sem adaptação ao estado do jogo |

### Média Prioridade
| Item | Descrição |
|---|---|
| Deck builder | Permitir customização pré-partida |
| Resultado de ponto mais detalhado | Mostrar breakdown de poder, bônus, combo no resultado |
| Reconexão multiplayer | Sem tratamento de queda de conexão P2P |
| Estado persistido | `G` perdido ao recarregar; sem salvar progresso |

### Baixa Prioridade
| Item | Descrição |
|---|---|
| Modo torneio | Bracket de múltiplos jogadores |
| Leaderboard | Requer backend |
| Animações elaboradas | Bola animada no court, efeitos de carta |
| Suporte a múltiplos idiomas | Tudo hardcoded em PT-BR |

---

## Débitos Técnicos

| ID | Problema | Arquivo | Impacto | Solução Sugerida |
|---|---|---|---|---|
| DT-01 | `CARDS_DB` hardcoded em JS | `data.js` | Dificulta adição de cartas sem tocar no código | Mover para `cards.json` e carregar via `fetch` |
| DT-02 | Estado global `G` sem tipagem | `state.js` global | Bugs silenciosos por propriedade inexistente | Adicionar JSDoc ou migrar para TypeScript |
| DT-03 | `bonus: 'draw1'` incompleto | `input.js:applyBonus` | "Comunicação" só loga; sem mecânica real de carta extra | Implementar compra de carta extra de qualquer fase |
| DT-04 | `checkSet` com `WIN=5` hardcoded | `combat.js:checkSet` | Impossível configurar pontuação sem editar código | Tornar configurável via `G.matchConfig` |
| DT-05 | Multiplayer sem tratamento de queda | `multiplayer.js` | Desconexão = jogo travado (overlay de desconexão existe mas sem reconexão) | Implementar retry ou sala persistente |
| DT-06 | IA seleção aleatória simples | `ai.js:getAIPlay` | IA não considera histórico nem placar | Adicionar pesos por energia, placar, fase do jogo |
| DT-07 | `renderLog` re-renderiza innerHTML completo | `render.js:renderLog` | Ineficiente; cintilação visual possível | Diff incremental ou só atualizar entradas novas |
| DT-08 | Sem validação de ações multiplayer | `multiplayer.js` | Host controla placar autoritativo sem verificação | Aceitável para MVP; requer backend para produção |
| ~~DT-09~~ | ~~`card.outcomes` não utilizado~~ | — | Resolvido em [2026-07]: campo removido de `data.js` (dead data) | — |

---

## Histórico de Mudanças

### [2026-06] Refatoração de Arquitetura — Divisão em Módulos
#### Adicionado
- `data.js` — toda a base de dados de cartas e constantes
- `audio.js` — sistema de áudio Web Audio API
- `state.js` — estado global G, newGame, startPoint, log
- `deck.js` — gestão do baralho
- `render.js` — toda a renderização DOM
- `input.js` — input do jogador, seleção de cartas, bônus, combo
- `combat.js` — sistema de resolução de combate (qualidade de defesa, bloqueio, ataque, pontuação)
- `ai.js` — inteligência artificial
- `multiplayer.js` — rede PeerJS
- `main.js` — event listeners e menu
- `docs/` — documentação por módulo para agentes

#### Alterado
- `index.html` — carrega 10 arquivos de módulo em vez de `game.js`
- `game.js` — marcado como ⚠ DEPRECATED (histórico; não é mais carregado)

#### Removido
- `calculateAttackProbabilities()` — dead code após sistema de gap-based quality substituir o sistema de probabilidade de ataque
- `resolveAttackOutcome()` — idem (reservado em `data.js` como `card.outcomes` para uso futuro)

---

### [2026-06] Sistema de Qualidade de Defesa
#### Adicionado
- `DEFENSE_QUALITY_RANGES` em `data.js` — 4 tiers por gap
- `getDefenseQuality(gap)` em `combat.js`
- `G.nextAttackBonus` e `G.aiNextAtkBonus` — carry-forward de qualidade
- `G.defenseQuality` — última qualidade resolvida (debug/futuro)
- Feedback emoji + gap no log para todas as resoluções de defesa
- Dados de qualidade (`quality`, `gap`) nos pacotes `DEFENSE_SUCCESS`/`DEFENSE_FAIL` multiplayer

#### Alterado
- `resolveDefense()` — usa gap-based quality em vez de comparação binária
- `resolvePlayerAttack()` — usa gap-based quality para defesa da IA
- `aiTurn()` — aplica e consome `G.aiNextAtkBonus`
- `playCard()` fase attack — aplica e consome `G.nextAttackBonus`
- `startPoint()` — reseta `nextAttackBonus` e `aiNextAtkBonus`

---

### [2026-06] Saque com Tipos de Erro
#### Adicionado
- `errorType: 'out'|'net'` no pacote `SERVICE_ERROR` multiplayer
- Logs separados para "bola para fora" vs "bola na rede" (jogador e IA)

---

### [2026-06] Refatoração UI/UX Completa
#### Adicionado
- `#sets-display` no header para exibir placar de sets (`G.pSets × G.aSets`)
- `#atk-label` no resolve-panel (referenciado no JS mas ausente no HTML)
- `#btn-skip-block` separado de `#btn-pass` (botões para funções distintas)
- `#timer-bar-wrap` e `#timer-count` para countdown numérico ao lado da barra
- `#deck-info` dentro do `#player-dashboard` (estava fora)
- Regras de dashboard em tema praia appended ao `style.css`
- Responsividade completa: 6 breakpoints CSS + safe-area iOS + `100svh`
- `touch-action: manipulation` em `.btn` e `.card` para mobile

#### Alterado
- `#opponent-dashboard`: `display:grid 1fr 1fr 1fr` → `display:flex` com `.header-energy { flex:1 }`
- `.right-energy`: `justify-content: flex-end` → `justify-content: flex-start` (corrige bug de alinhamento em `row-reverse`)
- `#opponent-dashboard`: `grid-column: 1/-1` → `grid-column: 1` (header só na coluna do jogo)
- `#log-area`: `grid-row: 2` → `grid-row: 1/3` (sidebar de altura total)
- `#log-area`: `flex-direction: column` → `flex-direction: column-reverse` (entradas novas no fundo, sem JS)
- `appUI.style.display = 'flex'` → `'grid'` (2 ocorrências: AI e multiplayer)
- `renderActions()`: refatorado para usar `#btn-skip-block` na janela de bloqueio
- `renderResolve()`: adiciona `.block-mode` / `.def-mode` ao painel
- `hidePointResult()`: `'grid'` → `'flex'` (consistência com action-area)
- Removido bloco `<style>` inline do `index.html` (conflitava com tema praia)
- Corrigida estrutura do `#player-dashboard` (fechava prematuramente antes de todos os filhos)

#### Corrigido
- Energia da IA desalinhada no header (ocupava posição sobre o log, não sobre o court)
- `#resolve-panel` com `position: absolute` flutuando em posição errada → agora in-flow
- Duplicatas de `@keyframes cardGlow/cardPulse` e regras de menu multiplayer no CSS
- `#player-label` com `font-size: 9px` → `14px`
- `appUI.style.display = 'flex'` destruindo o CSS Grid ao iniciar partida

---

### [2026-06] Integração GDD — 5-Tier Resolution + Coach + Level + Catálogo 120 Cartas

#### Alterado
- `DEFENSE_QUALITY_RANGES` em `data.js` — migrado de 4 tiers para 5 tiers simétricos GDD
  - Tiers antigos: critica/boa/ruim/miss
  - Tiers novos: ataque_dominante/vantagem_ofensiva/equilibrio/vantagem_defensiva/defesa_dominante
  - Impacto de balanceamento: gap -3–-1 era 30% sucesso (ruim), agora é 95% (equilibrio)
  - Impacto de balanceamento: gap ≥4 era +3 bônus, agora split entre +2 (vantagem) e +4 (dominante)
- `combat.js:getDefenseQuality` — fallback de `'miss'` para `'ataque_dominante'`
- `combat.js:autoResolve` — pacote multiplayer usa `'ataque_dominante'` em vez de `'miss'`
- `deck.js` — tipo `'support'` renomeado para `'coach'` em buildDeck e drawPhaseOptions
- `deck.js:drawPhaseOptions` — filtra coach quando `G.coachUsed = true`
- `input.js` — `card.type === 'support'` → `card.type === 'coach'`; seta `G.coachUsed = true` ao jogar
- `input.js:updateCombo` — ignora tipo `'coach'` (não quebra, não avança combo)
- `input.js:rerollOption` — filtra fase `'coach'` com `G.coachUsed`
- `state.js:newGame` — campo `coachUsed: false` adicionado ao G
- `state.js:startPoint` — reseta `G.coachUsed = false` a cada ponto
- `style.css` — `.type-support` agora também inclui `.type-coach` (mesma estilização)
- Todos os cards em `data.js` — campo `level` adicionado (`'basico'|'intermediario'|'avancado'`)
- Cards `sup1`/`sup2` → `cch1`/`cch2` com `type:'coach'` e nomes atualizados

#### Adicionado
- `G.coachUsed: boolean` — limite de 1 uso de carta Coach por ponto
- `docs/card-catalog.md` — catálogo de design com 120 cartas (6 categorias × 3 níveis); apenas design, sem código ainda
- Campo `level` no schema de cartas (metadata para progressão futura)
- `catalog.html` — página de coleção de cartas: 22 desbloqueadas (CARDS_DB) + ~99 bloqueadas (catálogo embutido), filtros por tipo/nível/busca, barra de progresso; link adicionado ao menu
- `wiki.html` — enciclopédia interativa: visão geral, mecânicas (5-tier system), banco de dados de cartas (searchable), 6 arquétipos de construção, estatísticas & balance, glossário completo; link adicionado ao menu
- `BACKLOG.md` — backlog completo do projeto com: ✅ features completadas, 📋 in-progress, 🔄 5 tiers de roadmap (engine, content, quality, expansion), métricas de sucesso
- `docs/deck.md` — corrigido `'support'` → `'coach'` e documentada restrição `G.coachUsed`

### [2026-06-23] Campaign mode — team selection & passives

#### Adicionado
- `campaign.js` — `CAMPAIGN_TEAMS` (3 duplas com id, nome, jogadores, stats, deckBias, passive) + `getCampaignTeam()`
- `campaign.html` — seleção de dupla: 3 cards coloridos com stats ATK/DEF/BLK (dots), bônus passivo, preview de deck; armazena teamId em `localStorage.ascension_campaign_team` e redireciona para index.html
- `index.html` — botão "🏆 Iniciar Campanha" adicionado ao menu; `campaign.js` carregado após `data.js`
- `G.campaignTeam` — id da dupla selecionada (string ou null)
- `G.freeBlockUsed` — flag para o passivo de A Muralha (1 bloqueio grátis por ponto)
- 3 duplas de crianças com arquétipos distintos (deck minimalista: 16 cartas, especialidade +2):
  - 🔥 **Os Meteoros** (Lucas & Kauã) — ATK 5/DEF 2/BLK 3 — deck: 3×srv/3×def/2×set/**5×atk**/3×blk = 16 cartas — passivo: +2 poder em cada ataque
  - 🧱 **A Muralha** (Thiago & Felipe) — ATK 2/DEF 3/BLK 5 — deck: 3×srv/3×def/2×set/3×atk/**5×blk** = 16 cartas — passivo: 1° bloqueio por ponto custa 0 energia
  - 🛡️ **A Fortaleza** (Ana & Júlia) — ATK 3/DEF 5/BLK 2 — deck: 3×srv/**5×def**/2×set/3×atk/3×blk = 16 cartas — passivo: +5% taxa de sucesso de defesa

#### Alterado
- `state.js:newGame(gameMode, isHost, campaignTeam)` — novo 3° parâmetro; `G.campaignTeam` e `G.freeBlockUsed` adicionados ao estado; log de apresentação da dupla e passivo no início da partida
- `state.js:startPoint()` — reseta `G.freeBlockUsed = false`
- `deck.js:buildDeck()` — lê `G.campaignTeam` e aplica `CAMPAIGN_TEAMS[team].deckBias` ao número de cópias por tipo
- `combat.js:resolveBlock()` — passivo A Muralha: se `campaignTeam === 'muralha' && !G.freeBlockUsed`, custo do bloqueio = 0
- `combat.js:resolveDefense()` — passivo A Fortaleza: `successRate = Math.min(1.0, rate + 0.05)` quando `campaignTeam === 'fortaleza'`
- `input.js:playCard()` (attack) — passivo Os Meteoros: `meteorosBonus = campaignTeam === 'meteoros' ? 2 : 0` somado ao total
- `main.js` — detecta `localStorage.ascension_campaign_team` no load; se presente, limpa e chama `newGame('campaign', false, teamId)` diretamente

#### Sistema de Rewards (Campanha)
- Após vitória em uma partida em modo campanha, tela com 3 cartas aleatórias aparece
- Jogador escolhe 1 carta para adicionar ao deck
- Próxima partida começa com deck expandido
- **Mecânica de raridade**:
  - Básico (Comum): 60% chance de ser selecionado
  - Intermediário (Raro): 30% chance
  - Avançado (Lendário): 10% chance
  - Cartas já no deck são excluídas de seleção (sem duplicatas)
- **Arquivos envolvidos**:
  - `campaign.js` — `BASE_DECK_CARDS` (lista curada de ids por tipo, garante cobertura de tags) + `BASE_DECK_COPIES` derivado; `selectRewardCards(count)` (seleção probabilística); `addCardToReward(cardId)` (adiciona ao deck)
  - `deck.js` — usa `BASE_DECK_CARDS` como base (totalizando 15 cartas) + deckBias estendendo com cartas não-locked restantes
  - `campaign.html` — usa `BASE_DECK_COPIES` para preview (sem hardcoding)
  - `render.js` — `showRewards(cards)` renderiza overlay com 3 cards interativos
  - `index.html` — `#rewards-overlay` HTML element
  - `style.css` — `.reward-card` + raridade colors (Comum/Raro/Lendário)
  - `combat.js:checkSet()` — detecta vitória em campanha: `if (G.gameMode === 'campaign' && G.campaignTeam) showRewards(selectRewardCards(3))` ao invés de `showEnd(true)`

### [2026-06-23] Test infrastructure & CI gate

#### Adicionado
- `package.json` + `jest.config.js` — Jest 29 como devDependency; coverage threshold ≥70% em data/combat/deck
- `tests/data.test.js` — ~35 assertivas: schema de cartas, IDs únicos, distribuição por tipo, DEFENSE_QUALITY_RANGES shape & valores
- `tests/combat.test.js` — ~40 assertivas: `getDefenseQuality` em todos os 13 boundary values, `_checkWinCondition` win/draw/loss/deuce
- `tests/deck.test.js` — ~35 assertivas: `shuffle` pureza, `buildDeck` 42-card / 7-por-tipo, `clearHand` state, `drawPhaseOptions` filtros de fase e exclusão de coach
- `.github/workflows/ci.yml` — GitHub Actions: executa `npm test --ci` em push/PR para main; gera e faz upload do coverage report
- `TESTING.md` — guia completo: como rodar, arquitetura de testes, como adicionar novos testes, como habilitar branch protection

#### Alterado
- `data.js` — `module.exports` condicional no final (no-op no browser)
- `combat.js` — `_checkWinCondition` pure helper extraída de `checkSet`; `module.exports` condicional
- `deck.js` — `module.exports` condicional no final (exports: shuffle, buildDeck, resetDeck, clearHand, drawPhaseOptions)

#### Removido
- Tipo `'support'` — substituído por `'coach'` em todos os arquivos

---

### [2026-06-24] IA como Espelho do Jogador + Sincronização Multiplayer

#### Adicionado (IA agora é espelho do Player)
- `combat.js:aiResolveBlock(pow, attackCard)` — IA tenta bloquear com 60% de chance quando Player ataca
  - 20%: bloqueio direto → ponto IA
  - 20%: bloqueio para fora → ponto Player
  - 60%: bloqueio bem-sucedido → poder reduzido 50% → continua para defesa
- `combat.js:aiDefendAgainst(pow, attackCard)` — IA defende com poder reduzido (se bloqueio amorteceu) ou normal
- Erro de ataque do Player: 5% base + (power × 2%) → ataque sai para fora → ponto IA
- Multiplicador de bloqueio unificado: amortece e continua agora têm mesmo resultado (ambos levam a defesa com poder reduzido)

#### Alterado (Multiplayer fixes)
- `input.js:playCard()` — adiciona `sendData({ type: 'SETTING_PLAY', cardId })` quando Player joga carta de levantamento
- `multiplayer.js` — adicionado handler para `SETTING_PLAY`: sincroniza transição para fase de ataque
- `multiplayer.js:BLOCK_RESULT 'SOFTEN'` — agora chama `startDefenseWindow(false)` corretamente (estava ignorando)
- `combat.js:resolvePlayerAttack()` — refatorado para chamar `aiResolveBlock()` primeiro, depois `aiDefendAgainst()` se bloqueio não marcou ponto

#### Documentação atualizada
- `docs/combat.md` — nova seção "AI decision to block" com probabilidades; "Attack error" com fórmula
- `docs/ai.md` — nova seção "AI capabilities" listando bloqueio, defesa, saque; fluxo de `aiTurn()` atualizado
- `docs/multiplayer.md` — adicionado `SETTING_PLAY` ao protocol table; `BLOCK_RESULT` com resultTypes documentados
- `AGENT.md` — fluxo de rally completamente redesenhado com bloqueio da IA como etapa integral

### [2026-06-24] Sistema de Combo Coach — 1 Fase + 1 Coach Opcional

#### Adicionado
- `G.nextPhaseExtraCard: boolean` — resetado a cada ponto; não altera número de cartas (sempre 3)
- Lógica de seleção unificada em `input.js:selectCard()` — permite máximo 2 cartas (1 fase + 1 coach) em **todas** as janelas
- `input.js:canPlay()` — coach verificação: requer carta de fase já selecionada + energia combinada ≤ G.energy
- `deck.js:drawPhaseOptions()` — coach aparece em todas as fases (bloqueio, defesa, saque, levantamento, ataque) via `phases = [..., 'coach']`
- `combat.js:resolveDefense()` — coach processado primeiro em loop separado (bônus antes de defesa)
- `combat.js:resolveBlock()` — coach processado antes de bloqueio

#### Alterado
- `deck.js` — removido suporte a `drawCount = nextPhaseExtraCard ? 4 : 3`; sempre 3 cartas
- `input.js:playCard()` — separação de fase card e coach card; coach bonus aplicado antes de phase card debit
- `input.js:selectCard()` — deselecionar fase card limpa toda seleção (coach não pode ficar sozinho)
- `input.js:rerollOption()` — coach incluído em `phases` para trocar (já estava, mantido)
- `render.js:renderResolve()` — mostra poder de defesa sem coach (coach não contribui)
- `render.js:renderActions()` — botões "Resolver" e "Bloquear" desabilitam se só coach está selecionado
- `state.js:startNextCampaignMatch()` — fix: `savedDeck = [...G.deck, ...G.hand, ...G.discard]` (preserva todas as zonas entre partidas)
- `tests/deck.test.js` — atualizado `makeG()` com `nextPhaseExtraCard: false`; testes de coach em todas as fases
- `tests/data.test.js` — coach phase test esperando `['coach']` em vez de `['defense','setting','attack']`
- `AGENT.md` — documentação completa do novo sistema na seção "Sistema de Cartas" e na seção de bônus

#### Corrigido
- **Bug crítico**: Coach aparecia sozinho no levantamento pós-reward campanha (defWindow/blockWindow tratados diferentemente) → agora coach aparece em todas as fases uniformemente
- **Bug crítico**: Deck diminuía entre partidas campanha (startNextCampaignMatch salva só G.deck) → agora salva deck + hand + discard
- **Bug de UX**: Jogador podia selecionar só coach sem fase card → agora bloqueado em selectCard() e canPlay()

#### Detalhes Técnicos
- **Ordem de operações ao jogar combo**:
  1. Encontrar fase card e coach card em G.selected
  2. Validar que existe fase card (obrigatório)
  3. Aplicar coach bonus (energy2, atkBoost, etc.)
  4. Debitar custo de coach
  5. Debitar custo de fase card
  6. Aplicar bônus de fase card
  7. Descartar ambas
- **drawPhaseOptions()**: coach aparece naturalmente como 1 das 3 opções (em vez de extra) porque filtra por `phases.includes(p)` e coach está em `phases`
- **coachUsed flag**: setada ao jogar coach, resetada em startPoint(), impede coach de reaparecer no mesmo ponto

### [2026-07-13] Sistema de combo por tags + rebalance de duplas + auditoria de probabilidade

#### Adicionado
- `data.js:CARD_TAGS` — 3 identidades (`power`⚡/`precision`🎯/`tempo`🔄) atribuídas a cartas de defense/setting/attack
- Sistema de tag-combo em `input.js:updateCombo()` — completar defesa→levantamento→ataque com a mesma tag substitui o bônus genérico (+2 poder) por um payoff específico (power:+4 poder, precision:-3 def IA, tempo:+2 energia)
- 3 cartas novas: `def9` (Recepção Perfeita, `energyRefund1`), `set5` (Levantamento Rasteiro, `costReduceNext1`), `blk5` (Bloqueio Antecipado, `costReduceNext1`)
- `input.js:payCost()` — helper centralizado para consumir `G.costDiscount`
- `.card-tag` badge visual na carta (render.js/style.css) mostrando o emoji da tag
- `agents/` — pasta na raiz do projeto para relatórios de agentes de análise (auditorias, reviews). Primeiro documento: `agents/probability-audit.md`

#### Alterado
- Passiva **A Muralha**: bloqueio grátis (1×) + demais bloqueios -1 energia (`blockCostReduction`)
- Passiva **A Fortaleza**: trocado `defenseRateBonus: 0.05` (quase irrelevante, maioria dos tiers já 95-100%) por `defGapBonus: 2` (desloca o gap antes do lookup de tier) + `defRateFloor: 0.10` (piso mínimo garantido quando o deslocamento de tier não ajuda)
- `data.js:DEFENSE_QUALITY_RANGES` — `vantagem_defensiva`/`defesa_dominante` de 100% para 97% de sucesso (mantém tensão em late-game; auditoria apontou que gap≥+4 tornava a defesa matematicamente imune a variância)
- `combat.js:resolvePlayerAttack()` — erro de ataque agora usa poder **total** (`pow`, com boosts) em vez do poder base da carta, consistente com a fórmula de erro de saque

#### Removido
- `card.outcomes` (point/blocked/out/net) de todas as cartas de ataque em `data.js` — dead data confirmado por auditoria (nunca lido pela resolução de combate ativa); ver DT-09 (resolvido)

#### Contexto
Um agente especialista em deckbuilders (Slay the Spire, Monster Train) apontou que o combo anterior (`COMBO_SEQ` fixo) disparava quase automaticamente sem decisão real do jogador, e que a passiva da Fortaleza era quase irrelevante. Um segundo agente auditou todos os pontos de `Math.random()` do jogo e confirmou o dado morto de `outcomes`, a inconsistência da fórmula de erro de ataque, e o "teto duro" de 100% de sucesso em gaps altos. Ambos os relatórios completos estão em `agents/`.

---

### [2026-07-13] Revisão final — correções de deck base, IA e limpeza

#### Adicionado
- `campaign.js:BASE_DECK_CARDS` — lista **curada** de cartas do deck base por tipo (3 de cada = 15 cartas), garantindo que as 3 rotas de tag-combo sejam alcançáveis desde o primeiro ponto (`BASE_DECK_COPIES` agora é derivado dela)
- Testes novos em `tests/deck.test.js`: composição curada exata, cobertura de tags no deck base, deckBias sem cartas locked

#### Corrigido
- **Deck inicial sem combos** (crítico): `buildDeck()` pegava as N primeiras cartas de cada tipo — o deck base saía sem defense ⚡, sem setting 🎯/🔄 → nenhum tag-combo era fechável. Agora usa `BASE_DECK_CARDS`; slots de deckBias além da lista são preenchidos com as demais cartas não-locked do tipo
- **IA nunca jogava levantamento**: filtro `c.power > 0` em `getAIPlay()` excluía todos os settings (power 0) → IA nunca ganhava atkBoost nem fechava combo. Agora settings são permitidos; na dificuldade 2 a IA valoriza settings pelo atkBoost; na dificuldade 0 pula o levantamento 50% das vezes (suavização)
- **IA usava cartas bloqueadas**: `getAIPlay()`, `aiResolveBlock()` e `aiDefendAgainst()` não filtravam `locked:true` — na Final a IA sempre cortava com atk7 (poder 10) que o jogador nem desbloqueou. Filtro `!c.locked` adicionado nos 3 pontos
- **IA fácil/média não era aleatória**: `getAIPlay()` retornava `possible[0]` determinístico (sempre a mesma carta), contrariando a própria doc. Agora sorteia de verdade nas dificuldades 0/1
- **resolveDefense ignorava o desconto de energia**: check de custo `c.cost <= G.energy` não considerava `G.costDiscount` (canPlay considerava) → carta selecionável era silenciosamente ignorada na resolução (defesa 0). Agora usa custo efetivo
- `tests/deck.test.js` estava obsoleto (esperava 42 cartas / 7 coach de uma versão antiga do buildDeck e nem injetava `BASE_DECK_COPIES` no ambiente Node)

#### Removido
- `game.js` — arquivo legado de ~1500 linhas, não carregado por nenhuma página desde a refatoração modular (histórico preservado no git)

#### Alterado
- Deck base: 14 → 15 cartas (setting 2 → 3 cópias, necessário para cobrir as 3 tags); com bias de dupla: 16 → 17
- `CLAUDE.md` — contagem de módulos corrigida (12, incluindo progression.js na ordem de carga)
- Relatório completo da revisão em `agents/final-review-2026-07-13.md`

---

*Documento gerado em 2026-06. Mantenha-o atualizado a cada tarefa relevante.*
