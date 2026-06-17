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
  ├── Erro (chance proporcional ao poder) → Ponto da IA
  └── Saque cruzou a rede
        └── IA responde (defesa + levantamento + ataque)
              └── Janela de Bloqueio (15s)
                    ├── Jogador bloqueia → resultado probabilístico (20% ponto / 20% fora / 30% amortece / 30% continua)
                    └── Sem bloqueio → Janela de Defesa (15s)
                          ├── defPow >= aiAtkPow → Defesa OK → Levantamento → Ataque
                          │     └── Ataque resolve contra defesa da IA → Ponto ou contra-ataque
                          └── defPow < aiAtkPow → Ponto da IA

Saque da IA
  └── Janela de Defesa do Jogador (15s)
        ├── defPow >= aiAtkPow → Posse do Jogador → Levantamento → Ataque
        └── defPow < aiAtkPow → Ponto da IA
```

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
- Baralho de **42 cartas** montado no início de cada ponto (`buildDeck`): 7 cópias de cada tipo (service, setting, attack, defense, block, support)
- A mão exibe **3 opções** relevantes à fase atual
- Trocar uma carta custa **1 de energia** (`rerollOption`)
- Baralho se reconstrói automaticamente quando esgota (embaralha o descarte)
- Cada carta tem: `id`, `name`, `type`, `cost`, `power`, `desc`, `phases[]`, `bonus?`

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
- Carta de support não quebra o combo

#### Sistema de Bônus de Cartas
| bonus | Efeito |
|---|---|
| `energy2` | +2 energia imediata |
| `atkBoost3` | +3 no poder do próximo ataque |
| `atkBoost6` | +6 no poder do próximo ataque |
| `aiDefMinus2` | Adversário defende com -2 no próximo ataque |
| `draw1` | +1 Uso livre (efeito placeholder — sistema não finalizado) |

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

#### Ataque (4 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| atk1 | Cortada Diagonal | 2 | 6 | — |
| atk2 | Ponta Aberta | 1 | 3 | — |
| atk3 | Bola na Linha | 3 | 9 | — |
| atk4 | Finta | 1 | 2 | aiDefMinus2 |

#### Bloqueio (3 cartas)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| blk1 | Bloqueio Simples | 1 | 3 | — |
| blk2 | Paredão | 2 | 6 | — |
| blk3 | Leitura de Bloqueio | 1 | 4 | — |

#### Suporte (2 cartas — disponíveis em defesa, levantamento, ataque)
| id | Nome | Custo | Poder | Bônus |
|---|---|---|---|---|
| sup1 | Foco | 0 | 0 | energy2 |
| sup2 | Comunicação | 1 | 0 | draw1 |

### IA (modo single-player)
- **Seleciona cartas aleatoriamente** do pool filtrado por fase e custo disponível
- **30% de chance** de "comprar" uma carta antes de jogar (custo extra de -1 energia)
- Tenta executar sequência completa: defesa → levantamento → ataque
- Defende o ataque do jogador com a melhor carta que puder pagar
- Marcador `G.aiJustDefended` evita dupla contagem da defesa no combo da IA

---

## Mecânicas Confirmadas

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
├── index.html      # Estrutura HTML, elementos da UI
├── style.css       # Todo o CSS: tema, layout, responsividade
├── game.js         # Toda a lógica: estado, IA, eventos, render, multiplayer
└── AGENT.md        # Este arquivo
```

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
  atkBoost,      // Bônus acumulado no próximo ataque
  aiDefMinus,    // Penalidade na defesa da IA
  aiAtkPow,      // Poder do ataque atual da IA (usado na resolução)

  // Combo
  comboIdx: 0|1|2|3,  // Posição no COMBO_SEQ

  // Flags de estado
  aiJustDefended: boolean,   // IA já fez o 1º toque
  isDefendingServe: boolean, // Defesa é de saque (muda label)

  // Log
  log: string[],  // máx. 40 entradas, mais novo no índice 0

  // Saque
  nextServer: 'player'|'ai',
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
| DT-01 | `CARDS_DB` hardcoded em JS | `game.js:1-28` | Dificulta adição de cartas sem tocar no código | Mover para `cards.json` e carregar via `fetch` |
| DT-02 | Estado global `G` sem tipagem | `game.js` global | Bugs silenciosos por propriedade inexistente | Adicionar JSDoc ou migrar para TypeScript |
| DT-03 | `bonus: 'draw1'` não implementado | `game.js:297` | Carta "Comunicação" tem efeito placeholder | Definir mecânica e implementar |
| DT-04 | `checkSet` com `WIN=5` hardcoded | `game.js:629` | Impossível configurar pontuação sem editar código | Tornar configurável via `G.matchConfig` |
| DT-05 | Multiplayer sem tratamento de queda | `game.js:864+` | Desconexão = jogo travado sem feedback | Adicionar `conn.on('close')` e `conn.on('error')` com tela de reconexão |
| DT-06 | IA seleção aleatória simples | `game.js:330+` | IA não considera histórico nem placar | Adicionar peso por fase do jogo (pontos restantes, energia disponível) |
| DT-07 | `log-area` re-renderiza innerHTML completo | `game.js:785` | Ineficiente; cintilação visual possível | Diff incremental ou atualizar só entradas novas |
| DT-08 | Sem validação de ações multiplayer | `game.js:874+` | Host pode manipular estado do cliente | Para MVP é aceitável; requer backend para produção real |

---

## Histórico de Mudanças

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

*Documento gerado em 2026-06. Mantenha-o atualizado a cada tarefa relevante.*
