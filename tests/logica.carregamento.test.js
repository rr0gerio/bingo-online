'use strict';

/**
 * Garante que `src/js/logica.js` carrega nos dois ambientes: como script
 * comum no navegador e via require() nos testes.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const caminho = path.join(__dirname, '..', 'src', 'js', 'logica.js');
const FUNCOES = [
  'alternarMarcacao',
  'cantarBingo',
  'cartelaDoCodigo',
  'conferirCodigo',
  'criarCartela',
  'criarCodigo',
  'criarPartida',
  'descreverPadrao',
  'esperaRestante',
  'gerarNumeroAleatorio',
  'letraDoNumero',
  'restaurarCartelas',
  'restaurarSorteio',
  'sortear',
  'sortearCores',
  'sortearNumero',
  'textoParaCantar',
  'verificarVencedor',
];

describe('carregamento de logica.js', () => {
  test('como script comum, expõe BingoLogica aos scripts seguintes', () => {
    // Contexto sem module, require nem document, como um <script> sem DOM.
    const contexto = vm.createContext({});
    vm.runInContext(fs.readFileSync(caminho, 'utf8'), contexto);

    const nomes = vm.runInContext('Object.keys(BingoLogica).sort().join()', contexto);
    assert.equal(nomes, FUNCOES.join());
    assert.equal(vm.runInContext('BingoLogica.gerarNumeroAleatorio(1)', contexto), 1);
  });

  test('só expõe BingoLogica, sem funções soltas no escopo global', () => {
    const contexto = vm.createContext({});
    vm.runInContext(fs.readFileSync(caminho, 'utf8'), contexto);

    assert.equal(vm.runInContext('typeof gerarNumeroAleatorio', contexto), 'undefined');
  });

  test('via require, exporta as mesmas funções', () => {
    assert.deepEqual(Object.keys(require(caminho)).sort(), FUNCOES);
  });
});
