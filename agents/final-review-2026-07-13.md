# Revisão Final do Projeto — Ascension

**Data:** 2026-07-13
**Escopo:** código, arquitetura, documentação, testes, game design e playtest manual no browser (sem node — jogo servido via HTTP local e dirigido via console/UI).
**Status:** todos os bugs encontrados foram corrigidos nesta mesma sessão e re-verificados em jogo.

---

## 1. Veredito geral

O projeto está em **bom estado para um demo**: arquitetura modular clara (12 módulos com responsabilidade única, ordem de carga documentada), documentação por módulo (`docs/*.md`) fiel ao código e de qualidade acima da média, estado global `G` com ownership bem definido. Os problemas encontrados eram concentrados em duas áreas: **composição do deck inicial** (que invalidava o sistema de combos recém-construído) e **a IA** (três bugs que a deixavam ao mesmo tempo mais burra e mais trapaceira do que o design pedia).

---

## 2. Bugs encontrados e corrigidos

### B1 — Deck inicial não permitia nenhum tag-combo (crítico de design)
`buildDeck()` pegava as N **primeiras** cartas não-locked de cada tipo. Resultado real (inspecionado em jogo): defense = def1/def2/def3 (🔄🔄🎯), setting = set1/set2 (⚡⚡), attack = atk1/atk2/atk3 (⚡🔄⚡). Nenhuma trinca de tags iguais era fechável — o sistema de combos estava morto na prática (exceto ⚡ para a Fortaleza, por acidente do deckBias).

**Correção:** `campaign.js:BASE_DECK_CARDS` — lista curada por tipo garantindo cobertura das 3 tags em defense/setting/attack. `BASE_DECK_COPIES` agora é derivado (preview do campaign.html continua correto automaticamente). Deck base: 15 cartas (setting 2→3). `buildDeck()` usa a lista; slots de deckBias além dela são preenchidos com as demais cartas não-locked do tipo. **Verificado em jogo:** as 3 rotas de combo presentes no deck inicial.

### B2 — IA nunca jogava levantamento
`getAIPlay()` filtrava `c.power > 0` — todos os settings têm power 0. A IA nunca ganhava atkBoost e nunca fechava o próprio combo (`comboCount >= 3` era inalcançável; o código de atkBoost dela era morto). Evidência ao vivo: "IA armou jogada: Manchete Firme ➔ Cortada Diagonal" (sem setting), poder de ataque travado no máximo ~10.

**Correção:** settings permitidos no filtro; dificuldade 2 valoriza settings pelo número do atkBoost; dificuldade 0 pula o levantamento 50% das vezes (suavização de onboarding). **Verificado em jogo (dif. 2):** "Defesa Heroica ➔ Levantamento Rápido ➔ Bola na Linha", poder final 17 (9+6+2).

### B3 — IA usava cartas bloqueadas (locked)
`getAIPlay()`, `aiResolveBlock()` e `aiDefendAgainst()` filtravam `CARDS_DB` sem `!c.locked`. Na Final (dif. 2, que ordena por poder), a IA **sempre** cortava com atk7 (poder 10) e sacava com srv4 — cartas que o jogador ainda nem desbloqueou. **Correção:** filtro `!c.locked` nos 3 pontos. **Verificado:** IA hard sacou com srv2 (a mais forte não-locked).

### B4 — resolveDefense ignorava o desconto de energia
O check de custo (`c.cost <= G.energy`) não considerava `G.costDiscount`, mas `canPlay()` considerava → com 1⚡ + desconto pendente, uma defesa de custo 2 era selecionável na UI e depois **silenciosamente ignorada** na resolução (defesa 0, jogador sem entender). **Correção:** custo efetivo espelhando canPlay.

### B5 — IA fácil/média não era aleatória
Doc e comentário diziam "random pick", mas o código retornava `possible[0]` determinístico — IA fácil/média sempre jogava a mesma primeira carta do banco. **Correção:** sorteio real nas dificuldades 0/1.

### Limpeza
- `game.js` (~1500 linhas legadas, não carregado por nenhuma página) **deletado** (histórico no git).
- `tests/deck.test.js` estava obsoleto (esperava 42 cartas / 7 coach de uma versão antiga e nem injetava `BASE_DECK_COPIES` — quebraria com ReferenceError). Reescrito: composição curada, cobertura de tags, deckBias sem locked.
- `CLAUDE.md`: contagem de módulos corrigida (12, com progression.js na ordem de carga).

---

## 3. Avaliação de arquitetura e código

**Pontos fortes:**
- Separação de módulos com dependências acíclicas e ordem de carga explícita — raro em projetos vanilla JS desse porte.
- `docs/[módulo].md` autocontidos e (agora) fiéis; a regra "leia o doc antes de mexer" do CLAUDE.md funciona.
- Passivas de dupla data-driven (`team.passives.*` lidas por chave, sem `if (team === 'muralha')` espalhado) — extensível.
- Estado (`G`) inicializado num único lugar, com resets simétricos em `startPoint()`/`startNextCampaignMatch()`.

**Aceitável, mas de olho (não corrigido — anotado como dívida):**
- O bloco "processa coach primeiro" está triplicado (playCard/resolveDefense/resolveBlock). Um helper `playCoach(idx)` eliminaria ~20 linhas duplicadas.
- `renderLog` re-renderiza innerHTML inteiro (já registrado como DT-07).
- Multiplayer não sincroniza os bônus novos (costDiscount/tags) — fora de escopo declarado (foco single-player), mas o modo multiplayer deveria ser marcado como "beta/desatualizado" no menu antes de qualquer release.
- `catalog.html` mostra "25/133 cartas" — os 133 vêm do catálogo de design (docs/card-catalog.md), não do CARDS_DB implementado (33). Intencional como roadmap, mas pode confundir jogador de demo.

---

## 4. Game design — avaliação e observações de balance

**O que está bom (testado):**
- Loop de fases com janelas de tempo cria tensão real; timers de 15s funcionam e o autoResolve pune sem travar.
- Tag-combos: as 3 vias pagam certo (⚡+4 poder / 🎯-3 def / 🔄+2 energia) e o fallback +2 preserva o combo genérico. Com o deck curado, a decisão "perseguir a trinca ou jogar a carta melhor" existe desde o 1º ponto — é exatamente o tipo de decisão que faltava.
- Recompensas priorizam cartas desbloqueadas por XP — o investimento do jogador aparece.

**Pontos de atenção para playtest humano (não mexi sem dados):**
1. **A Final (dif. 2) ficou consideravelmente mais difícil** com a IA armando jogadas completas: cortadas de poder ~17 são possíveis (atk3 9 + boost 6 + combo 2). Sem bloqueio, até def6 (10) cai em Ataque Dominante (0%). Isso torna o bloqueio quase obrigatório contra a Final — dinâmica interessante ("leia o bloqueio ou morra"), mas se o playtest mostrar frustração, os knobs são: cap no atkBoost da IA, reduzir `blockChances[2]` (0.70), ou dar +1 energia ao jogador na Final.
2. **Dif. 1 vs dif. 2 agora têm um degrau grande** (random pick vs. otimização + boost). Se a Semifinal parecer fácil demais em comparação, uma dif. 1.5 seria "random pick, mas nunca pula setting".
3. O **freeball do jogador** (energia 0 = bola grátis pro oponente) continua punindo forte; com set5/blk5 (custo 0/desconto) o jogador tem mais válvulas de escape agora.

---

## 5. Testes

- Sem node na máquina: `npm test` **não foi executado**. Toda a verificação foi manual + playtest dirigido no browser (servidor HTTP em PowerShell puro, jogo dirigido via console e UI).
- Testes atualizados nesta sessão para refletir a realidade: `tests/deck.test.js` (reescrito), `tests/combat.test.js` e `tests/data.test.js` (97% nos tiers altos, 33 cartas, novos bônus/tags).
- **Pendência: rodar `npm test` numa máquina com node** antes do próximo commit importante.

## 6. Verificado em jogo nesta revisão

✅ Menu, catálogo, campanha e wiki carregam sem erros de console
✅ Deck base com as 3 rotas de tag-combo | ✅ Combos pagam certo (as 3 vias + fallback)
✅ IA dif. 2 arma defesa→levantamento→ataque com boost | ✅ IA não usa cartas locked
✅ payCost/desconto | ✅ Modal Ver Deck | ✅ Timers/autoResolve | ✅ Erros de saque (fora/rede) com animação de bola
✅ Campanha Fortaleza: deck 17 cartas (5 defesas), passivas novas no log
