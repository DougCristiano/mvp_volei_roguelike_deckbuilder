# Ascension — Beach Volleyball MVP

## 🏐 Visão Geral
**Ascension** é um protótipo de jogo Roguelike Deckbuilder baseado em turnos, com temática de Vôlei de Praia. O jogador enfrenta uma Inteligência Artificial em uma partida tática, simulando as fases de um rally real (Saque, Recepção/Defesa, Levantamento, Ataque e Bloqueio) usando cartas e gerenciamento de energia.

## 🛠 Arquitetura e Tecnologias
- **Vanilla Web**: Construído puramente com HTML5, CSS3 e JavaScript moderno (ES6+).
- **Sem Frameworks**: O estado é gerenciado globalmente por um objeto `G` em `game.js`. O DOM é manipulado diretamente em tempo de execução através da função `render()`.
- **UI/UX HUD**: Painéis de resolução e timers usam modal overlay (`position: absolute`) para evitar "layout shift" na tela.

## ⚙️ Core Mechanics (Mecânicas Principais)

### Sistema de Energia e Turnos
- Ambos os jogadores (Usuário e IA) iniciam o ponto com **10 de Energia**.
- A energia **não regenera automaticamente** durante os toques na bola. Ficar sem energia força um passe livre ("Freeball").
- Ao forçar uma Freeball (Passar a Bola), o jogador recupera **+2⚡**.

### Sistema de "Draft" Dinâmico (Mão de Cartas)
- O jogo não usa uma mão estática clássica. Em vez disso, a cada fase, o sistema busca no baralho **3 cartas válidas** para aquela etapa específica.
- O jogador pode pagar **1⚡** para **Trocar Carta** (Reciclar) uma opção selecionada, substituindo-a por uma nova do deck.
- O baralho possui 42 cartas (7 de cada tipo: `service`, `defense`, `setting`, `attack`, `block`, `support`).

### Fluxo de Jogo e Fases (`G.phase`)
A partida segue o fluxo orgânico de um ponto de vôlei:
1. **Saque (`service`)**: Risco de errar baseado no Poder (`5% + (Power * 3%)`).
2. **Defesa/Recepção (`defense`)**: O jogador pode combinar várias cartas para somar Poder. Conta como 1º toque.
3. **Levantamento (`setting`)**: Confere bônus multiplicadores altos para o Ataque.
4. **Ataque (`attack`)**: O Poder base + Bônus de levantamento + Bônus de Combo é usado contra a defesa adversária.
5. **Bloqueio (`block`)**: Janela rápida onde o defensor pode tentar parar o ataque na rede (Ponto direto, Amortecer, Desvio ou Continuação).

### Sistema de Combos
- Se o jogador completar a sequência lógica **Defesa -> Levantamento -> Ataque** sem interrupções, o ataque recebe um bônus final de **+2 Poder**.

## 🧠 Inteligência Artificial
- Simula a tomada de decisão jogando com as mesmas restrições de energia do jogador humano.
- Seleciona cartas virtuais analisando a relação "Custo / Benefício".
- Possui 30% de chance de "comprar carta" (-1⚡) caso a opção ideal não esteja no topo do baralho.
- Avalia defesas de forma inteligente, jogando cartas do topo até equiparar o poder necessário para salvar a bola.

## 💾 Gestão de Estado (`G` Object)
O objeto `G` é o coração do jogo. Variáveis principais:
- `pPts`, `aPts`, `pSets`, `aSets`: Placar (Vai até 5 pontos para fechar o Set).
- `energy`, `aiEnergy`: Recursos atuais (Max 10).
- `phase`: A etapa atual (ex: `setting`).
- `possession`: Quem está com a posse da bola (`player` ou `ai`).
- `defWindow`, `blockWindow`: Controlam a exibição das janelas de defesa do usuário perante ataques da IA.
- `log`: Array armazenando as últimas jogadas narradas para renderizar no HUD.

## 🚀 Próximos Passos (Roadmap MVP)
- [ ] Implementar sistema de "Recompensas de Partida" (Adicionar cartas permanentes ao deck pós-vitória).
- [ ] Criar Cartas de Efeito de Status (Ex: "Cansaço", encarece cartas do adversário).
- [ ] Aprimorar animações de movimentação da bola durante bloqueios mortos.
