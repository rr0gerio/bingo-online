# Instruções do projeto: Bingo Online

> Fonte única de instruções para todos os agentes (OpenCode, Cline, Antigravity, Claude Code).
> Campos pendentes preenchidos em 2026-11-23 — ver "Decisões de design (Fase 1)".

## Objetivo
Bingo online recreativo para jogar entre amigos. Gera cartelas (24 números, espaço central livre)
e sorteia números aleatoriamente. O jogador escolhe até 4 cartelas por partida.

## Stack
- HTML, CSS e JavaScript puros (sem framework, sem build).
- Arquivos principais: `index.html` e a pasta `src/`.
- Testes: `tests/` criado com o runner nativo (`node:test`), zero dependências — `main.test.js` e `logica*.test.js` cobrem `src/js/logica.js`; `paginas.test.js` confere scripts e links das páginas.

## Como rodar
- Abrir `index.html` no navegador (ou usar um servidor estático simples, se necessário).
- Rodar testes: `node --test tests/` (Node 18.8+). Rode antes e depois de qualquer refatoração.

## Regras do jogo (resumo)
- Cartela: grade 5x5, 24 números, centro livre.
- Faixa de números: 1 a 75, em 5 colunas de 15 (1–15, 16–30, 31–45, 46–60, 61–75). O zero é explicitamente rejeitado.
- Padrões de vitória: linha, coluna, diagonal e quatro cantos; o centro livre conta como marcado. Implementado em `BingoLogica.verificarVencedor`.
- Sorteio uniforme de 1 a 75, sem repetir número. Manual, por clique em "Sortear"; no painel da TV (`src/pages/painel.html`) pode ser também automático, de 5 a 30 s.

## Decisões de design (Fase 1)
- Sorteio uniforme de 1 a 75. A cartela usa faixas por coluna; o sorteio não.
- Marcação manual; o botão "Bingo" valida o padrão contra os números realmente sorteados.
- Centro livre conta como marcado em linha, coluna e diagonais.
- O primeiro que cantar Bingo encerra a partida; "Nova partida" reinicia.
- Cada jogador pode usar de 1 a 4 cartelas.
- Sorteio por clique, sem timer, na partida em um só dispositivo. O painel da TV tem modo automático e voz (Web Speech API), ambos liga/desliga.
- Lógica pura em `src/js/logica.js`, testada com `node --test`, sem dependências.
- Fase 2 (adiada): cada jogador no próprio celular, na mesma sala, via semente na URL + relógio. Firebase é plano B apenas para jogo remoto.

## Convenções
- Simplicidade primeiro: manter JS/CSS/HTML puros, sem dependências novas sem perguntar.
- Funções pequenas e com nomes claros; lógica do jogo separada da manipulação do DOM.
- Todo código novo de lógica vem com teste.

## Regras de trabalho
- Uma tarefa pequena por vez; verificar antes de seguir.
- Mostrar o plano e esperar aprovação antes de mudanças grandes.
- Não instalar pacotes nem apagar arquivos sem perguntar.
- Nunca colocar segredos no código.
- Commits pequenos, com mensagem clara, sempre fora da branch principal.
- Ao fim da sessão, atualizar `docs/PROGRESS.md`.
