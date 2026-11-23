'use strict';

/** Helpers dos testes (node:test, sem dependências). */

const { gerarNumeroAleatorio } = require('../src/js/logica.js');

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
 * função) e restaura o original no `finally`, mesmo se `fn` lançar.
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

/** Função básica de `src/js/logica.js` usada em `main.test.js`. */
function carregarMain() {
  return { gerarNumeroAleatorio };
}

module.exports = { carregarMain, criarRng, comMathRandom };
