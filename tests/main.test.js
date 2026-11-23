'use strict';

/**
 * Testes de regressão das funções básicas de `src/js/logica.js`
 * (`verificaPosicao` e `gerarNumeroAleatorio`).
 */

const { describe, test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregarMain, criarRng, comMathRandom } = require('./helpers');

const main = carregarMain();
const mathRandomOriginal = Math.random;

afterEach(() => {
  assert.equal(
    Math.random,
    mathRandomOriginal,
    'Math.random deve ser restaurado ao fim de cada teste',
  );
});

describe('verificaPosicao (caracterização)', () => {
  // Tabela escrita de forma explícita: cinco linhas de 1..5, como na cartela.
  const colunasDaCartela = [
    1, 2, 3, 4, 5,
    1, 2, 3, 4, 5,
    1, 2, 3, 4, 5,
    1, 2, 3, 4, 5,
    1, 2, 3, 4, 5,
  ];

  test('devolve a coluna 1..5 em ciclo para as 25 posições da cartela', () => {
    const observado = colunasDaCartela.map((_, indice) => main.verificaPosicao(indice));
    assert.deepEqual(observado, colunasDaCartela);
  });

  test('o ciclo continua além da cartela (25 -> 1, 29 -> 5)', () => {
    assert.equal(main.verificaPosicao(25), 1);
    assert.equal(main.verificaPosicao(29), 5);
  });

  test('o índice reinicia a coluna a cada 5 posições', () => {
    assert.equal(main.verificaPosicao(4), 5);
    assert.equal(main.verificaPosicao(5), 1, 'a 6ª posição volta para a coluna 1');
    assert.equal(main.verificaPosicao(9), 5);
    assert.equal(main.verificaPosicao(10), 1);
  });
});

describe('gerarNumeroAleatorio (caracterização)', () => {
  // Note: Math.random returns [0, 1), so Math.random = 1 is unrealistic.
  // The following test validates the minimum case (Math.random = 0).
  test('com Math.random() = 0 retorna 1 nos ranges testados (1, 75, 76)', () => {
    for (const range of [1, 75, 76]) {
      const valor = comMathRandom(0, () => main.gerarNumeroAleatorio(range));
      assert.equal(valor, 1, `range ${range}`);
    }
  });

  test('com Math.random() = 0.9999999 retorna o próprio range (máximo inclusivo)', () => {
    assert.equal(comMathRandom(0.9999999, () => main.gerarNumeroAleatorio(75)), 75);
    assert.equal(comMathRandom(0.9999999, () => main.gerarNumeroAleatorio(76)), 76);
  });

  test('BUG A2: gerarNumeroAleatorio(75) agora devolve 75 (máximo inclusivo)', () => {
    // Com a correção do passo 4, `gerarNumeroAleatorio(range)` passou a ser
    // `Math.floor(range * Math.random()) + 1`, de modo que o valor máximo
    // (range) passa a ser atingível. Antes o range 75 dava 0..74; agora dá 1..75.
    const rng = criarRng(12345);
    const amostras75 = comMathRandom(rng, () =>
      Array.from({ length: 1000 }, () => main.gerarNumeroAleatorio(75)),
    );
    // 75 passou a ser possível com range 75 (correção do bug A2).
    assert.ok(amostras75.includes(75), '75 agora pode aparecer com range 75');

    // range 76 pode gerar 75 quando Math.random está próximo de 1 - floor(76 * 0.9999) + 1 = 75
    assert.equal(
      comMathRandom(0.98, () => main.gerarNumeroAleatorio(76)),
      75,
      'com range 76 Math.random=0.98 gera 75',
    );
  });

  test('snapshot: os 5 primeiros valores com criarRng(12345) são fixos', () => {
    const primeiros = comMathRandom(criarRng(12345), () =>
      Array.from({ length: 5 }, () => main.gerarNumeroAleatorio(75)),
    );
    // Capturados de uma execução real deste código (não inventados).
    // A sequência mudou porque `gerarNumeroAleatorio` agora devolve [1, range]
    // em vez de [0, range). Os valores antigos [73,23,36,61,38] correspondiam ao
    // comportamento [0, 74]; os novos [74,24,37,62,39] correspondem a [1, 75].
    // Se mudaram, houve mudança de PRNG ou de comportamento — investigar.
    assert.deepEqual(primeiros, [74, 24, 37, 62, 39]);
  });

  test('propriedade: 1000 chamadas com range 75 são inteiros em [1, 75]', () => {
    const rng = criarRng(2026);
    const amostras = comMathRandom(rng, () =>
      Array.from({ length: 1000 }, () => main.gerarNumeroAleatorio(75)),
    );
    for (const valor of amostras) {
      assert.equal(Number.isInteger(valor), true, `não inteiro: ${valor}`);
      assert.ok(valor >= 1 && valor <= 75, `fora de [1, 75]: ${valor}`);
    }
  });

  test('comMathRandom restaura Math.random mesmo quando fn lança', () => {
    assert.throws(
      () =>
        comMathRandom(0.5, () => {
          throw new Error('falha proposital');
        }),
      /falha proposital/,
    );
    assert.equal(Math.random, mathRandomOriginal);
  });
});
