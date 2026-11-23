# Plano

> Ordem aprovada em 2026-11-23: testes antes da extração, para não haver regressão silenciosa.
> Contexto e decisões em `AGENTS.md` ("Decisões de design (Fase 1)").

## Fase 1 — núcleo em um dispositivo

- [x] 1. Ler o código e preencher os campos pendentes do AGENTS.md (sem alterar código)
- [x] 2. Criar `tests/` com PRNG semeado e testes de caracterização de `gerarNumeroAleatorio` e `verificaPosicao`
- [x] 3. Extrair a lógica para funções puras em `src/js/logica.js`, sem mudar o comportamento
- [x] 4. Corrigir bugs A1 e A2: `gerarNumeroAleatorio(range)` agora devolve [1, range] (antes [0, range)); 75 possível
- [x] 5. Implementar interface de jogo (botão Bingo, marcação manual, vitória/centro livre, 1–4 cartelas, nova partida) — `jogo.html`, removido em 2026-11-23 com a chegada do painel
- [x] 6. Alinhar README/páginas/CSS e limpeza (DevTools, `#instrucoes`, `og:image`, faixa 1–75)
- [x] 7. Manter testes de caracterização como regressão (`verificaPosicao` removida em 2026-11-23, sem uso)

## Fase 2 — multiplayer (em andamento, branch `multiplayer`)

- [x] Painel da TV: quadro por letra, animações, automático e voz — `painel.html`
- [x] 8. Cada jogador no próprio celular, na mesma sala: código por cartela, conferido no painel (substitui semente na URL + relógio).
      Firebase é plano B apenas para jogo remoto.
