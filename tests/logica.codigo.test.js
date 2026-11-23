'use strict';

/** Código da cartela: o celular gera, o painel da TV recria e confere. */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { criarRng, comMathRandom } = require('./helpers');
const logica = require('../src/js/logica.js');

const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const FIXA = [
  [4, 24, 34, 55, 64],
  [1, 25, 32, 58, 73],
  [5, 26, null, 54, 66],
  [3, 21, 37, 52, 62],
  [10, 23, 41, 47, 72],
];
const codigos = comMathRandom(criarRng(7), () => Array.from({ length: 400 }, () => logica.criarCodigo()));

describe('criarCodigo', () => {
  test('tem 5 caracteres, sem os que se confundem', () => {
    for (const codigo of codigos) assert.match(codigo, /^[2-9A-HJKMNP-Z]{5}$/);
  });

  test('não repete um código já usado', () => {
    // Semente igual produziria o mesmo código; com ele em uso, sai outro.
    const gerar = (usados) => comMathRandom(criarRng(3), () => logica.criarCodigo(usados));
    const primeiro = gerar([]);
    assert.notEqual(gerar([primeiro]), primeiro);
  });
});

describe('cartelaDoCodigo', () => {
  test('o mesmo código dá sempre a mesma cartela, sem usar Math.random', () => {
    const codigo = codigos[0];
    const esperada = logica.cartelaDoCodigo(codigo);
    const semAcaso = () => { throw new Error('não deveria usar Math.random'); };
    assert.deepEqual(comMathRandom(semAcaso, () => logica.cartelaDoCodigo(codigo)), esperada);
  });

  test('valor fixo: mudar isto invalida as cartelas já abertas nos celulares', () => {
    assert.deepEqual(logica.cartelaDoCodigo('22222'), FIXA);
  });

  test('toda cartela segue as faixas, com 24 números distintos e centro livre', () => {
    for (const codigo of codigos) {
      const cartela = logica.cartelaDoCodigo(codigo);
      const numeros = cartela.flat().filter((n) => n !== null);
      assert.equal(new Set(numeros).size, 24);
      assert.equal(cartela[2][2], null);
      cartela.forEach((linha) => linha.forEach((n, c) => {
        if (n !== null) assert.ok(n > c * 15 && n <= (c + 1) * 15, `${codigo}: ${n} na coluna ${c}`);
      }));
    }
  });

  test('códigos diferentes dão cartelas diferentes', () => {
    const distintos = [...new Set(codigos)];
    const cartelas = new Set(distintos.map((c) => JSON.stringify(logica.cartelaDoCodigo(c))));
    assert.equal(cartelas.size, distintos.length);
  });

  test('aceita minúsculas, espaços e hífen', () => {
    const [codigo] = codigos;
    const ditado = ` ${codigo.slice(0, 2).toLowerCase()}-${codigo.slice(2)} `;
    assert.deepEqual(logica.cartelaDoCodigo(ditado), logica.cartelaDoCodigo(codigo));
  });

  test('recusa qualquer caractere trocado', () => {
    for (const codigo of codigos.slice(0, 20)) {
      for (let i = 0; i < 5; i += 1) {
        for (const outro of ALFABETO) {
          if (outro === codigo[i]) continue;
          const errado = codigo.slice(0, i) + outro + codigo.slice(i + 1);
          assert.equal(logica.cartelaDoCodigo(errado), null, `${codigo} -> ${errado}`);
        }
      }
    }
  });

  test('recusa dois caracteres vizinhos invertidos', () => {
    for (const codigo of codigos) {
      for (let i = 0; i < 4; i += 1) {
        if (codigo[i] === codigo[i + 1]) continue;
        const errado = codigo.slice(0, i) + codigo[i + 1] + codigo[i] + codigo.slice(i + 2);
        assert.equal(logica.cartelaDoCodigo(errado), null, `${codigo} -> ${errado}`);
      }
    }
  });

  test('recusa texto vazio, curto, longo, com letra ambígua ou de outro tipo', () => {
    for (const valor of ['', '2222', '222222', '2222O', '1AAAA', '!!!!!', null, undefined, 22222, {}]) {
      assert.equal(logica.cartelaDoCodigo(valor), null, String(valor));
    }
  });
});

describe('conferirCodigo', () => {
  const codigo = codigos[1];
  const cartela = logica.cartelaDoCodigo(codigo);

  test('código inválido devolve null', () => {
    assert.equal(logica.conferirCodigo('22223', [1, 2, 3]), null);
  });

  test('sem números sorteados não há Bingo', () => {
    const obtido = logica.conferirCodigo(codigo, []);
    assert.equal(obtido.padrao, null);
    assert.equal(obtido.codigo, codigo);
    assert.deepEqual(obtido.numeros, cartela);
  });

  test('reconhece a linha completa e recusa quando falta um número', () => {
    const linha = cartela[1];
    const { padrao } = logica.conferirCodigo(codigo.toLowerCase(), linha);
    assert.deepEqual([padrao.tipo, padrao.numero], ['linha', 2]);
    assert.equal(logica.conferirCodigo(codigo, linha.slice(1)).padrao, null);
  });

  test('o centro livre conta na diagonal', () => {
    const diagonal = [0, 1, 3, 4].map((i) => cartela[i][i]);
    assert.equal(logica.conferirCodigo(codigo, diagonal).padrao.tipo, 'diagonal');
  });
});

describe('restaurarCartelas', () => {
  const [a, b] = [...new Set(codigos)];
  const numeroDe = (codigo) => logica.cartelaDoCodigo(codigo)[0][0];

  test('recria cartelas e marcações salvas', () => {
    const obtido = logica.restaurarCartelas([{ codigo: a, marcados: [numeroDe(a)] }, { codigo: b, marcados: [] }]);
    assert.deepEqual(obtido.map((c) => [c.codigo, c.marcados]), [[a, [numeroDe(a)]], [b, []]]);
    assert.deepEqual(obtido[0].numeros, logica.cartelaDoCodigo(a));
  });

  test('ignora marcações que não são da cartela', () => {
    const [cartela] = logica.restaurarCartelas([{ codigo: a, marcados: [numeroDe(a), numeroDe(a), 99, null, 'x'] }]);
    assert.deepEqual(cartela.marcados, [numeroDe(a)]);
  });

  test('recusa dados inválidos, códigos repetidos ou mais de 4 cartelas', () => {
    const ok = { codigo: a, marcados: [] };
    const cinco = [...new Set(codigos)].slice(0, 5).map((codigo) => ({ codigo, marcados: [] }));
    for (const dados of [null, {}, 'x', [null], [{}], [{ codigo: a }], [{ codigo: '22223', marcados: [] }], [ok, ok], cinco]) {
      assert.equal(logica.restaurarCartelas(dados), null, JSON.stringify(dados));
    }
    assert.equal(logica.restaurarCartelas(cinco.slice(0, 4)).length, 4);
  });
});

describe('descreverPadrao', () => {
  test('descreve cada tipo', () => {
    assert.equal(logica.descreverPadrao({ tipo: 'linha', numero: 2 }), 'linha 2');
    assert.equal(logica.descreverPadrao({ tipo: 'coluna', numero: 5 }), 'coluna 5');
    assert.equal(logica.descreverPadrao({ tipo: 'diagonal', numero: 1 }), 'diagonal principal');
    assert.equal(logica.descreverPadrao({ tipo: 'diagonal', numero: 2 }), 'diagonal secundária');
    assert.equal(logica.descreverPadrao({ tipo: 'cantos', numero: 1 }), 'quatro cantos');
  });
});
