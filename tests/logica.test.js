'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { criarRng, comMathRandom } = require('./helpers');
const logica = require('../src/js/logica.js');

// Cartela fixa: coluna c tem (c*15+1)..(c*15+5), de cima para baixo.
const CARTELA = [
  [1, 16, 31, 46, 61],
  [2, 17, 32, 47, 62],
  [3, 18, null, 48, 63],
  [4, 19, 34, 49, 64],
  [5, 20, 35, 50, 65],
];

const TODOS = Array.from({ length: 75 }, (_, i) => i + 1);
const semear = (semente, fn) => comMathRandom(criarRng(semente), fn);
const ordenar = (lista) => [...lista].sort((a, b) => a - b);

describe('criarCartela', () => {
  const cartelas = semear(1, () => Array.from({ length: 500 }, () => logica.criarCartela()));

  test('é 5x5, com 24 números distintos e só o centro livre', () => {
    for (const cartela of cartelas) {
      assert.equal(cartela.length, 5);
      assert.ok(cartela.every((linha) => linha.length === 5));
      assert.equal(cartela[2][2], null);
      const numeros = cartela.flat().filter((n) => n !== null);
      assert.equal(numeros.length, 24);
      assert.equal(new Set(numeros).size, 24);
    }
  });

  test('cada coluna respeita a sua faixa de 15', () => {
    for (const cartela of cartelas) {
      cartela.forEach((linha) =>
        linha.forEach((n, c) => {
          if (n !== null) assert.ok(n >= c * 15 + 1 && n <= c * 15 + 15, `${n} na coluna ${c + 1}`);
        }),
      );
    }
  });

  test('todos os números de 1 a 75 podem aparecer (bug A2)', () => {
    const vistos = new Set(cartelas.flat(2).filter((n) => n !== null));
    assert.deepEqual(ordenar(vistos), TODOS);
  });
});

describe('sorteio', () => {
  test('75 sorteios saem sem repetir e cobrem de 1 a 75', () => {
    for (let semente = 0; semente < 50; semente++) {
      const sorteados = [];
      semear(semente, () => {
        for (let i = 0; i < 75; i++) sorteados.push(logica.sortearNumero(sorteados));
      });
      assert.deepEqual(ordenar(sorteados), TODOS);
    }
  });

  test('o último número que falta sai sempre, com qualquer Math.random', () => {
    const faltaUm = TODOS.filter((n) => n !== 42);
    for (const valor of [0, 0.5, 0.9999999]) {
      assert.equal(comMathRandom(valor, () => logica.sortearNumero(faltaUm)), 42);
    }
  });

  test('depois dos 75, devolve null; a lista recebida não muda', () => {
    assert.equal(logica.sortearNumero(TODOS), null);
    const lista = Object.freeze([1, 2, 3]);
    assert.doesNotThrow(() => logica.sortearNumero(lista));
  });

  test('a primeira bola pode ser qualquer número, com frequência parecida (bug A1)', () => {
    const contagem = new Array(76).fill(0);
    semear(7, () => {
      for (let i = 0; i < 75000; i++) contagem[logica.sortearNumero([])]++;
    });
    // Esperado: 1000 cada (desvio padrão ~31); 150 dá folga de quase 5 desvios.
    TODOS.forEach((n) => assert.ok(Math.abs(contagem[n] - 1000) < 150, `${n}: ${contagem[n]}`));
  });
});

describe('verificarVencedor', () => {
  const casos = [
    ['linha 1', [1, 16, 31, 46, 61], 'linha', 1],
    ['linha 2', [2, 17, 32, 47, 62], 'linha', 2],
    ['linha 3 (centro livre)', [3, 18, 48, 63], 'linha', 3],
    ['linha 4', [4, 19, 34, 49, 64], 'linha', 4],
    ['linha 5', [5, 20, 35, 50, 65], 'linha', 5],
    ['coluna 1', [1, 2, 3, 4, 5], 'coluna', 1],
    ['coluna 2', [16, 17, 18, 19, 20], 'coluna', 2],
    ['coluna 3 (centro livre)', [31, 32, 34, 35], 'coluna', 3],
    ['coluna 4', [46, 47, 48, 49, 50], 'coluna', 4],
    ['coluna 5', [61, 62, 63, 64, 65], 'coluna', 5],
    ['diagonal 1 (centro livre)', [1, 17, 49, 65], 'diagonal', 1],
    ['diagonal 2 (centro livre)', [61, 47, 19, 5], 'diagonal', 2],
    ['quatro cantos', [1, 61, 5, 65], 'cantos', 1],
  ];

  for (const [nome, numeros, tipo, numero] of casos) {
    test(`reconhece ${nome}, e só com todos os números`, () => {
      const padrao = logica.verificarVencedor(CARTELA, numeros, numeros);
      assert.equal(padrao.tipo, tipo);
      assert.equal(padrao.numero, numero);

      for (const falta of numeros) {
        const incompleto = numeros.filter((n) => n !== falta);
        assert.equal(logica.verificarVencedor(CARTELA, incompleto, numeros), null, `sem marcar ${falta}`);
        assert.equal(logica.verificarVencedor(CARTELA, numeros, incompleto), null, `sem sortear ${falta}`);
      }
    });
  }

  test('cartela sem marcas não vence, mesmo com tudo sorteado', () => {
    assert.equal(logica.verificarVencedor(CARTELA, [], TODOS), null);
  });
});
