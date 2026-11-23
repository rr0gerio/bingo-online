# Plano

> Ordem aprovada em 2026-11-23: testes antes da extração, para não haver regressão silenciosa.
> Contexto e decisões em `AGENTS.md` ("Decisões de design (Fase 1)").

## Fase 1 — núcleo em um dispositivo

- [x] 1. Ler o código e preencher os campos pendentes do AGENTS.md (sem alterar código)
- [x] 2. Criar `tests/` com PRNG semeado e testes de caracterização de `gerarNumeroAleatorio` e `verificaPosicao`
- [ ] 3. Extrair a lógica para funções puras em `src/js/logica.js`, sem mudar o comportamento
- [ ] 4. Corrigir A2: o 75 passa a existir nas cartelas
- [ ] 5. Corrigir A1/M1/M3: sorteio uniforme 1–75, laço em vez de recursão, typo `disable`
- [ ] 6. Implementar vitória (linha, coluna, diagonal, cantos), centro livre e botão Bingo validando
- [ ] 7. Suportar de 1 a 4 cartelas por jogador e "Nova partida"
- [ ] 8. Alinhar README/páginas/CSS e limpeza (DevTools, `#instrucoes`, `og:image`, faixa 1–75)

## Fase 2 — multiplayer (adiada)

- [ ] 9. Semente na URL + relógio: cada jogador no próprio celular, na mesma sala.
      Firebase é plano B apenas para jogo remoto.
