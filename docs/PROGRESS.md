# Progresso (passagem de bastão entre ferramentas)

Atualize ao fim de cada sessão. O próximo agente começa lendo este arquivo.

## Feito
- Estrutura de agentes configurada (AGENTS.md, subagentes, plano).
- 2026-11-23 — Passo 1 concluído — AGENTS.md preenchido (testes, faixa 1–75, status de vitória/sorteio/cartelas) e decisões de design da Fase 1 registradas. Nenhum código alterado.
- 2026-11-23 — Texto do cabeçalho e do status do sorteio revisados; `docs/PLAN.md` reordenado (testes antes da extração) e item 1 marcado.
- 2026-11-23 — Passo 2 concluído — `tests/` criado com `node:test`, zero dependências: `helpers.js` (carrega `src/js/main.js` via `node:vm` + stub de `document`, PRNG mulberry32 semeado e `comMathRandom`) e `main.test.js` (9 testes de caracterização de `verificaPosicao` e `gerarNumeroAleatorio`). Rodar com `node --test tests/`. A1 e A2 ficam travados NA ORIGEM (ciclo de `verificaPosicao` e teto de `gerarNumeroAleatorio(75)`); os chamadores (`sorteador.js`/`gerarCartela.js`) passam a ter teste nos passos 4 e 5. `src/` intocado.
- 2026-11-23 — Passo 3 concluído — lógica extraída para `src/js/logica.js` (funções puras `verificaPosicao` e `gerarNumeroAleatorio`); `tests/helpers.js` passou a usar `require('../src/js/logica.js')` em vez de `node:vm`; todos os 9 testes de caracterização continuam passando idênticos em ambas as execuções.
- 2026-11-23 — `src/js/logica.js` virou script comum (global `BingoLogica` no navegador, `require` nos testes), sem `import`/`export`, para abrir via `file://` e rodar no Node 18. Novo `tests/logica.carregamento.test.js` (3 testes); 12 testes passando.
- 2026-11-23 — Regras do jogo em `src/js/logica.js` (cartela, sorteio, marcação, vitória, partida de 1 a 4 cartelas), com `tests/logica.test.js`; 43 testes passando. Marcar número não sorteado é permitido; o botão Bingo é que valida. Nenhuma página usa essas funções ainda.
- 2026-11-23 — Interface da partida: `src/pages/jogo.html` e `src/js/jogo.js` reescritos sobre `BingoLogica` (Sortear, chamados, marcação, Bingo por cartela, 1 a 4 cartelas, nova partida). Partida jogada até o fim no Chrome headless via `file://`, sem erros no console; esse roteiro não está no repositório.
- 2026-11-23 — Páginas antigas: `gerarCartela.js` e `sorteador.js` reescritos sobre `BingoLogica` (cartela: 1 a 4, marca/desmarca; sorteador: 75 sem repetir). Funções antigas removidas de `main.js`. Links locais em todas as páginas e "Nova partida" no `index.html`. Layout-base do `master.css` refeito (sem sobreposição, funciona em 390 px). Novo `tests/paginas.test.js`; 51 testes passando; conferido no Chrome via `file://`.
- 2026-11-23 — Ferramentas: skills `design-taste-frontend`, `web-design-guidelines` e `image-to-code` em `.claude/skills/` (ignoradas no git; versões em `skills-lock.json`); `@playwright/cli` 0.1.25 global na máquina.
- 2026-11-23 — Passo 6 concluído: `lang`, `og:url`/`og:image`, instruções visíveis em `cartela.html`, README e `AGENTS.md` atualizados; bloqueio de DevTools desligado (`main.js` apagado, com autorização).
- 2026-11-23 — Visual de `master.css` e `jogo.html` inspirado no DESIGN.md do Notion (espaçamento, bordas, tipografia), mantendo o roxo, a Montserrat e o logo. 51 testes passando; conferido no Chrome em 1440 e 390 px.
- 2026-11-23 — Identidade nova e única: nome "Bingo", coral, creme, grade de lanchonete retrô, Titan One e Roboto. Removido tudo de Sec4U. Imagens próprias: `bingo.svg`, `icone.svg` e `compartilhar.png`. Inspiração só em cores e clima, sem elementos de marcas de terceiros (sem autorização).
- 2026-11-23 — PRs 1 e 2 (`setup-agentes`) mesclados na `master`. Limpeza na branch `multiplayer`: `src/.DS_Store` fora do git, comentários e imports obsoletos removidos de `tests/helpers.js` e `tests/main.test.js`; 55 testes passando.
- 2026-11-23 — Limpeza autorizada: `setup-bingo.sh`, branch `setup-agentes` (local e remota) e `verificaPosicao` (com 3 testes) removidos.
- 2026-11-23 — Painel da TV: `src/pages/painel.html`, `src/css/painel.css`, `src/js/painel.js` e `src/js/globo.js`; funções novas em `logica.js` com `tests/logica.painel.test.js`; 63 testes passando. Conferido no Chrome headless via `file://` (1280 a 3840 px e 390 px, rodada de 75, automático, nova rodada). Som real da voz e TV física ainda não testados.
- 2026-11-23 — Painel revisado: layout em uma unidade (`--u`, tela = 160 x 90), bolas e textos centralizados, tudo menor. Rodada e preferências salvas em `localStorage` (`restaurarSorteio` confere os dados). `sorteador.html` e `sorteador.js` removidos, com autorização. 64 testes passando; conferido no Chrome headless de 320 a 3840 px.
- 2026-11-23 — Sala: código da cartela e conferência em `logica.js` (`tests/logica.codigo.test.js`); `cartela.html` mostra o código, salva marcações e tem "Nova rodada"; painel com "Conferir Bingo" (pausa o automático; o primeiro Bingo válido encerra a rodada). 82 testes passando; fluxo completo conferido no Chrome headless com celular e TV em contextos separados.
- 2026-11-23 — Removida, com autorização, a partida em um só dispositivo (`jogo.html`, `jogo.js`, `criarPartida`, `sortear`, `alternarMarcacao`, `cantarBingo` e testes). Menu com "Pegar minhas cartelas" e "Abrir painel da TV".
- 2026-11-23 — PR 3 mesclado. Revisão com os verificadores da skill `design-taste-frontend`: contraste do quadro e do contador, alvos de 44 px, quadro sem pulo ao abrir, descrição e `twitter:card`, formulário sem função removido. As demais falhas são regras de landing page, que não se aplicam ao jogo.

## Em andamento
- Branch `ajustes-acessibilidade`, PR para a `master`; falta teste com TV e celulares de verdade.
- A skill de geração de imagem do usuário não ficou pronta; `bingo.svg` segue como ilustração.

## Próximo passo
- Testar na TV (voz e tamanho) e em celulares; mesclar o PR.
- Limite conhecido: um jogador pode gerar cartela nova no meio da rodada e o painel a aceita.

## Decisões tomadas
- AGENTS.md é a fonte única de instruções; CLAUDE.md apenas aponta para ele.
- 2026-11-23 — Sorteio uniforme de 1 a 75; núcleo em um dispositivo primeiro; fase 2 por semente na URL; Firebase apenas se o jogo for remoto.
- 2026-11-23 — Bugs de alta prioridade mapeados na análise: A1 sorteio limitado pela coluna da vez, A2 o 75 nunca aparece em cartela, A3 vitória não implementada, A4 apenas 1 cartela, A5 sorteador e cartela sem estado comum.
- 2026-11-23 — Marcação manual com validação no Bingo; centro livre conta como marcado; primeiro Bingo encerra a partida; 1 a 4 cartelas por jogador; sorteio por clique.
