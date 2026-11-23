#!/usr/bin/env bash
# Setup multi-agente para o repo bingo-online.
# Rode na RAIZ do repositório: bash setup-bingo.sh
# Não sobrescreve arquivos existentes e não faz commit.

set -e

if [ ! -d .git ]; then
  echo "Erro: rode este script na raiz de um repositório git (pasta bingo-online)."
  exit 1
fi

# cria uma branch de trabalho se estiver na principal
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "master" ] || [ "$branch" = "main" ]; then
  git checkout -b setup-agentes
  echo "Branch criada: setup-agentes"
fi

write() {
  if [ -e "$1" ]; then
    echo "pulando  $1 (já existe)"
  else
    mkdir -p "$(dirname "$1")"
    cat > "$1"
    echo "criado   $1"
  fi
}

write AGENTS.md <<'EOF'
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
EOF

write CLAUDE.md <<'EOF'
# Claude Code

As instruções deste projeto estão em `AGENTS.md`. Leia e siga:

@AGENTS.md
EOF

write docs/PLAN.md <<'EOF'
# Plano

- [ ] 1. Ler o código e preencher os campos [?] do AGENTS.md (sem alterar código)
- [ ] 2. Mapear funções de lógica (gerar cartela, sortear, checar padrão) e listar bugs/riscos
- [ ] 3. Extrair a lógica para funções puras, sem mudar o comportamento
- [ ] 4. Adicionar testes automatizados para essas funções
- [ ] 5. Alinhar README e código sobre a faixa de números da cartela
- [ ] 6. Validar automaticamente os padrões de vitória (linha, coluna, diagonal, cantos)
- [ ] 7. (Opcional) Planejar versão multiplayer: só plano e alternativas, sem implementar
EOF

write docs/PROGRESS.md <<'EOF'
# Progresso (passagem de bastão entre ferramentas)

Atualize ao fim de cada sessão. O próximo agente começa lendo este arquivo.

## Feito
- Estrutura de agentes configurada (AGENTS.md, subagentes, plano).

## Em andamento
- (nada)

## Próximo passo
- Passo 1 do docs/PLAN.md.

## Decisões tomadas
- AGENTS.md é a fonte única de instruções; CLAUDE.md apenas aponta para ele.
EOF

write .opencode/agents/planejador.md <<'EOF'
---
description: Analisa o código e propõe planos e arquiteturas. Não edita arquivos.
mode: subagent
---
Você é o planejador deste projeto. Leia AGENTS.md e docs/PROGRESS.md antes de tudo.

Seu trabalho:
- Ler o código relevante e explicar como ele funciona.
- Propor um plano em passos pequenos e verificáveis, com os arquivos que seriam alterados.
- Apontar riscos, bugs prováveis e perguntas em aberto.

Regras:
- NÃO edite arquivos e NÃO rode comandos que alterem o projeto. Apenas leia e proponha.
- Termine sempre pedindo aprovação do plano.
EOF

write .opencode/agents/implementador.md <<'EOF'
---
description: Implementa UMA tarefa pequena aprovada do plano, com testes, e atualiza o PROGRESS.
mode: subagent
---
Você é o implementador deste projeto. Leia AGENTS.md e docs/PROGRESS.md antes de tudo.

Seu trabalho:
- Implementar apenas a tarefa aprovada que lhe foi passada, nada além dela.
- Manter o estilo do projeto (JS/CSS/HTML puros, sem dependências novas).
- Escrever ou ajustar testes para a lógica alterada e rodá-los, se existirem.
- Ao terminar, atualizar docs/PROGRESS.md e resumir o que mudou em poucas linhas.

Regras:
- Mudanças pequenas e focadas. Se a tarefa for grande demais, pare e peça para dividir.
- Não instale pacotes nem apague arquivos sem perguntar.
- Não faça commit: deixe o diff para o usuário revisar.
EOF

write .opencode/agents/revisor.md <<'EOF'
---
description: Revisa o diff atual procurando bugs, casos de borda e testes faltando. Não edita arquivos.
mode: subagent
---
Você é o revisor deste projeto. Leia AGENTS.md antes de tudo.

Seu trabalho:
- Analisar as mudanças atuais (`git diff` contra a branch principal).
- Procurar bugs, casos de borda (por exemplo, números repetidos, faixas erradas, cartelas inválidas),
  regressões, código desnecessário e testes faltando.
- Responder com uma lista priorizada: crítico, importante, sugestão. Cite arquivo e linha.

Regras:
- NÃO edite arquivos. Apenas reporte.
- Se não houver problemas, diga isso claramente em vez de inventar.
EOF

# lembrete sobre .DS_Store (já versionado neste repo)
if [ -e .gitignore ]; then
  grep -qx ".DS_Store" .gitignore || echo ".DS_Store" >> .gitignore
else
  printf ".DS_Store\n.env\n" > .gitignore
  echo "criado   .gitignore"
fi

echo
echo "Pronto. Revise com: git status"
echo "Dica: o .DS_Store já está versionado. Para parar de rastreá-lo: git rm --cached .DS_Store"
echo "Depois: git add -A && git commit -m 'setup de agentes'"
