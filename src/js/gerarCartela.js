// Página do participante (cartela.html). As cartelas vêm de logica.js; a
// conferência do Bingo é feita pelas pessoas, pois o sorteio é em outra página.

(function () {
  'use strict';

  const LETRAS = ['B', 'I', 'N', 'G', 'O'];
  const MAX_CARTELAS = 4;

  const elCartelas = document.getElementById('cartela');
  const btGerar = document.getElementById('gerar');

  function criarElemento(tag, propriedades = {}) {
    return Object.assign(document.createElement(tag), propriedades);
  }

  function criarCasa(numero) {
    const td = criarElemento('td');
    if (numero === null) {
      td.className = 'central';
      td.setAttribute('aria-label', 'Centro livre');
      return td;
    }
    const botao = criarElemento('button', { type: 'button', textContent: numero });
    botao.setAttribute('aria-pressed', 'false');
    botao.addEventListener('click', () => {
      const marcado = td.classList.toggle('marked');
      botao.setAttribute('aria-pressed', String(marcado));
    });
    td.append(botao);
    return td;
  }

  function criarTabela(numeros) {
    const tabela = criarElemento('table');
    const cabecalho = criarElemento('tr');
    cabecalho.append(...LETRAS.map((letra) => criarElemento('th', { textContent: letra, scope: 'col' })));
    tabela.append(cabecalho);
    numeros.forEach((linha) => {
      const tr = criarElemento('tr');
      tr.append(...linha.map(criarCasa));
      tabela.append(tr);
    });
    return tabela;
  }

  function gerarCartela() {
    if (elCartelas.children.length >= MAX_CARTELAS) return;
    elCartelas.append(criarTabela(BingoLogica.criarCartela()));
    btGerar.value = 'Mais uma cartela';
    btGerar.disabled = elCartelas.children.length >= MAX_CARTELAS;
  }

  btGerar.addEventListener('click', gerarCartela);
})();
