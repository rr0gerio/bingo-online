# Progresso (passagem de bastão entre ferramentas)

Atualize ao fim de cada sessão. O próximo agente começa lendo este arquivo.

## Feito
- Estrutura de agentes configurada (AGENTS.md, subagentes, plano).
- 2026-11-23 — Passo 1 concluído — AGENTS.md preenchido (testes, faixa 1–75, status de vitória/sorteio/cartelas) e decisões de design da Fase 1 registradas. Nenhum código alterado.
- 2026-11-23 — Texto do cabeçalho e do status do sorteio revisados; `docs/PLAN.md` reordenado (testes antes da extração) e item 1 marcado.
- 2026-11-23 — Passo 2 concluído — `tests/` criado com `node:test`, zero dependências: `helpers.js` (carrega `src/js/main.js` via `node:vm` + stub de `document`, PRNG mulberry32 semeado e `comMathRandom`) e `main.test.js` (9 testes de caracterização de `verificaPosicao` e `gerarNumeroAleatorio`). Rodar com `node --test tests/`. A1 e A2 ficam travados NA ORIGEM (ciclo de `verificaPosicao` e teto de `gerarNumeroAleatorio(75)`); os chamadores (`sorteador.js`/`gerarCartela.js`) passam a ter teste nos passos 4 e 5. `src/` intocado.
- 2026-11-23 — Passo 3 concluído — lógica extraída para `src/js/logica.js` (funções puras `verificaPosicao` e `gerarNumeroAleatorio`); `tests/helpers.js` passou a usar `require('../src/js/logica.js')` em vez de `node:vm`; todos os 9 testes de caracterização continuam passando idênticos em ambas as execuções.

## Em andamento
- (nada)

## Próximo passo
- Passo 3 do docs/PLAN.md: extrair a lógica para funções puras em `src/js/logica.js` sem mudar o comportamento; trocar `carregarMain()` por `require('../src/js/logica.js')` em `tests/helpers.js`, mantendo os testes.

## Decisões tomadas
- AGENTS.md é a fonte única de instruções; CLAUDE.md apenas aponta para ele.
- 2026-11-23 — Sorteio uniforme de 1 a 75; núcleo em um dispositivo primeiro; fase 2 por semente na URL; Firebase apenas se o jogo for remoto.
- 2026-11-23 — Bugs de alta prioridade mapeados na análise: A1 sorteio limitado pela coluna da vez, A2 o 75 nunca aparece em cartela, A3 vitória não implementada, A4 apenas 1 cartela, A5 sorteador e cartela sem estado comum.
- 2026-11-23 — Marcação manual com validação no Bingo; centro livre conta como marcado; primeiro Bingo encerra a partida; 1 a 4 cartelas por jogador; sorteio por clique.
