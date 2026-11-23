// Página do sorteador (sorteador.html). Números em ordem de sorteio, 5 por
// linha; a posição é só visual e não limita o número.

(function () {
  'use strict';

  const POR_LINHA = 5;
  const btSortear = document.getElementById('sortear');
  const tabela = document.createElement('table');
  const sorteados = [];
  let linha = null;

  document.getElementById('cartela').append(tabela);

  function mostrarNumero(numero) {
    if (sorteados.length % POR_LINHA === 1) {
      linha = document.createElement('tr');
      tabela.append(linha);
    }
    const td = document.createElement('td');
    td.className = 'sorteado';
    td.textContent = numero;
    linha.append(td);
    td.scrollIntoView({ block: 'nearest' });
  }

  function sortear() {
    const numero = BingoLogica.sortearNumero(sorteados);
    if (numero === null) return;
    sorteados.push(numero);
    mostrarNumero(numero);
    btSortear.disabled = sorteados.length === 75;
  }

  btSortear.addEventListener('click', sortear);
})();
