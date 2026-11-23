'use strict';

/** Funções puras usadas pelo painel da TV (painel.html). */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { criarRng, comMathRandom } = require('./helpers');
const logica = require('../src/js/logica.js');

describe('letraDoNumero', () => {
  test('cada letra cobre a sua faixa de 15 números', () => {
    const faixas = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };
    for (const [letra, [min, max]] of Object.entries(faixas)) {
      for (let n = min; n <= max; n += 1) assert.equal(logica.letraDoNumero(n), letra, `número ${n}`);
    }
  });

  test('devolve null fora de 1 a 75', () => {
    for (const valor of [0, -1, 76, 1.5, NaN, null, undefined, '7']) {
      assert.equal(logica.letraDoNumero(valor), null, String(valor));
    }
  });
});

describe('textoParaCantar', () => {
  test('usa a letra por extenso e o número', () => {
    assert.equal(logica.textoParaCantar(7), 'Bê, 7');
    assert.equal(logica.textoParaCantar(22), 'I, 22');
    assert.equal(logica.textoParaCantar(33), 'Ene, 33');
    assert.equal(logica.textoParaCantar(52), 'Gê, 52');
    assert.equal(logica.textoParaCantar(75), 'Ó, 75');
  });

  test('número inválido não tem o que cantar', () => {
    assert.equal(logica.textoParaCantar(0), '');
  });
});

describe('sortearCores', () => {
  const cores = (semente) => comMathRandom(criarRng(semente), () => logica.sortearCores(5));

  test('dá uma cor válida a cada um dos 75 números, em partes iguais', () => {
    const lista = cores(1);
    assert.equal(lista.length, 75);
    for (let cor = 0; cor < 5; cor += 1) {
      assert.equal(lista.filter((c) => c === cor).length, 15, `cor ${cor}`);
    }
  });

  test('a ordem é sortida: muda de uma rodada para outra', () => {
    assert.notDeepEqual(cores(1), cores(2));
  });
});

describe('esperaRestante', () => {
  test('desconta o tempo já gasto na animação', () => {
    assert.equal(logica.esperaRestante(8000, 3000), 5000);
  });

  test('nunca é negativa', () => {
    assert.equal(logica.esperaRestante(5000, 5000), 0);
    assert.equal(logica.esperaRestante(5000, 9000), 0);
  });
});

describe('restaurarSorteio', () => {
  const cores = Array.from({ length: 75 }, (_, i) => i % 5);
  const restaurar = (dados) => logica.restaurarSorteio(dados, 5);

  test('devolve uma cópia do sorteio salvo, na mesma ordem', () => {
    const salvo = { sorteados: [53, 7, 70], cores };
    const obtido = restaurar(JSON.parse(JSON.stringify(salvo)));
    assert.deepEqual(obtido, salvo);
    assert.notEqual(obtido.sorteados, salvo.sorteados);
  });

  test('aceita rodada vazia e rodada completa', () => {
    const todos = Array.from({ length: 75 }, (_, i) => i + 1);
    assert.deepEqual(restaurar({ sorteados: [], cores }).sorteados, []);
    assert.equal(restaurar({ sorteados: todos, cores }).sorteados.length, 75);
  });

  test('recusa números repetidos, fora da faixa ou de outro tipo', () => {
    for (const sorteados of [[7, 7], [0], [76], [1.5], ['7'], [null], 'abc', undefined]) {
      assert.equal(restaurar({ sorteados, cores }), null, JSON.stringify(sorteados));
    }
  });

  test('recusa cores inválidas e dados ausentes', () => {
    assert.equal(restaurar({ sorteados: [7], cores: cores.slice(1) }), null);
    assert.equal(restaurar({ sorteados: [7], cores: cores.map(() => 5) }), null);
    for (const dados of [null, undefined, 3, {}, []]) assert.equal(restaurar(dados), null);
  });
});
