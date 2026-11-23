# Instruções do projeto: Bingo Online

> Fonte única de instruções para todos os agentes (OpenCode, Cline, Antigravity, Claude Code).
> Complete os campos marcados com [?] na primeira sessão: peça ao agente para ler o código e preencher.

## Objetivo
Bingo online recreativo para jogar entre amigos. Gera cartelas (24 números, espaço central livre)
e sorteia números aleatoriamente. O jogador escolhe até 4 cartelas por partida.

## Stack
- HTML, CSS e JavaScript puros (sem framework, sem build).
- Arquivos principais: `index.html` e a pasta `src/`.
- Testes: [?] ainda não existem.

## Como rodar
- Abrir `index.html` no navegador (ou usar um servidor estático simples, se necessário).
- Rodar testes: [?] definir quando existirem.

## Regras do jogo (resumo)
- Cartela: grade 5x5, 24 números, centro livre.
- Faixa de números: [?] o README é inconsistente (0 a 75 vs 1 a 74). Verificar o que o código faz.
- Padrões de vitória: linha, coluna, diagonal e quatro cantos.
- Sorteio automático, sem repetir número.

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
