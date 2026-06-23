# Catálogo de Cartas — Design Document (120 cartas)

> **Status:** Design only — nenhuma dessas cartas está em `data.js` ainda.
> **Implementação:** Quando for codificar, adicionar em data.js com id único, level, phases e bonus conforme indicado.
> **Efeitos condicionais:** Escritos em linguagem natural. Motor de condicionais é backlog (não implementado).

---

## Distribuição

| Categoria | Básico | Intermediário | Avançado | Total |
|---|---|---|---|---|
| Ataque | 10 | 12 | 8 | 30 |
| Defesa | 10 | 12 | 8 | 30 |
| Levantamento | 7 | 9 | 6 | 22 |
| Bloqueio | 7 | 9 | 6 | 22 |
| Saque | 5 | 6 | 5 | 16 |
| **Total** | **39** | **48** | **33** | **120** |

Cartas Coach (Dica do Treinador) são meta-cartas fora desse catálogo de 120.

---

## Archetypes de Build

| Archetype | Foco principal |
|---|---|
| **Potência** | Maximizar poder de ataque bruto |
| **Técnica** | Combos defense→setting→attack para bônus de +2 |
| **Resistência** | Recuperação de energia, sustain de longo prazo |
| **Leitura de Jogo** | Redução de defesa do adversário, antecipação |
| **Pressão** | Saques fortes que deterioram a recepção oponente |
| **Bloqueio** | Maximizar chance de ponto direto no bloqueio |
| **Recepção** | Defesas altas para garantir Vantagem Defensiva (gap ≥4) |
| **Moral** | [Backlog] Efeitos condicionais quando Moral está alta |

---

---

# ATAQUE (30 cartas)

---

## Básico (10)

---

**Nome:** Ponta Aberta
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Atacada ampla para o centro da quadra. Segura e sem ângulos ousados.
**Efeito:** Poder 3. Custo 1.
**Sinergias:** Archetype Técnica — funciona como fechamento de combo básico.
**Estratégia Recomendada:** Usar quando a defesa adversária está desorganizada. Não arrisque quando o bloqueio está forte.

---

**Nome:** Ataque Frontal
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Cortada direta de frente para o centro do campo adversário.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Levantamento Alto — o bônus de +3 power eleva para 7 total, atingindo Vantagem Defensiva no adversário fraco.
**Estratégia Recomendada:** Combo simples: Levantamento Alto → Ataque Frontal. Previsível, mas eficiente.

---

**Nome:** Bola Alta
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Ataque lento e alto que força o adversário a se posicionar.
**Efeito:** Poder 2. Custo 0. Se o adversário não tiver levantado bloqueio nesse ponto, +1 poder adicional.
**Sinergias:** Pressão — use depois de saques fortes para explorar a fadiga do adversário.
**Estratégia Recomendada:** Carta gratuita excelente para preservar energia. Não é ideal quando o bloqueio adversário está alto.

---

**Nome:** Rolinho
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Toque suave com efeito de rotação que passa por cima dos dedos do bloqueador.
**Efeito:** Poder 2. Custo 0. A defesa adversária é reduzida em -1 para essa jogada (ignora parte do bloqueio).
**Sinergias:** Leitura de Jogo — combina com cartas que reduzem a defesa AI antes do ataque.
**Estratégia Recomendada:** Ótimo quando o bloqueador adversário está alto e você quer um ataque low-risk.

---

**Nome:** Paralelinha
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Ataque paralelo rente à linha lateral. Clássico e eficiente.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Archetype Técnica — fecha combos simples com poder consistente.
**Estratégia Recomendada:** Carta padrão de fechamento de combo. Use com Levantamento Alto para 7 de poder total.

---

**Nome:** Bola Mole
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Dink controlado que cai logo atrás da rede.
**Efeito:** Poder 1. Custo 0. Se o adversário bloqueou nesse ponto, Poder +3 (exploita o espaço aberto).
**Sinergias:** Bloqueio — excelente contra adversários que tentam bloquear frequentemente.
**Estratégia Recomendada:** Use quando o adversário vem para o bloqueio. Sozinha é fraca; combinada com a leitura do bloqueador é poderosa.

---

**Nome:** Cutback
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Cortada que muda de direção no último momento. Engana defensores posicionados.
**Efeito:** Poder 3. Custo 1. Defesa do adversário -1 (dificuldade de leitura).
**Sinergias:** Leitura de Jogo, Finta — múltiplas reduções de defesa se combinadas.
**Estratégia Recomendada:** Combina bem com Levantamento de Costas para desorientar totalmente a defesa.

---

**Nome:** Ataque Fundo
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Ataque de zona de fundo, forçando o adversário para trás da quadra.
**Efeito:** Poder 5. Custo 2.
**Sinergias:** Potência — alto poder sem custo excessivo para o nível básico.
**Estratégia Recomendada:** Bom fechador quando você tem energia. Não precisa de levantamento especial.

---

**Nome:** Ataque Aberto
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Cortada larga pelo lado oposto ao bloqueador.
**Efeito:** Poder 4. Custo 1. Se nenhum bloqueio foi jogado nesse ponto, Poder +2.
**Sinergias:** Pressão — funciona melhor depois de saques que deixam o adversário recuado.
**Estratégia Recomendada:** Carta situacional. No match 1v1 sem bloqueio frequente, pode chegar a Poder 6.

---

**Nome:** Ataque de Segunda
**Categoria:** Ataque
**Nível:** Básico
**Descrição:** Atacada diretamente do segundo toque, surpreendendo o adversário.
**Efeito:** Poder 3. Custo 1. Não exige levantamento — pode ser jogado diretamente após defesa.
**Sinergias:** Recepção — permite finalizar o ponto sem passar por levantamento.
**Estratégia Recomendada:** Use quando a energia está baixa e você quer economizar um passo. Encurta o combo mas reduz o poder total.

---

## Intermediário (12)

---

**Nome:** Cortada Diagonal
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Cortada clássica cruzando a quadra em diagonal. Explora ângulos abertos.
**Efeito:** Poder 6. Custo 2.
**Sinergias:** Levantamento Alto (+3) = 9 total, chegando a Vantagem Defensiva/Defesa Dominante.
**Estratégia Recomendada:** A carta de ataque mais consistente do nível intermediário. Alvo do combo técnica.

---

**Nome:** Finta
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Gesto de ataque enganoso — o adversário se move antes da bola ser direcionada.
**Efeito:** Poder 2. Custo 1. Defesa do adversário -2. Pode ser combinado com outros reducers.
**Sinergias:** Leitura de Jogo, Cutback — múltiplas reduções chegam a -4 total.
**Estratégia Recomendada:** Não é para matar o ponto diretamente; é para enfraquecer a defesa do adversário, tornando seu ataque seguinte muito mais eficiente.

---

**Nome:** Pipe
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Ataque do ponto médio de fundo da quadra, entre os dois adversários.
**Efeito:** Poder 6. Custo 2. Se o adversário jogou carta de bloqueio nesse ponto, Poder +2.
**Sinergias:** Potência — altíssimo poder em situações de bloqueio adversário.
**Estratégia Recomendada:** Exploita o espaço deixado pelo bloqueador. Ótimo contra builds de bloqueio pesado.

---

**Nome:** Bola Quicada
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Ataque com forte rotação que quica próximo à linha de fundo.
**Efeito:** Poder 5. Custo 2. A defesa adversária -1 (dificuldade com o efeito).
**Sinergias:** Pressão — combina com saques de efeito para criar padrão difícil.
**Estratégia Recomendada:** Bom mid-range. Consistente sem ser espetacular.

---

**Nome:** Cortada de Potência
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Cortada máxima com todo o peso do corpo. Alta velocidade, trajetória previsível.
**Efeito:** Poder 7. Custo 2.
**Sinergias:** Potência pura. Levantamento Rápido reduz o custo de setup.
**Estratégia Recomendada:** Para quando você tem energia e quer garantir o ponto. Sem efeito secundário — puro poder.

---

**Nome:** Tabela no Bloqueio
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Ataque intencional no braço do bloqueador para desviar para fora.
**Efeito:** Poder 4. Custo 1. Se o adversário jogou carta de bloqueio nesse ponto, +3 Poder (exploita o contato).
**Sinergias:** Leitura de Jogo — máximo efeito contra builds de bloqueio.
**Estratégia Recomendada:** Carta de nicho mas altíssimo potencial (7 de poder) quando o adversário sempre bloqueia.

---

**Nome:** Boicote na Linha
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Ataque que simula ir para o centro mas desvia para a linha no último segundo.
**Efeito:** Poder 5. Custo 2. Defesa adversária -1. Depois de ser jogada, a próxima carta de Ataque nesse rally tem +1 Poder.
**Sinergias:** Técnica — bônus acumulativo em combos longos.
**Estratégia Recomendada:** Carta de setup para o ataque seguinte. Pense dois passos à frente.

---

**Nome:** Contra-Ataque
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Exploração rápida do espaço depois de uma boa defesa.
**Efeito:** Poder 5. Custo 1. Disponível apenas se G.nextAttackBonus > 0 (após defesa de qualidade). Se G.nextAttackBonus ≥ 3, Poder +2.
**Sinergias:** Recepção — máximo sinergismo com builds de alta defesa que geram Vantagem Defensiva.
**Estratégia Recomendada:** A carta mais sinérgica com a mecânica de qualidade de defesa. Defenda bem, ataque forte.

---

**Nome:** Bola Espalmada
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Ataque de palma aberta com controle de direção preciso.
**Efeito:** Poder 5. Custo 2. +2 Energia ao jogar (técnica eficiente que não cansa).
**Sinergias:** Resistência — recupera energia enquanto ataca.
**Estratégia Recomendada:** Ideal para builds de sustain. Você ataca e ainda recupera recursos.

---

**Nome:** Cortada Rápida
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Timing perfeito no pico do salto, antes do bloqueador reagir.
**Efeito:** Poder 6. Custo 2. Ignora -1 da defesa adversária (velocidade supera leitura).
**Sinergias:** Técnica — bom fechador de combo que reduz o impacto de cartas defensivas do adversário.
**Estratégia Recomendada:** Escolha quando o adversário usou Finta ou Cutback contra você nos últimos rallies.

---

**Nome:** Ataque de Precisão
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Atacada calculada para os centímetros finais da linha lateral.
**Efeito:** Poder 5. Custo 2. Se comboIdx chegou a 3 nesse ponto (COMBO completo), Poder +3.
**Sinergias:** Técnica — a carta de ataque ideal para builds de combo.
**Estratégia Recomendada:** Invista em combo completo (defense→setting→attack). Essa carta faz o combo valer a pena.

---

**Nome:** Bola de Mão
**Categoria:** Ataque
**Nível:** Intermediário
**Descrição:** Toque rápido com a ponta dos dedos logo atrás da rede.
**Efeito:** Poder 3. Custo 0. Se o adversário está com Energia < 4, Poder +4 (exploita fadiga).
**Sinergias:** Pressão — use depois de saques que drenaram a energia adversária.
**Estratégia Recomendada:** Carta situacional com pico enorme. Em builds de pressão energética, pode ser devastadora.

---

## Avançado (8)

---

**Nome:** Bola na Linha
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** O ataque mais difícil do vôlei de praia. Trajetória rasante pela linha lateral.
**Efeito:** Poder 9. Custo 3.
**Sinergias:** Potência pura. Levantamento Rápido → Bola na Linha = 15 de poder total.
**Estratégia Recomendada:** Para momentos decisivos. Alto custo exige boa gestão de energia anterior.

---

**Nome:** Bomba
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** Cortada com salto máximo e total extensão do braço. Imparável quando bem executada.
**Efeito:** Poder 10. Custo 3. -1 Energia ao adversário (impacto psicológico).
**Sinergias:** Potência + Moral (backlog). A carta de ataque de maior poder bruto.
**Estratégia Recomendada:** Use com setup de energia. Levantamento Alto + Bomba = 13 poder. Defesa Dominante quase garantida.

---

**Nome:** Cortada de Velocidade
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** Cortada explosiva em velocidade máxima. O adversário mal vê a bola passar.
**Efeito:** Poder 8. Custo 2. A defesa adversária -3 para essa jogada (impossível de ler).
**Sinergias:** Leitura de Jogo — a combinação mais poderosa de reducer + poder.
**Estratégia Recomendada:** -3 na defesa adversária + 8 de poder = gap amplificado. Mesmo adversários bem defendidos sofrem.

---

**Nome:** Ataque Sobreposto
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** Coordenação perfeita: o atacante usa o espaço criado pelo companheiro.
**Efeito:** Poder 7. Custo 2. Se G.atkBoost > 0, Poder +3 adicional (sincronia máxima).
**Sinergias:** Levantamento Rápido — a origem mais comum de G.atkBoost.
**Estratégia Recomendada:** Sempre jogue um levantamento antes dessa carta. Com atkBoost ativo, chega a 10+ de poder.

---

**Nome:** Bola Curta
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** Ataque preciso logo após a rede, explorando o espaço atrás do bloqueador.
**Efeito:** Poder 6. Custo 2. Defesa adversária -2. Se adversário jogou bloqueio nesse ponto, +4 Poder.
**Sinergias:** Leitura de Jogo + Bloqueio adversário — carta anti-bloqueio definitiva.
**Estratégia Recomendada:** O contra ao adversário que bloqueia muito. Em situação certa: 10 de poder total.

---

**Nome:** Boicote Cruzado
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** Combinação de desinformação e precisão: muda de diagonal no ar.
**Efeito:** Poder 7. Custo 2. Defesa adversária -2. Próxima carta de Ataque nesse rally tem +2 Poder.
**Sinergias:** Leitura de Jogo — múltiplos efeitos sequenciais.
**Estratégia Recomendada:** Use em combos onde você planeja atacar mais de uma vez no mesmo ponto (situacional em rallies longos).

---

**Nome:** Especialista em Bloqueio
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** O atacante sabe exatamente onde o bloqueador vai estar — e ataca o espaço oposto.
**Efeito:** Poder 8. Custo 3. Se adversário jogou carta de bloqueio nesse ponto, ignora toda a redução de poder do bloqueio.
**Sinergias:** Potência + Leitura de Jogo — nenhum bloqueio adversário funciona.
**Estratégia Recomendada:** Use quando o adversário sistematicamente bloqueia. Transforma a estratégia dele em fraqueza.

---

**Nome:** Ataque Perfeito
**Categoria:** Ataque
**Nível:** Avançado
**Descrição:** Execução técnica impecável: posição, timing e direção em harmonia total.
**Efeito:** Poder 9. Custo 3. Se G.nextAttackBonus ≥ 2 (veio de defesa de qualidade), Poder +4 (sinergia máxima).
**Sinergias:** Recepção + Técnica — combina os dois archetypes mais sofisticados.
**Estratégia Recomendada:** A carta definitiva para builds de Recepção. Defenda bem, receba o bônus, ataque com 13 de poder total.

---

---

# DEFESA (30 cartas)

---

## Básico (10)

---

**Nome:** Manchete Firme
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Plataforma estável com os dois braços. A base da defesa no vôlei de praia.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Archetype Técnica — o primeiro passo do combo defense→setting→attack.
**Estratégia Recomendada:** Confiável e simples. Use quando não tem cartas melhores disponíveis.

---

**Nome:** Mergulho
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Arremesso corporal para salvar bola perdida. Gratuito e eficaz em situações de desespero.
**Efeito:** Poder 2. Custo 0.
**Sinergias:** Resistência — custo zero preserva energia para o ataque.
**Estratégia Recomendada:** Sempre disponível sem custo. Ideal quando a energia está no limite.

---

**Nome:** Recepção Base
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Posição defensiva equilibrada: pés afastados, joelhos dobrados, braços prontos.
**Efeito:** Poder 3. Custo 1. +1 Energia (postura eficiente).
**Sinergias:** Resistência — recupera o custo ao jogar.
**Estratégia Recomendada:** Carta neutra que recupera sua própria energia. Boa para manter sustain no início do match.

---

**Nome:** Defesa Lateral
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Mergulho lateral para bolas no canto da quadra.
**Efeito:** Poder 3. Custo 0. Se a bola vem de Saque (isDefendingServe = true), +2 Poder.
**Sinergias:** Pressão (defensiva) — especialmente bom contra adversários que saqueiam para os cantos.
**Estratégia Recomendada:** Especializada em recepção de saque. Fraca em defesa normal, excelente em recepção.

---

**Nome:** Manchete Baixa
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Plataforma próxima ao chão para bolas rasteiras.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Recepção — poder consistente para garantir Equilíbrio (gap 0-3).
**Estratégia Recomendada:** Padrão para defesas de ataques medianos. Nível Básico confiável.

---

**Nome:** Cobertura de Bloqueio
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Posicionamento para pegar a bola que desvia do bloqueio do parceiro.
**Efeito:** Poder 3. Custo 0. Disponível apenas após bloqueio (blockWindow usado nesse ponto).
**Sinergias:** Bloqueio — essencial para builds de bloqueio que precisam de cobertura.
**Estratégia Recomendada:** Carta de niche mas perfeita em builds de bloqueio. Gratuita com condição situacional.

---

**Nome:** Defesa em Pé
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Defesa simples sem mergulho — para bolas altas e lentas.
**Efeito:** Poder 2. Custo 0. Se o ataque adversário tem Poder ≤ 4, +3 Poder (fácil de defender).
**Sinergias:** Resistência — carta livre que funciona bem contra ataques fracos.
**Estratégia Recomendada:** Contra adversários que usam ataques básicos, essa carta pode chegar a 5 de poder sem custo.

---

**Nome:** Salto de Defesa
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Pequeno salto para interceptar bola alta no momento certo.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Técnica — força base para combo.
**Estratégia Recomendada:** Substituto de Manchete Firme. Mesmo poder, mesmo custo. Boa para deckbuilding com redundância.

---

**Nome:** Defesa de Manchete
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Boa leitura do ataque antes de executar a manchete.
**Efeito:** Poder 5. Custo 1.
**Sinergias:** Recepção — poder 5 é suficiente para Equilíbrio contra ataques medianos.
**Estratégia Recomendada:** Ligeiramente mais forte que Manchete Firme com mesmo custo. Preferível.

---

**Nome:** Bola Salva
**Categoria:** Defesa
**Nível:** Básico
**Descrição:** Defesa de último segundo. A bola que parecia perdida fica no campo.
**Efeito:** Poder 2. Custo 0. +2 Energia (adrenalina da jogada difícil).
**Sinergias:** Resistência — a melhor recuperação de energia entre as cartas básicas de defesa.
**Estratégia Recomendada:** Use como seguro: sem custo, recupera energia. Fraca em poder mas valiosa em sustain.

---

## Intermediário (12)

---

**Nome:** Leitura de Jogo
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Antecipação perfeita — você já está onde a bola vai cair.
**Efeito:** Poder 4. Custo 2. +2 Energia.
**Sinergias:** Resistência + Leitura de Jogo — cobre o custo com a recuperação de energia.
**Estratégia Recomendada:** Carta de valor neutro em energia. Boa para garantir sustain sem perder poder defensivo.

---

**Nome:** Posicionamento Perfeito
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Colocação ideal no campo antes do ataque adversário. Absorção máxima de impacto.
**Efeito:** Poder 7. Custo 2.
**Sinergias:** Recepção — 7 de poder coloca você em Vantagem Defensiva contra ataques de poder 4 ou menos.
**Estratégia Recomendada:** A melhor carta de defesa básica. Use para garantir gap positivo e nextAtkBonus +2.

---

**Nome:** Defesa Antecipada
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Você leu o levantamento adversário antes do ataque. Posição já tomada.
**Efeito:** Poder 6. Custo 1.
**Sinergias:** Leitura de Jogo — maior defesa com menor custo.
**Estratégia Recomendada:** Excelente custo-benefício. Um dos melhores por unidade de energia gasta.

---

**Nome:** Defesa de Velocidade
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Reação rápida para ataques de alta velocidade.
**Efeito:** Poder 5. Custo 1. Contra ataques de Poder ≥ 8, +2 Poder adicional (treino específico).
**Sinergias:** Recepção — melhora exatamente onde você mais precisa.
**Estratégia Recomendada:** Situacional mas muito eficaz contra adversários potência. Contra Bola na Linha (9), defende com 7.

---

**Nome:** Cobertura Total
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Defesa que cobre todas as zonas da quadra em uma jogada.
**Efeito:** Poder 6. Custo 2. Pode ser combinada com outra carta de Defesa no mesmo passo (poder somado).
**Sinergias:** Recepção — combinar duas cartas de defesa em um turn é poderoso.
**Estratégia Recomendada:** A única carta de defesa que permite multi-carta defensiva. Cria o maior poder defensivo possível.

---

**Nome:** Manchete de Corrida
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Arrancada lateral para alcançar bola que parecia fora de alcance.
**Efeito:** Poder 5. Custo 1. Se a defesa anterior foi Equilíbrio (nextAtkBonus = 0), +2 Poder (sequência de qualidade).
**Sinergias:** Técnica — melhora progressivamente em rallies longos.
**Estratégia Recomendada:** Defenda bem no primeiro rally, use essa no segundo para subir de Equilíbrio para Vantagem Defensiva.

---

**Nome:** Rotação Defensiva
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Troca coordenada de posição para cobrir o espaço aberto pelo bloqueador.
**Efeito:** Poder 5. Custo 2. +1 Energia ao jogar (eficiência de movimentação).
**Sinergias:** Bloqueio — perfeito depois que o bloqueador sobe.
**Estratégia Recomendada:** Use em sequência com cartas de bloqueio para maximizar cobertura e sustain.

---

**Nome:** Defesa Lateral Profunda
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Defesa que cobre as linhas laterais com profundidade de campo.
**Efeito:** Poder 6. Custo 2.
**Sinergias:** Recepção — poder sólido sem condicional.
**Estratégia Recomendada:** Carta de força bruta no estilo defensivo. Sem surpresas.

---

**Nome:** Defesa de Reação
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Reflexo puro. Você não pensou — seu corpo foi.
**Efeito:** Poder 4. Custo 0. +3 Energia (adrenalina máxima).
**Sinergias:** Resistência — o maior gerador de energia entre as cartas intermediárias.
**Estratégia Recomendada:** Baixo poder mas gratuita com enorme recuperação de energia. Vital em momentos de crise de recursos.

---

**Nome:** Recepção Flutuante
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Manchete suave que sobe a bola perfeitamente para o levantador.
**Efeito:** Poder 5. Custo 1. Depois de jogar essa carta, G.atkBoost +1 para o próximo ataque (levantamento facilitado).
**Sinergias:** Técnica — a defesa que já começa a configurar o ataque.
**Estratégia Recomendada:** Combo de 3: Recepção Flutuante → qualquer levantamento (+boost+boost) → ataque.

---

**Nome:** Cobertura de Bola Curta
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Antecipação de bolas que caem logo atrás da rede.
**Efeito:** Poder 5. Custo 1. Contra ataques de Poder ≤ 4, Poder +3 (cobertura especializada).
**Sinergias:** Leitura de Jogo — excelente contra adversários que usam Bola Mole ou Rolinho.
**Estratégia Recomendada:** Meta-counter contra builds táticas com ataques fracos. Inutilizada contra builds de potência.

---

**Nome:** Bloqueio Parcial
**Categoria:** Defesa
**Nível:** Intermediário
**Descrição:** Você toca a bola no bloqueio mas não completamente — ela desacelera e você ainda defende.
**Efeito:** Poder 4. Custo 1. Reduz o poder do ataque adversário em -2 antes da resolução desta defesa.
**Sinergias:** Bloqueio — combina elementos de bloqueio e defesa.
**Estratégia Recomendada:** Use quando quiser maximizar o gap defensivo: você reduz o ataque E adiciona poder de defesa simultaneamente.

---

## Avançado (8)

---

**Nome:** Defesa Heroica
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** A defesa impossível. O atleta se joga de forma espetacular para salvar uma cravada.
**Efeito:** Poder 10. Custo 3.
**Sinergias:** Recepção — 10 de poder garante Vantagem Defensiva contra praticamente qualquer ataque.
**Estratégia Recomendada:** A carta de defesa mais poderosa. Use para criar Defesa Dominante (gap ≥7) e garantir nextAtkBonus +4.

---

**Nome:** Defesa Acrobática
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** Mergulho com giro lateral, salvando a bola com um único braço.
**Efeito:** Poder 8. Custo 2. +2 Energia (espetáculo que energiza a equipe — Moral futura).
**Sinergias:** Resistência + Recepção — alto poder com recuperação.
**Estratégia Recomendada:** Quase tão forte quanto Defesa Heroica por menos custo. A melhor carta de defesa custo-benefício.

---

**Nome:** Manchete com Giro
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** Rotação do corpo no ar para ajustar o ângulo de defesa no último momento.
**Efeito:** Poder 7. Custo 2. Defesa adversária -2 no próximo turno (a jogada impressiona e desequilibra).
**Sinergias:** Leitura de Jogo — debuffa o adversário enquanto você defende.
**Estratégia Recomendada:** Dual-purpose: defende agora e enfraquece o próximo ataque adversário.

---

**Nome:** Defesa Total
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** Leitura + posicionamento + execução. A defesa perfeita como sistema.
**Efeito:** Poder 8. Custo 3. Se o resultado for Vantagem Defensiva ou Defesa Dominante, +2 Energia (recompensa a excelência).
**Sinergias:** Recepção — se você já defende bem, essa carta te recompensa ainda mais.
**Estratégia Recomendada:** A carta mais condicional mas mais recompensadora. Só use se tiver certeza que vai obter boa qualidade.

---

**Nome:** Defesa Sobreposta
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** Você se posiciona usando o corpo do parceiro como ponto de referência para cobertura dupla.
**Efeito:** Poder 9. Custo 3.
**Sinergias:** Potência defensiva pura. A segunda carta de maior poder defensivo.
**Estratégia Recomendada:** Alternativa a Defesa Heroica quando você quer poder 9 com custo 3. Sem condicionais.

---

**Nome:** Defesa de Especialista
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** Técnica refinada por anos de prática: nenhum ataque é surpreendente.
**Efeito:** Poder 7. Custo 2. +1 Poder para cada carta de Defesa já usada nesse ponto (máx +3).
**Sinergias:** Recepção + Cobertura Total — builds que usam múltiplas cartas de defesa.
**Estratégia Recomendada:** Em combos defensivos (Cobertura Total permite multi-defesa), pode chegar a 10 de poder.

---

**Nome:** Cobertura Impossível
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** A bola voa para além do alcance humano — e mesmo assim você a salva.
**Efeito:** Poder 6. Custo 1. +4 Energia (a defesa impossível inspira a equipe).
**Sinergias:** Resistência — o maior gerador de energia do jogo inteiro.
**Estratégia Recomendada:** Poder médio mas sustain máximo. Ideal para builds de Resistência que vivem de energia.

---

**Nome:** Defesa Perfeita
**Categoria:** Defesa
**Nível:** Avançado
**Descrição:** Posicionamento, leitura, timing e execução. Absolutamente nada falha.
**Efeito:** Poder 10. Custo 3. Garantia de Vantagem Defensiva ou melhor (minimum gap = +4 após esta jogada).
**Sinergias:** Recepção — remove a aleatoriedade da defesa. Garante nextAtkBonus ≥ +2.
**Estratégia Recomendada:** A única carta que garante qualidade mínima de defesa independente do poder de ataque adversário. Decisiva em partidas apertadas.

---

---

# LEVANTAMENTO (22 cartas)

---

## Básico (7)

---

**Nome:** Levantamento Alto
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Bola enviada bem acima da rede, dando tempo ao atacante.
**Efeito:** Poder 0. Custo 1. G.atkBoost +3.
**Sinergias:** Potência — multiplica o poder de qualquer carta de ataque.
**Estratégia Recomendada:** O levantamento padrão. +3 de ataque por 1 energia é excelente custo-benefício.

---

**Nome:** Levantamento de Frente
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Toque direto de frente, sem variação. Previsível mas preciso.
**Efeito:** Poder 0. Custo 1. G.atkBoost +2.
**Sinergias:** Técnica — fecha combos com bônus menor mas suficiente.
**Estratégia Recomendada:** Substituto de Levantamento Alto quando ele não está disponível. Bônus menor (+2) mas funcional.

---

**Nome:** Levantamento Cruzado
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Toque que envia a bola para o lado oposto, confundindo o bloqueador.
**Efeito:** Poder 0. Custo 1. G.atkBoost +2. Defesa adversária -1 (posição errada para o bloqueio).
**Sinergias:** Leitura de Jogo — bônus de ataque + reducer de defesa.
**Estratégia Recomendada:** Ligeiramente melhor que Levantamento de Frente quando o adversário bloqueia muito.

---

**Nome:** Toque de Segundo
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Segundo toque controlado enviando ao atacante.
**Efeito:** Poder 0. Custo 0. G.atkBoost +1.
**Sinergias:** Resistência — custo zero preserva energia.
**Estratégia Recomendada:** Gratuito com bônus mínimo. Use quando a energia está baixa e você só precisa avançar a fase.

---

**Nome:** Levantamento em Pé
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Levantamento executado sem salto, pés firmes no chão.
**Efeito:** Poder 0. Custo 1. G.atkBoost +2. +1 Energia (economia de esforço físico).
**Sinergias:** Resistência — cobre o custo e ainda adiciona boost.
**Estratégia Recomendada:** Carta de valor neutro em energia com bônus de ataque decente.

---

**Nome:** Devolução de Defesa
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Conversão direta da manchete em levantamento sem perder controle.
**Efeito:** Poder 0. Custo 0. G.atkBoost +1. Se G.nextAttackBonus > 0, atkBoost total +1 adicional.
**Sinergias:** Recepção — se você defendeu bem, o levantamento fica ainda melhor.
**Estratégia Recomendada:** Em builds de Recepção que já garantem nextAtkBonus, esse levantamento grátis amplifica o acúmulo.

---

**Nome:** Levantamento Lateral
**Categoria:** Levantamento
**Nível:** Básico
**Descrição:** Toque lateral para abrir ângulo de ataque.
**Efeito:** Poder 0. Custo 1. G.atkBoost +3. Defesa adversária -1.
**Sinergias:** Leitura de Jogo + Potência — o melhor levantamento básico em termos de efeito combinado.
**Estratégia Recomendada:** +3 boost e -1 defesa adversária é equivalente a ampliar o gap em 4. Priorize em qualquer build.

---

## Intermediário (9)

---

**Nome:** Levantamento de Costas
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Toque para trás sem virar o corpo. Engana o bloqueador completamente.
**Efeito:** Poder 0. Custo 1. G.atkBoost +0. Defesa adversária -2.
**Sinergias:** Leitura de Jogo — o maior reducer de defesa entre os levantamentos.
**Estratégia Recomendada:** Não adiciona boost mas -2 na defesa adversária é enorme. Combine com ataques de alto poder.

---

**Nome:** Levantamento Rápido
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Bola enviada antes do bloqueador se posicionar. Velocidade como vantagem.
**Efeito:** Poder 0. Custo 1. G.atkBoost +4.
**Sinergias:** Potência — o maior boost entre levantamentos intermediários.
**Estratégia Recomendada:** Para maximizar poder de ataque. Levantamento Rápido + Bola na Linha = 13 de poder.

---

**Nome:** Levantamento de Mão Cheia
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Toque aberto com as duas mãos, controlando perfeitamente a trajetória.
**Efeito:** Poder 0. Custo 2. G.atkBoost +5. +1 Energia.
**Sinergias:** Potência + Resistência — alto boost sem custo líquido excessivo.
**Estratégia Recomendada:** Custo líquido de 1 energia por +5 de boost. O melhor custo-benefício de boost absoluto.

---

**Nome:** Levantamento de Plataforma
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Levantamento com manchete para situações onde o toque seria difícil.
**Efeito:** Poder 0. Custo 1. G.atkBoost +2. Se a defesa anterior foi Vantagem Defensiva ou melhor, +2 atkBoost adicional.
**Sinergias:** Recepção + Técnica — o levantamento que cresce com a qualidade defensiva.
**Estratégia Recomendada:** Em builds de Recepção, a defesa forte rende bônus no levantamento também.

---

**Nome:** Levantamento Surpresa
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Decisão de última hora: a bola vai para onde o bloqueador menos esperava.
**Efeito:** Poder 0. Custo 1. G.atkBoost +3. Defesa adversária -1.
**Sinergias:** Leitura de Jogo + Potência — o mais equilibrado entre boost e reducer.
**Estratégia Recomendada:** Versão upgradada de Levantamento Lateral. Mesmo combo de efeitos, mais poder de contexto.

---

**Nome:** Levantamento de Corrida
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Movimento em sprint até o ponto de contato. Impede a bola de cair.
**Efeito:** Poder 0. Custo 1. G.atkBoost +3. +2 Energia (momentum físico).
**Sinergias:** Resistência — +3 boost com +2 de energia é o melhor gerador de sustain entre levantamentos.
**Estratégia Recomendada:** Para builds de Resistência que precisam de levantamento sem sacrificar energia.

---

**Nome:** Bola de Segundo Tempo
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Levantamento tardio, fora do timing esperado. Confunde o bloqueio adversário.
**Efeito:** Poder 0. Custo 2. G.atkBoost +4. Defesa adversária -2.
**Sinergias:** Leitura de Jogo — o maior reducer + boost equilibrado do jogo.
**Estratégia Recomendada:** O levantamento mais letal para desorientar defesas. -2 defesa + +4 boost = gap amplificado em 6.

---

**Nome:** Levantamento Baixo
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Toque tenso e preciso próximo à rede.
**Efeito:** Poder 0. Custo 1. G.atkBoost +3. Contra ataques subsequentes de Bola Curta ou Rolinho, +2 atkBoost adicional.
**Sinergias:** Técnica (curtas) — potencia ataques de toque suave.
**Estratégia Recomendada:** Para builds táticas que focam em Bola Mole, Rolinho e Bola Curta.

---

**Nome:** Levantamento Surpresa de Costas
**Categoria:** Levantamento
**Nível:** Intermediário
**Descrição:** Levantamento para trás executado em movimento. A jogada mais difícil de ler.
**Efeito:** Poder 0. Custo 2. G.atkBoost +3. Defesa adversária -3.
**Sinergias:** Leitura de Jogo — o maior reducer de defesa do jogo entre os levantamentos.
**Estratégia Recomendada:** -3 na defesa adversária é devastador. Mesmo sem ataques de alto poder, o gap cai 3 pontos.

---

## Avançado (6)

---

**Nome:** Levantamento Rápido Avançado
**Categoria:** Levantamento
**Nível:** Avançado
**Descrição:** Velocity extrema no segundo toque. O bloqueador não tem tempo de reagir.
**Efeito:** Poder 0. Custo 2. G.atkBoost +6.
**Sinergias:** Potência pura — o maior boost do jogo.
**Estratégia Recomendada:** Levantamento Rápido Avançado + Bola na Linha (9) = 15 de poder. Defesa Dominante garantida contra qualquer defesa < 8.

---

**Nome:** Levantamento Enganador
**Categoria:** Levantamento
**Nível:** Avançado
**Descrição:** Movimento falso seguido de toque perfeito. O adversário nunca sabe para onde vai.
**Efeito:** Poder 0. Custo 2. G.atkBoost +4. Defesa adversária -3.
**Sinergias:** Leitura de Jogo — o levantamento de maior impacto combinado (boost + reducer).
**Estratégia Recomendada:** +4 boost e -3 defesa = gap amplificado em 7. A partir daqui quase todo ataque resulta em Vantagem Defensiva.

---

**Nome:** Superlevantamento
**Categoria:** Levantamento
**Nível:** Avançado
**Descrição:** Toque de perfeição técnica. Bola colocada exatamente onde o atacante precisa.
**Efeito:** Poder 0. Custo 2. G.atkBoost +5. +1 Energia.
**Sinergias:** Potência + Resistência — boost massivo com recuperação parcial.
**Estratégia Recomendada:** O levantamento mais balanceado do nível avançado. Alto boost com custo gerenciável.

---

**Nome:** Bola de Ouro
**Categoria:** Levantamento
**Nível:** Avançado
**Descrição:** O levantamento que todos lembram: timing, posição e velocidade perfeitos.
**Efeito:** Poder 0. Custo 3. G.atkBoost +6. +2 Energia. Defesa adversária -1.
**Sinergias:** Potência + Resistência + Leitura — a carta de levantamento definitiva.
**Estratégia Recomendada:** Combina o maior boost com recuperação de energia e reducer de defesa. Custo alto exige planejamento de energia.

---

**Nome:** Levantamento de Alta Velocidade
**Categoria:** Levantamento
**Nível:** Avançado
**Descrição:** Segundo toque executado em fração de segundo. Impossível de antecipar.
**Efeito:** Poder 0. Custo 2. G.atkBoost +5. Defesa adversária -2.
**Sinergias:** Leitura de Jogo + Potência — segundo maior combinado do nível avançado.
**Estratégia Recomendada:** Para quando você quer tanto boost quanto reducer. Ligeiramente menos potente que Levantamento Enganador em termos de gap total mas mais boost absoluto.

---

**Nome:** Levantamento Decisivo
**Categoria:** Levantamento
**Nível:** Avançado
**Descrição:** No momento que mais importa, o segundo toque é impecável.
**Efeito:** Poder 0. Custo 2. G.atkBoost +4. Se G.pPts < G.aPts (você está perdendo), atkBoost +3 adicional.
**Sinergias:** Moral (backlog) — máximo potencial quando pressionado.
**Estratégia Recomendada:** Carta de comeback. Quando está perdendo no placar, os +7 de boost total podem virar o match.

---

---

# BLOQUEIO (22 cartas)

---

## Básico (7)

---

**Nome:** Bloqueio Simples
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Salto básico com os braços acima da rede. Primeira linha de defesa.
**Efeito:** Poder 3. Custo 1.
**Sinergias:** Bloqueio — a carta de entrada para builds de bloqueio.
**Estratégia Recomendada:** Use para ativar as probabilidades de bloqueio. Mesmo com poder baixo, 20% de ponto direto é valioso.

---

**Nome:** Leitura de Bloqueio
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Você lê o levantador e sabe para onde vai o ataque antes de acontecer.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Bloqueio — poder ligeiramente maior que Bloqueio Simples ao mesmo custo.
**Estratégia Recomendada:** Preferível a Bloqueio Simples. Se tiver ambos disponíveis, escolha essa.

---

**Nome:** Bloqueio Lateral
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Salto lateral para cobrir ataques na ponta.
**Efeito:** Poder 3. Custo 0. Contra ataques em linha (cartas com "Linha" no nome), Poder +2.
**Sinergias:** Leitura de Jogo — se você sabe que o adversário vai atacar pela linha.
**Estratégia Recomendada:** Gratuito e condicional. Excelente counter para Paralelinha e Bola na Linha.

---

**Nome:** Bloqueio de Salto
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Timing perfeito de salto para interceptar no pico do ataque.
**Efeito:** Poder 4. Custo 1.
**Sinergias:** Bloqueio — similar a Leitura de Bloqueio. Boa redundância no deck.
**Estratégia Recomendada:** Use em builds que querem 6+ cartas de bloqueio para maximizar a chance de tirar uma no turno de bloqueio.

---

**Nome:** Bloqueio de Reação
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Sem leitura — puro reflexo quando a bola já está em movimento.
**Efeito:** Poder 2. Custo 0. +2 Energia.
**Sinergias:** Resistência — bloqueio gratuito com recuperação de energia.
**Estratégia Recomendada:** Baixo poder mas gratuito com energia. Para builds de sustain que querem bloquear sem custo.

---

**Nome:** Bloqueio Fechado
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Braços totalmente fechados, sem espaço para a bola passar.
**Efeito:** Poder 3. Custo 1. +10% na probabilidade de ponto direto (de 20% para 30%).
**Sinergias:** Bloqueio — qualquer build de bloqueio se beneficia.
**Estratégia Recomendada:** A melhor carta de bloqueio básica para maximizar chance de ponto direto.

---

**Nome:** Bloqueio Aberto
**Categoria:** Bloqueio
**Nível:** Básico
**Descrição:** Mãos abertas direcionando a bola para zona segura de defesa.
**Efeito:** Poder 3. Custo 1. Se o bloqueio soften acontecer (30%), o poder do ataque adversário é reduzido para 1/3 (em vez de 1/2).
**Sinergias:** Recepção + Bloqueio — maximiza o efeito de amortecimento.
**Estratégia Recomendada:** Para builds que focam em soffen + defender: o resultado de soften é muito mais eficaz com essa carta.

---

## Intermediário (9)

---

**Nome:** Paredão
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Bloqueio firme com os dois braços totalmente estendidos. Grande impacto visual e eficácia.
**Efeito:** Poder 6. Custo 2.
**Sinergias:** Bloqueio + Potência — alto poder no contexto de bloqueio.
**Estratégia Recomendada:** O bloqueio intermediário de maior impacto. Use quando quer maximizar as probabilidades positivas.

---

**Nome:** Bloqueio de Linha
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Fechando a linha lateral — você força o adversário a atacar pela diagonal.
**Efeito:** Poder 5. Custo 1. Defesa adversária -1 no próximo ataque (forçou onde ele menos queria ir).
**Sinergias:** Leitura de Jogo — canaliza o adversário para onde você quer.
**Estratégia Recomendada:** O bloqueio mais tático. Não apenas para ou amortece — guia o adversário para o perigo.

---

**Nome:** Bloqueio em Diagonal
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Fechando a diagonal — cobrindo o ângulo mais usado pelos atacantes.
**Efeito:** Poder 5. Custo 2. +10% na probabilidade de ponto direto.
**Sinergias:** Bloqueio — melhor chance de ponto direto entre os intermediários.
**Estratégia Recomendada:** Para maximizar ponto direto de bloqueio. Junto com Bloqueio Fechado, pode chegar a 40% de ponto direto.

---

**Nome:** Bloqueio de Banda
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Bola desviada para fora pelo braço do bloqueador. Armadilha para o atacante.
**Efeito:** Poder 4. Custo 1. +15% na probabilidade de ponto por bloqueio saindo (de 20% para 35%).
**Sinergias:** Leitura de Jogo — maximiza chance de forçar erro adversário.
**Estratégia Recomendada:** Inverso: você quer que o bloqueio saia — mas pelo lado da linha adversária.

---

**Nome:** Leitura do Levantador
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Você já sabe para onde vai o levantamento antes do segundo toque acontecer.
**Efeito:** Poder 5. Custo 2. Se o adversário usou Levantamento de Costas nesse ponto, Poder +3.
**Sinergias:** Leitura de Jogo — counter específico para uma carta adversária.
**Estratégia Recomendada:** Meta-play de alto nível. Se você identificou o padrão adversário de Levantamento de Costas, responda com essa.

---

**Nome:** Bloqueio de Velocidade
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Salto instantâneo antes do atacante reagir. Velocidade como arma.
**Efeito:** Poder 5. Custo 1. Contra ataques de Cortada Rápida ou Velocidade, Poder +2.
**Sinergias:** Bloqueio — counter específico contra builds de velocidade.
**Estratégia Recomendada:** Se o adversário usa Cortada de Velocidade frequentemente, essa carta é o counter direto.

---

**Nome:** Bloqueio de Cobertura
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Você cobre a bola mesmo que ela passe pelo bloqueio — toca e desvia para a defesa.
**Efeito:** Poder 4. Custo 1. +15% na probabilidade de Soften (de 30% para 45%). Se Soften acontece, +1 Energia.
**Sinergias:** Recepção + Bloqueio — maximiza a cobertura pós-bloqueio.
**Estratégia Recomendada:** Para builds defensivas que querem transformar cada bloqueio numa oportunidade de defesa ainda melhor.

---

**Nome:** Bloqueio Duplo
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Coordenação dos dois jogadores saltando juntos para fechar toda a rede.
**Efeito:** Poder 6. Custo 2. +15% na probabilidade de ponto direto (de 20% para 35%).
**Sinergias:** Bloqueio + Potência — combina poder e chance de ponto direto.
**Estratégia Recomendada:** A carta de bloqueio mais equilibrada entre poder e chance de ponto. Excelente no late game.

---

**Nome:** Bloqueio Surpresa
**Categoria:** Bloqueio
**Nível:** Intermediário
**Descrição:** Você sobe quando o adversário não esperava nenhum bloqueio.
**Efeito:** Poder 5. Custo 1. +20% na probabilidade de ponto direto (de 20% para 40%).
**Sinergias:** Bloqueio — a carta de maior chance de ponto direto entre os intermediários.
**Estratégia Recomendada:** Se você quer maximizar a chance de 40% de ponto direto, essa é a carta. Risco de -4 permanece.

---

## Avançado (6)

---

**Nome:** Bloqueio Perfeito
**Categoria:** Bloqueio
**Nível:** Avançado
**Descrição:** Posição, timing e alcance perfeitos. Nada passa.
**Efeito:** Poder 8. Custo 3. +20% na probabilidade de ponto direto (40% total).
**Sinergias:** Bloqueio + Potência — o maior poder de bloqueio do jogo.
**Estratégia Recomendada:** A carta mais poderosa de bloqueio. Use para decisões importantes.

---

**Nome:** Paredão Perfeito
**Categoria:** Bloqueio
**Nível:** Avançado
**Descrição:** O bloqueio que os adversários comentam por semanas.
**Efeito:** Poder 7. Custo 2. +25% na probabilidade de ponto direto (45% total). +2 Energia.
**Sinergias:** Bloqueio + Resistência — o único bloqueio avançado que gera energia.
**Estratégia Recomendada:** Para builds de sustain que também querem bloqueio poderoso. Altíssima chance de ponto direto.

---

**Nome:** Bloqueio Definitivo
**Categoria:** Bloqueio
**Nível:** Avançado
**Descrição:** Não importa o ataque — você bloqueia.
**Efeito:** Poder 7. Custo 3. Elimina a probabilidade de bloqueio sair (a chance de -4 vai para 0%). Redistribui: +15% ponto direto, +10% Soften, +5% Continue.
**Sinergias:** Bloqueio — remove o risco negativo completamente.
**Estratégia Recomendada:** Para quem tem aversão ao risco. Perde a chance de o adversário pagar mas garante que você não paga.

---

**Nome:** Bloqueio de Especialista
**Categoria:** Bloqueio
**Nível:** Avançado
**Descrição:** Décadas de leitura de ataque concentradas em um único salto.
**Efeito:** Poder 6. Custo 2. Contra ataques de Poder ≥ 7, Poder +3 (especialização contra potência).
**Sinergias:** Recepção + Bloqueio — o melhor counter para builds de Potência adversárias.
**Estratégia Recomendada:** A resposta direta a builds de Bomba e Bola na Linha. Contra ataques de 9+, defende com 9 de poder de bloqueio.

---

**Nome:** Bloqueio de Alta Performance
**Categoria:** Bloqueio
**Nível:** Avançado
**Descrição:** Potência máxima no salto. Braços além da rede, sem abertura.
**Efeito:** Poder 8. Custo 3. Se o bloqueio resulta em ponto (20% base), +2 Energia (celebração que energiza).
**Sinergias:** Bloqueio + Moral (backlog).
**Estratégia Recomendada:** Para quem quer maximizar o benefício quando o bloqueio funciona. O upside é enorme.

---

**Nome:** Bloqueio Total
**Categoria:** Bloqueio
**Nível:** Avançado
**Descrição:** O ataque adversário encontra uma parede. Literalmente.
**Efeito:** Poder 9. Custo 3. +10% ponto direto (30% total). O bloqueio Soften reduz o ataque adversário para 0 (não pela metade).
**Sinergias:** Potência — o maior poder de bloqueio possível.
**Estratégia Recomendada:** A carta de bloqueio de maior poder absoluto. Se o Soften acontece, a defesa seguinte é trivial (poder 0 adversário).

---

---

# SAQUE (16 cartas)

---

## Básico (5)

---

**Nome:** Saque Flutuante
**Categoria:** Saque
**Nível:** Básico
**Descrição:** Saque sem rotação que oscila no ar de forma imprevisível.
**Efeito:** Poder 3. Custo 1. Taxa de erro: 14%.
**Sinergias:** Equilíbrio — confiável sem ser perigoso.
**Estratégia Recomendada:** O saque padrão. Baixo risco, pressão moderada sobre a recepção adversária.

---

**Nome:** Saque Tático
**Categoria:** Saque
**Nível:** Básico
**Descrição:** Saque controlado para área específica da quadra.
**Efeito:** Poder 1. Custo 0. Taxa de erro: 8%.
**Sinergias:** Resistência — custo zero garante que você nunca perde energia no saque.
**Estratégia Recomendada:** Para saques seguros. O menor poder mas praticamente sem erro.

---

**Nome:** Saque Controlado
**Categoria:** Saque
**Nível:** Básico
**Descrição:** Técnica básica sobre cabeça com foco em precisão.
**Efeito:** Poder 2. Custo 0. Taxa de erro: 11%.
**Sinergias:** Resistência — gratuito e de erro baixo.
**Estratégia Recomendada:** O meio-termo gratuito. Mais poder que Saque Tático, menos que Saque Flutuante.

---

**Nome:** Saque Lateral
**Categoria:** Saque
**Nível:** Básico
**Descrição:** Movimento lateral do braço criando trajetória difícil de ler.
**Efeito:** Poder 3. Custo 1. A defesa adversária -1 nesse saque.
**Sinergias:** Pressão — cria dificuldade adicional na recepção.
**Estratégia Recomendada:** Mesmo poder que Saque Flutuante mas com reducer de defesa. Ligeiramente superior.

---

**Nome:** Saque de Iniciante
**Categoria:** Saque
**Nível:** Básico
**Descrição:** O primeiro saque que todo atleta aprende. Seguro, sem potência.
**Efeito:** Poder 1. Custo 0. Taxa de erro: 5%. +1 Energia (recuperação de ritual pré-jogo).
**Sinergias:** Resistência — o saque de menor custo e menor erro do jogo.
**Estratégia Recomendada:** Apenas para preservar energia total. Em rally crítico, priorize passar o saque com segurança.

---

## Intermediário (6)

---

**Nome:** Saque Potente
**Categoria:** Saque
**Nível:** Intermediário
**Descrição:** Saque agressivo com força total. Dificulta a recepção adversária.
**Efeito:** Poder 5. Custo 2. Taxa de erro: 20%.
**Sinergias:** Pressão — alto poder mas alto risco.
**Estratégia Recomendada:** Use quando você aceita o risco em troca de pressão máxima. 20% de erro significa 1 em 5 saques perdidos.

---

**Nome:** Saque de Salto
**Categoria:** Saque
**Nível:** Intermediário
**Descrição:** Corrida, salto e saque acima da rede. O mais poderoso tecnicamente.
**Efeito:** Poder 6. Custo 2. Taxa de erro: 23%. Defesa adversária -1.
**Sinergias:** Pressão — o melhor da categoria no equilíbrio entre poder e pressão.
**Estratégia Recomendada:** Para adversários com defesa alta. O reducer de -1 faz diferença.

---

**Nome:** Saque de Pressão
**Categoria:** Saque
**Nível:** Intermediário
**Descrição:** Saque direcionado às fraquezas do adversário — linha de fundo, canto.
**Efeito:** Poder 4. Custo 1. Defesa adversária -2.
**Sinergias:** Pressão + Leitura de Jogo — duplo reducer.
**Estratégia Recomendada:** O reducer de -2 é enorme. Com Saque de Pressão, um adversário com defesa 5 efetivamente defende com 3.

---

**Nome:** Saque Curto
**Categoria:** Saque
**Nível:** Intermediário
**Descrição:** Bola que cai logo após a rede, forçando o adversário a avançar rapidamente.
**Efeito:** Poder 3. Custo 1. Defesa adversária -2. O adversário não pode usar bônus de defesa nesse saque.
**Sinergias:** Leitura de Jogo — remove o efeito de cartas defensivas adversárias.
**Estratégia Recomendada:** Counter para builds de Recepção. Neutraliza bônus de cartas como Leitura de Jogo adversária.

---

**Nome:** Saque em Z
**Categoria:** Saque
**Nível:** Intermediário
**Descrição:** Trajetória em Z desorientando completamente o receptor.
**Efeito:** Poder 5. Custo 2. Taxa de erro: 18%. Se aceito (adversário defend), adversário fica -1 Energia (esforço extra para receber).
**Sinergias:** Pressão — pressão energética além da pressão de poder.
**Estratégia Recomendada:** Drena a energia adversária. Em longo prazo, cria vantagem de recursos.

---

**Nome:** Saque de Linha
**Categoria:** Saque
**Nível:** Intermediário
**Descrição:** Bola rente à linha lateral — o ângulo mais difícil de receber.
**Efeito:** Poder 5. Custo 2. Taxa de erro: 19%. Defesa adversária -1.
**Sinergias:** Pressão + Potência — alto poder com reducer.
**Estratégia Recomendada:** Para partidas onde você quer força e pressão. Ligeiramente mais seguro que Saque Potente com efeito adicional.

---

## Avançado (5)

---

**Nome:** Saque Overhand Potente
**Categoria:** Saque
**Nível:** Avançado
**Descrição:** Saque por cima com força máxima. A bola mal é vista pelo receptor.
**Efeito:** Poder 7. Custo 3. Taxa de erro: 26%.
**Sinergias:** Potência pura — o maior poder de saque.
**Estratégia Recomendada:** Máxima pressão com máximo risco. Use em pontos decisivos onde aceitar erros em troca de aces.

---

**Nome:** Saque de Salto com Giro
**Categoria:** Saque
**Nível:** Avançado
**Descrição:** Combinação de salto e rotação do corpo. Trajetória completamente imprevisível.
**Efeito:** Poder 7. Custo 3. Taxa de erro: 24%. Defesa adversária -2.
**Sinergias:** Pressão + Leitura de Jogo — o saque avançado mais completo.
**Estratégia Recomendada:** O melhor saque em termos de pressão combinada. Alto poder + alto reducer.

---

**Nome:** Saque Ace
**Categoria:** Saque
**Nível:** Avançado
**Descrição:** O saque direto para ponto. Precisão e velocidade combinadas.
**Efeito:** Poder 8. Custo 3. Taxa de erro: 28%. Se aceito pelo adversário, defesa adversária -3.
**Sinergias:** Pressão — força máxima. Mesmo quando não gera ace, debuffa profundamente.
**Estratégia Recomendada:** A carta de maior poder de saque. Quando funciona, é ponto direto ou desorganização total da recepção adversária.

---

**Nome:** Saque de Alta Performance
**Categoria:** Saque
**Nível:** Avançado
**Descrição:** Técnica refinada: máximo poder sem abrir mão do controle.
**Efeito:** Poder 7. Custo 2. Taxa de erro: 22%. Defesa adversária -1. +1 Energia (eficiência técnica).
**Sinergias:** Potência + Resistência — o único saque avançado com recuperação de energia.
**Estratégia Recomendada:** Para builds que querem saques poderosos sem o custo energético alto. O melhor custo-benefício avançado.

---

**Nome:** Saque Definitivo
**Categoria:** Saque
**Nível:** Avançado
**Descrição:** O saque praticado 10.000 vezes. Na hora que importa, é perfeito.
**Efeito:** Poder 8. Custo 3. Taxa de erro: 20%. Defesa adversária -2.
**Sinergias:** Pressão + Potência — poder máximo com reducer sólido e risco controlado.
**Estratégia Recomendada:** A carta de saque mais equilibrada no nível avançado. 8 de poder com -2 reducer e "apenas" 20% de erro.

---

---

## Notas de Implementação

### Para codificar em data.js
Cada carta precisa de:
- `id`: sugestão de padrão `atk6`–`atk30`, `def7`–`def30`, etc.
- `level`: conforme indicado
- `type`: `'attack'` | `'defense'` | `'setting'` | `'block'` | `'service'`
- `phases`: `['attack']`, `['defense']`, `['setting']`, `['block']`, `['service']`
- `cost`, `power`: conforme descrito no Efeito
- `bonus`: implementar em `input.js:applyBonus()` se novo

### Efeitos condicionais (backlog)
Efeitos precedidos de "Se..." requerem motor de condicionais não implementado.
Ao implementar, criar sistema de triggers baseado em G state no momento do `playCard()`.

### Archetypes (backlog)
O campo `archetype` não existe no schema atual.
Adicionar como metadata para futura tela de deckbuilding.

### Taxa de erro de saque
Fórmula atual em `input.js`: `errorChance = 0.05 + (card.power * 0.03)`
- Poder 1 → 8%
- Poder 3 → 14%
- Poder 5 → 20%
- Poder 7 → 26%
- Poder 8 → 29%
