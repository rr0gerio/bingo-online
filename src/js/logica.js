// Lógica pura do Bingo, sem DOM.
// Script comum de propósito (sem import/export): funciona com <script src> ao
// abrir a página direto do arquivo (file://) e com require() nos testes.
// No navegador, use `BingoLogica.nomeDaFuncao(...)`.
//
// Partida: { cartelas: [{ numeros, marcados }], sorteados, vencedor }
// - numeros: matriz [linha][coluna] 5x5, com null no centro livre
// - marcados e sorteados: arrays de números
// - vencedor: null ou { cartela: indice, padrao }
// As funções não alteram a partida recebida; devolvem uma nova.

const BingoLogica = (function () {
  'use strict';

  const TAMANHO = 5;
  const NUMEROS_POR_COLUNA = 15;
  const MAX_NUMERO = 75;
  const MAX_CARTELAS = 4;
  const CENTRO = 2;

  /**
   * Inteiro aleatório em [1, range].
   * @param {number} range - máximo inclusivo (75 → 1..75)
   * @returns {number}
   */
  function gerarNumeroAleatorio(range) {
    return Math.floor(range * Math.random()) + 1;
  }

  function intervalo(min, max) {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  /** Escolhe `quantidade` itens distintos de `itens`, em ordem aleatória. */
  function escolherDistintos(itens, quantidade) {
    const restantes = itens.slice();
    return Array.from({ length: quantidade }, () =>
      restantes.splice(gerarNumeroAleatorio(restantes.length) - 1, 1)[0],
    );
  }

  /** Cartela 5x5 [linha][coluna]: 24 números nas faixas por coluna, centro null. */
  function criarCartela() {
    const colunas = intervalo(0, TAMANHO - 1).map((c) => {
      const min = c * NUMEROS_POR_COLUNA + 1;
      return escolherDistintos(intervalo(min, min + NUMEROS_POR_COLUNA - 1), TAMANHO);
    });
    const numeros = intervalo(0, TAMANHO - 1).map((l) => colunas.map((coluna) => coluna[l]));
    numeros[CENTRO][CENTRO] = null;
    return numeros;
  }

  /** Próximo número, uniforme entre os que faltam; null se acabaram. */
  function sortearNumero(sorteados) {
    const restantes = intervalo(1, MAX_NUMERO).filter((n) => !sorteados.includes(n));
    return restantes.length === 0 ? null : escolherDistintos(restantes, 1)[0];
  }

  /** Lista de padrões de vitória, cada um com suas posições [linha, coluna]. */
  function listarPadroes() {
    const indices = intervalo(0, TAMANHO - 1);
    const fim = TAMANHO - 1;
    return [
      ...indices.map((l) => ({ tipo: 'linha', numero: l + 1, posicoes: indices.map((c) => [l, c]) })),
      ...indices.map((c) => ({ tipo: 'coluna', numero: c + 1, posicoes: indices.map((l) => [l, c]) })),
      { tipo: 'diagonal', numero: 1, posicoes: indices.map((i) => [i, i]) },
      { tipo: 'diagonal', numero: 2, posicoes: indices.map((i) => [i, fim - i]) },
      { tipo: 'cantos', numero: 1, posicoes: [[0, 0], [0, fim], [fim, 0], [fim, fim]] },
    ];
  }

  /**
   * Primeiro padrão completo, ou null. Uma casa vale se for o centro livre ou
   * se o número foi marcado pelo jogador E realmente sorteado.
   */
  function verificarVencedor(numeros, marcados, sorteados) {
    const casaVale = ([l, c]) => {
      const numero = numeros[l][c];
      return numero === null || (marcados.includes(numero) && sorteados.includes(numero));
    };
    return listarPadroes().find((padrao) => padrao.posicoes.every(casaVale)) || null;
  }

  /** Partida nova, com cartelas novas. Serve também para "Nova partida". */
  function criarPartida(quantidade) {
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_CARTELAS) {
      throw new RangeError(`A quantidade de cartelas deve ser de 1 a ${MAX_CARTELAS}.`);
    }
    return {
      cartelas: Array.from({ length: quantidade }, () => ({ numeros: criarCartela(), marcados: [] })),
      sorteados: [],
      vencedor: null,
    };
  }

  /** Sorteia o próximo número. Sem efeito após o fim ou depois dos 75. */
  function sortear(partida) {
    if (partida.vencedor) return partida;
    const numero = sortearNumero(partida.sorteados);
    if (numero === null) return partida;
    return { ...partida, sorteados: [...partida.sorteados, numero] };
  }

  /** Marca ou desmarca um número. O sorteio só é conferido no Bingo. */
  function alternarMarcacao(partida, indice, numero) {
    const alvo = partida.cartelas[indice];
    if (partida.vencedor || !alvo) return partida;
    if (numero === null || !alvo.numeros.flat().includes(numero)) return partida;

    const marcados = alvo.marcados.includes(numero)
      ? alvo.marcados.filter((n) => n !== numero)
      : [...alvo.marcados, numero];
    const cartelas = partida.cartelas.map((c, i) => (i === indice ? { ...c, marcados } : c));
    return { ...partida, cartelas };
  }

  /** Valida o Bingo da cartela; se valer, encerra a partida. */
  function cantarBingo(partida, indice) {
    const alvo = partida.cartelas[indice];
    if (partida.vencedor || !alvo) return partida;
    const padrao = verificarVencedor(alvo.numeros, alvo.marcados, partida.sorteados);
    return padrao ? { ...partida, vencedor: { cartela: indice, padrao } } : partida;
  }

  return {
    gerarNumeroAleatorio,
    criarCartela,
    sortearNumero,
    verificarVencedor,
    criarPartida,
    sortear,
    alternarMarcacao,
    cantarBingo,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BingoLogica;
}
