# Progresso (passagem de bastão entre ferramentas)

Atualize ao fim de cada sessão. O próximo agente começa lendo este arquivo.

## Feito
- Estrutura de agentes configurada (AGENTS.md, subagentes, plano).
- 2026-11-23 — Passo 1 concluído — AGENTS.md preenchido (testes, faixa 1–75, status de vitória/sorteio/cartelas) e decisões de design da Fase 1 registradas. Nenhum código alterado.
- 2026-11-23 — Texto do cabeçalho e do status do sorteio revisados; `docs/PLAN.md` reordenado (testes antes da extração) e item 1 marcado.

## Em andamento
- (nada)

## Próximo passo
- Passo 2 do docs/PLAN.md: criar `tests/` com PRNG semeado e testes de caracterização de `gerarNumeroAleatorio` e `verificaPosicao`.

## Decisões tomadas
- AGENTS.md é a fonte única de instruções; CLAUDE.md apenas aponta para ele.
- 2026-11-23 — Sorteio uniforme de 1 a 75; núcleo em um dispositivo primeiro; fase 2 por semente na URL; Firebase apenas se o jogo for remoto.
- 2026-11-23 — Bugs de alta prioridade mapeados na análise: A1 sorteio limitado pela coluna da vez, A2 o 75 nunca aparece em cartela, A3 vitória não implementada, A4 apenas 1 cartela, A5 sorteador e cartela sem estado comum.
- 2026-11-23 — Marcação manual com validação no Bingo; centro livre conta como marcado; primeiro Bingo encerra a partida; 1 a 4 cartelas por jogador; sorteio por clique.
