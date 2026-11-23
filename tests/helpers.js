'use strict';

/**
 * Helpers dos testes (node:test, sem dependências).

 * POR QUE `carregarMain()` EXISTE:
 * `src/js/main.js` é um script de navegador: além das funções puras
 * (`verificaPosicao` e `gerarNumeroAleatorio`) ele toca o DOM no topo
 * (`document.addEventListener`, `document.onkeydown`). Um `require()` direto
 * no Node quebraria com "document is not defined". Até o passo 3 extrair a
 * lógica para `src/js/logica.js`, carregamos o arquivo real com `node:vm` e um
 * stub mínimo de `document`, para que os testes de caracterização exercitem o
 * código de verdade — e não uma cópia que poderia divergir.

 * PASSO 3: quando `src/js/logica.js` existir, troque o corpo de
 * `carregarMain()` por `require('../src/js/logica.js')`, expondo a mesma
 * superfície (`verificaPosicao`, `gerarNumeroAleatorio`). Os testes de
 * `tests/main.test.js` devem continuar valendo sem alteração.
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/**
 * Carrega o `src/js/main.js` real num contexto de `vm` com um stub de
 * `document`. Retorna o contexto: `contexto.verificaPosicao`,
 * `contexto.gerarNumeroAleatorio`, etc.

 * `Math` do host é injetado de propósito: `vm.createContext` cria um realm
 * próprio, então o `Math` de dentro do contexto NÃO é o mesmo objeto do host.
 * Sem essa injeção, `comMathRandom` (que substitui `Math.random`) não teria
 * efeito no código carregado.
 */
function carregarMain() {
  const arquivo = path.join(__dirname, '..', 'src', 'js', 'main.js');
  const codigo = fs.readFileSync(arquivo, 'utf8');
  const contexto = {
    document: { addEventListener() {}, onkeydown: null },
    Math,
  };
  vm.createContext(contexto);
  vm.runInContext(codigo, contexto, { filename: arquivo });
  return contexto;
}

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

module.exports = { carregarMain, criarRng, comMathRandom };