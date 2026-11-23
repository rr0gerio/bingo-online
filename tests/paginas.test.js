'use strict';

/** Verifica as páginas sem navegador: scripts válidos e links que existem. */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const RAIZ = path.join(__dirname, '..');
const PAGINAS = ['index.html', 'src/pages/cartela.html', 'src/pages/sorteador.html', 'src/pages/jogo.html'];

for (const pagina of PAGINAS) {
  describe(pagina, () => {
    const arquivo = path.join(RAIZ, pagina);
    const html = fs.readFileSync(arquivo, 'utf8');
    const local = (destino) => path.join(path.dirname(arquivo), destino);
    const capturar = (regex) => [...html.matchAll(regex)].map((m) => m[1]);

    test('cada script existe e é um script comum válido (sem import/export)', () => {
      const scripts = capturar(/<script src="([^"]+)"><\/script>/g);
      assert.ok(scripts.length > 0 || pagina === 'index.html');
      for (const src of scripts) {
        const codigo = fs.readFileSync(local(src), 'utf8');
        assert.doesNotThrow(() => new vm.Script(codigo), src);
      }
    });

    test('imagens, ícones e estilos são locais e existem', () => {
      const arquivos = [...capturar(/<img src="([^"]+)"/g), ...capturar(/<link rel="(?:icon|stylesheet)" href="([^"]+)"/g)];
      assert.ok(arquivos.length >= 2);
      for (const src of arquivos) assert.ok(fs.existsSync(local(src)), `não existe: ${src}`);
    });

    test('cada link é local e aponta para um arquivo que existe', () => {
      const links = capturar(/<a href="([^"]+)"/g);
      assert.ok(links.length > 0);
      for (const href of links) {
        assert.ok(!/^https?:/.test(href), `link externo: ${href}`);
        assert.ok(fs.existsSync(local(href)), `não existe: ${href}`);
      }
    });
  });
}
