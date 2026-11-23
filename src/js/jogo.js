// Interface da partida (jogo.html). As regras ficam em logica.js; aqui só há
// leitura de cliques e atualização da página.

(function () {
  'use strict';

  const LETRAS = ['B', 'I', 'N', 'G', 'O'];

  const elMensagem = document.getElementById('mensagem');
  const elUltimo = document.getElementById('ultimo');
  const elChamados = document.getElementById('chamados');
  const elCartelas = document.getElementById('cartelas');
  const btSortear = document.getElementById('sortear');

  let partida = null;

  function mostrarMensagem(texto, classe = '') {
    elMensagem.textContent = texto;
    elMensagem.className = classe;
  }

  function criarElemento(tag, propriedades = {}) {
    return Object.assign(document.createElement(tag), propriedades);
  }

  function criarCasa(numero, indice) {
    const td = criarElemento('td');
    if (numero === null) {
      td.className = 'central';
      td.setAttribute('aria-label', 'Centro livre');
      return td;
    }
    const botao = criarElemento('button', { type: 'button', textContent: numero });
    botao.addEventListener('click', () => {
      partida = BingoLogica.alternarMarcacao(partida, indice, numero);
      atualizar();
    });
    td.append(botao);
    return td;
  }

  function criarTabela(numeros, indice) {
    const tabela = criarElemento('table');
    const cabecalho = criarElemento('tr');
    cabecalho.append(...LETRAS.map((letra) => criarElemento('th', { textContent: letra, scope: 'col' })));
    tabela.append(cabecalho);
    numeros.forEach((linha) => {
      const tr = criarElemento('tr');
      tr.append(...linha.map((numero) => criarCasa(numero, indice)));
      tabela.append(tr);
    });
    return tabela;
  }

  function desenharCartelas() {
    elCartelas.replaceChildren(
      ...partida.cartelas.map(({ numeros }, indice) => {
        const artigo = criarElemento('article');
        const bingo = criarElemento('button', {
          type: 'button',
          className: 'menu-button primario bingo',
          textContent: 'Bingo!',
        });
        bingo.setAttribute('aria-label', `Bingo na cartela ${indice + 1}`);
        bingo.addEventListener('click', () => cantarBingo(indice));
        artigo.append(
          criarElemento('h2', { textContent: `Cartela ${indice + 1}` }),
          criarTabela(numeros, indice),
          bingo,
        );
        return artigo;
      }),
    );
  }

  function atualizarCartela(artigo, indice) {
    const { numeros, marcados } = partida.cartelas[indice];
    const venceu = partida.vencedor && partida.vencedor.cartela === indice;
    const posicoes = venceu ? partida.vencedor.padrao.posicoes : [];

    artigo.querySelectorAll('td').forEach((td, i) => {
      const linha = Math.floor(i / 5);
      const coluna = i % 5;
      const marcado = marcados.includes(numeros[linha][coluna]);
      td.classList.toggle('marked', marcado);
      td.classList.toggle('padrao', posicoes.some(([l, c]) => l === linha && c === coluna));
      const botao = td.querySelector('button');
      if (botao) {
        botao.setAttribute('aria-pressed', String(marcado));
        botao.disabled = Boolean(partida.vencedor);
      }
    });
    artigo.querySelector('.bingo').disabled = Boolean(partida.vencedor);
  }

  function atualizar() {
    const { sorteados } = partida;
    elUltimo.textContent = sorteados.length ? sorteados[sorteados.length - 1] : '–';
    elChamados.replaceChildren(...sorteados.map((n) => criarElemento('li', { textContent: n })));
    btSortear.disabled = Boolean(partida.vencedor) || sorteados.length === 75;
    [...elCartelas.children].forEach(atualizarCartela);
  }

  function novaPartida() {
    const escolhida = document.querySelector('input[name="quantidade"]:checked');
    partida = BingoLogica.criarPartida(Number(escolhida.value));
    desenharCartelas();
    atualizar();
    mostrarMensagem('Partida iniciada. Clique em "Sortear" e marque os números chamados.');
  }

  function sortear() {
    partida = BingoLogica.sortear(partida);
    const { sorteados } = partida;
    const aviso = sorteados.length === 75 ? ' Todos os números já saíram.' : '';
    mostrarMensagem(`Número sorteado: ${sorteados[sorteados.length - 1]}.${aviso}`);
    atualizar();
  }

  function cantarBingo(indice) {
    partida = BingoLogica.cantarBingo(partida, indice);
    if (partida.vencedor) {
      const padrao = BingoLogica.descreverPadrao(partida.vencedor.padrao);
      mostrarMensagem(`BINGO! A cartela ${indice + 1} venceu com ${padrao}.`, 'vitoria');
    } else {
      mostrarMensagem(
        `Ainda não é Bingo na cartela ${indice + 1}: falta marcar ou sortear algum número do padrão.`,
        'erro',
      );
    }
    atualizar();
  }

  document.getElementById('nova-partida').addEventListener('click', novaPartida);
  btSortear.addEventListener('click', sortear);
})();
