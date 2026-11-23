// Lógica pura do Bingo, sem DOM.
// Script comum de propósito (sem import/export): funciona com <script src> ao
// abrir a página direto do arquivo (file://) e com require() nos testes.
// No navegador, use `BingoLogica.nomeDaFuncao(...)`.
//
// - numeros (cartela): matriz [linha][coluna] 5x5, com null no centro livre
// - marcados e sorteados: arrays de números
// As funções não alteram o que recebem.

const BingoLogica = (function () {
  'use strict';

  const TAMANHO = 5;
  const NUMEROS_POR_COLUNA = 15;
  const MAX_NUMERO = 75;
  const MAX_CARTELAS = 4;
  const CENTRO = 2;
  const LETRAS = ['B', 'I', 'N', 'G', 'O'];
  // Sem 0/O e 1/I/L, que se confundem ao ditar. 31 é primo: o verificador pega
  // qualquer caractere trocado e quaisquer dois invertidos.
  const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const TAMANHO_CODIGO = 5; // 4 de identificação + 1 verificador
  const NOME_DIAGONAL = { 1: 'diagonal principal', 2: 'diagonal secundária' };
  const LETRAS_FALADAS = { B: 'Bê', I: 'I', N: 'Ene', G: 'Gê', O: 'Ó' };

  /**
   * Inteiro aleatório em [1, range].
   * @param {number} range - máximo inclusivo (75 → 1..75)
   * @param {function} rng - gerador em [0, 1)
   * @returns {number}
   */
  function gerarNumeroAleatorio(range, rng = Math.random) {
    return Math.floor(range * rng()) + 1;
  }

  function intervalo(min, max) {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  /** Escolhe `quantidade` itens distintos de `itens`, em ordem aleatória. */
  function escolherDistintos(itens, quantidade, rng = Math.random) {
    const restantes = itens.slice();
    return Array.from({ length: quantidade }, () =>
      restantes.splice(gerarNumeroAleatorio(restantes.length, rng) - 1, 1)[0],
    );
  }

  /** Cartela 5x5 [linha][coluna]: 24 números nas faixas por coluna, centro null. */
  function criarCartela(rng = Math.random) {
    const colunas = intervalo(0, TAMANHO - 1).map((c) => {
      const min = c * NUMEROS_POR_COLUNA + 1;
      return escolherDistintos(intervalo(min, min + NUMEROS_POR_COLUNA - 1), TAMANHO, rng);
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

  /** Letra da coluna do número (1–15 B, 16–30 I, ...); null fora de 1 a 75. */
  function letraDoNumero(numero) {
    if (!Number.isInteger(numero) || numero < 1 || numero > MAX_NUMERO) return null;
    return LETRAS[Math.floor((numero - 1) / NUMEROS_POR_COLUNA)];
  }

  /** Texto para a voz cantar o número, com a letra por extenso. */
  function textoParaCantar(numero) {
    const letra = letraDoNumero(numero);
    return letra === null ? '' : `${LETRAS_FALADAS[letra]}, ${numero}`;
  }

  /** Índice de cor (0..quantidade-1) de cada um dos 75 números, sortido e equilibrado. */
  function sortearCores(quantidade) {
    const cores = intervalo(0, MAX_NUMERO - 1).map((i) => i % quantidade);
    return escolherDistintos(cores, cores.length);
  }

  /** Quanto falta para o próximo sorteio automático; 0 se o intervalo já passou. */
  function esperaRestante(intervaloMs, decorridoMs) {
    return Math.max(0, intervaloMs - decorridoMs);
  }

  /**
   * Confere um sorteio salvo no navegador. Devolve { sorteados, cores } ou
   * null se algo estiver faltando, repetido ou fora da faixa.
   */
  function restaurarSorteio(dados, quantidadeDeCores) {
    if (!dados || !Array.isArray(dados.sorteados) || !Array.isArray(dados.cores)) return null;
    const { sorteados, cores } = dados;
    const numerosValidos = sorteados.every((n) => letraDoNumero(n) !== null)
      && new Set(sorteados).size === sorteados.length;
    const coresValidas = cores.length === MAX_NUMERO
      && cores.every((c) => Number.isInteger(c) && c >= 0 && c < quantidadeDeCores);
    return numerosValidos && coresValidas ? { sorteados: [...sorteados], cores: [...cores] } : null;
  }

  // ---------- Código da cartela ----------

  /** Gerador determinístico (mulberry32): mesma semente, mesma sequência. */
  function criarGerador(semente) {
    let a = semente >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function verificador(indices) {
    return ALFABETO[indices.reduce((soma, valor, i) => soma + valor * (i + 2), 0) % ALFABETO.length];
  }

  /** Código em maiúsculas, sem espaços nem hífens; null se não for válido. */
  function normalizarCodigo(texto) {
    if (typeof texto !== 'string') return null;
    const codigo = texto.toUpperCase().replace(/[\s-]/g, '');
    const indices = [...codigo].map((c) => ALFABETO.indexOf(c));
    if (indices.length !== TAMANHO_CODIGO || indices.includes(-1)) return null;
    return verificador(indices.slice(0, -1)) === codigo[TAMANHO_CODIGO - 1] ? codigo : null;
  }

  /** Código novo, diferente dos já usados pelo jogador. */
  function criarCodigo(usados = []) {
    const indices = Array.from({ length: TAMANHO_CODIGO - 1 }, () => gerarNumeroAleatorio(ALFABETO.length) - 1);
    const codigo = indices.map((i) => ALFABETO[i]).join('') + verificador(indices);
    return usados.includes(codigo) ? criarCodigo(usados) : codigo;
  }

  /** Cartela do código, igual em qualquer aparelho; null se o código não valer. */
  function cartelaDoCodigo(texto) {
    const codigo = normalizarCodigo(texto);
    if (codigo === null) return null;
    const semente = [...codigo].reduce((total, c) => total * ALFABETO.length + ALFABETO.indexOf(c), 0);
    return criarCartela(criarGerador(Math.imul(semente, 0x9e3779b1)));
  }

  /**
   * Confere um Bingo cantado: recria a cartela e olha só os números sorteados
   * (o que foi marcado no celular não chega aqui). null se o código não valer.
   */
  function conferirCodigo(texto, sorteados) {
    const numeros = cartelaDoCodigo(texto);
    if (numeros === null) return null;
    return {
      codigo: normalizarCodigo(texto),
      numeros,
      padrao: verificarVencedor(numeros, numeros.flat(), sorteados),
    };
  }

  /** Confere as cartelas salvas no celular; null se algo não bater. */
  function restaurarCartelas(dados) {
    if (!Array.isArray(dados) || dados.length > MAX_CARTELAS) return null;
    const cartelas = dados.map((item) => {
      const numeros = item ? cartelaDoCodigo(item.codigo) : null;
      if (numeros === null || !Array.isArray(item.marcados)) return null;
      const daCartela = numeros.flat().filter((n) => n !== null);
      return {
        codigo: normalizarCodigo(item.codigo),
        numeros,
        marcados: daCartela.filter((n) => item.marcados.includes(n)),
      };
    });
    if (cartelas.includes(null)) return null;
    return new Set(cartelas.map((c) => c.codigo)).size === cartelas.length ? cartelas : null;
  }

  function descreverPadrao({ tipo, numero }) {
    if (tipo === 'cantos') return 'quatro cantos';
    return tipo === 'diagonal' ? NOME_DIAGONAL[numero] : `${tipo} ${numero}`;
  }

  return {
    criarCodigo,
    cartelaDoCodigo,
    conferirCodigo,
    restaurarCartelas,
    descreverPadrao,
    restaurarSorteio,
    letraDoNumero,
    textoParaCantar,
    sortearCores,
    esperaRestante,
    gerarNumeroAleatorio,
    criarCartela,
    sortearNumero,
    verificarVencedor,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BingoLogica;
}
