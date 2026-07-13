# agents/

Relatórios gerados por agentes de análise (subagentes do Claude Code) invocados durante o
desenvolvimento deste projeto — auditorias de design, balanceamento, estatística, revisões
especializadas, etc.

Cada arquivo é um documento independente e datado. Não são atualizados automaticamente; se uma
auditoria for refeita, crie um novo arquivo (não sobrescreva o anterior) para preservar o histórico
de decisões.

## Índice

| Arquivo | Data | Escopo |
|---|---|---|
| [probability-audit.md](probability-audit.md) | 2026-07-13 | Auditoria de todos os pontos de `Math.random()` do jogo: probabilidades efetivas de ponto, inconsistências de fórmula, impacto das passivas das duplas, taxa de sucesso do tag-combo |
| [final-review-2026-07-13.md](final-review-2026-07-13.md) | 2026-07-13 | Revisão final completa: 5 bugs corrigidos (deck sem combos, IA sem levantamento, IA com cartas locked, desconto ignorado na defesa, IA não-aleatória), avaliação de arquitetura/docs, observações de balance e playtest manual no browser |
