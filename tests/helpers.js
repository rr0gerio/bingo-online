'use strict';

/**
 * Helpers dos testes (node:test, sem dependências).

 * PASSO 3: a partir daqui o carregador usa `require` para o módulo de
 * lógica pura recém-extraído (`src/js/logica.js`), expondo as mesmas
 * funções (`verificaPosicao`, `gerarNumeroAleatorio`) que os testes
 * de `tests/main.test.js` já conhecem.

 * Em futuros passos, quando a refatoração para `src/js/main.js` usar
 * apenas `require('../src/js/logica.js')`, este helper continuará
 * inalterado — os mesmos `import`/`export` continuam válidos.
 */

const fs = require('node:fs');
const path = require('node:path');
const { verificaPosicao, gerarNumeroAleatorio } = require('../src/js/logica.js');

/**
 * PRNG determinístico mulberry32. Mesma semente => mesma sequência, em
 * qualquer máquina/versão do Node. Retorna uma função `() => float em [0,1)`.
 */
function criarRng(semente) {
  let a = semente >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Executa `fn` com `Math.random` substituído por `valorOuFn` (número fixo ou
 * função) e restaura o original no `finally`, mesmo se `fn` lanzar.
 *
 * ATENÇÃO: `fn` deve ser síncrona. Se `fn` retornar uma Promise, o helper
 * lança um TypeError. O `finally` garante que `Math.random` é sempre
 * restaurado, mesmo quando `fn` lança.
 *
 * Necessário porque `gerarNumeroAleatorio` chama `Math.random` direto, sem
 * injeção de dependência.
 */
function comMathRandom(valorOuFn, fn) {
  const original = Math.random;
  Math.random = typeof valorOuFn === 'function' ? valorOuFn : () => valorOuFn;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      throw new TypeError('comMathRandom só suporta fn síncrona');
    }
    return result;
  } finally {
    Math.random = original;
  }
}

/**
 * Carrega as funções puras de `src/js/logica.js`.
 * Substitui o antigo carregamento via `node:vm` + stub de `document`,
 * pois a lógica foi extraída para módulo independente, sem toques no DOM.
 */
function carregarMain() {
  return {
    verificaPosicao,
    gerarNumeroAleatorio,
  };
}

module.exports = { carregarMain, criarRng, comMathRandom };