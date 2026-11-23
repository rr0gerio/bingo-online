// Página do participante (cartela.html), aberta no celular de cada jogador.
// Os números saem no painel da TV; quem canta Bingo dita o código da cartela.

(function () {
  'use strict';

  const CHAVE = 'bingo-cartelas';
  const LETRAS = ['B', 'I', 'N', 'G', 'O'];
  const MAX_CARTELAS = 4;

  const elCartelas = document.getElementById('cartela');
  const btGerar = document.getElementById('gerar');
  const btNova = document.getElementById('nova');
  const dialogo = document.getElementById('nova-rodada');

  let cartelas = []; // [{ codigo, numeros, marcados }]

  function criarElemento(tag, propriedades = {}) {
    return Object.assign(document.createElement(tag), propriedades);
  }

  function salvar() {
    try {
      const dados = cartelas.map(({ codigo, marcados }) => ({ codigo, marcados }));
      localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch { /* sem armazenamento: dá para jogar, só não lembra */ }
  }

  function ler() {
    try {
      return BingoLogica.restaurarCartelas(JSON.parse(localStorage.getItem(CHAVE))) || [];
    } catch {
      return [];
    }
  }

  function alternar(cartela, numero) {
    const marcado = !cartela.marcados.includes(numero);
    cartela.marcados = marcado
      ? [...cartela.marcados, numero]
      : cartela.marcados.filter((n) => n !== numero);
    salvar();
    return marcado;
  }

  function criarCasa(numero, cartela) {
    const td = criarElemento('td');
    if (numero === null) {
      td.className = 'central';
      td.setAttribute('aria-label', 'Centro livre');
      return td;
    }
    const botao = criarElemento('button', { type: 'button', textContent: numero });
    const mostrar = (marcado) => {
      td.classList.toggle('marked', marcado);
      botao.setAttribute('aria-pressed', String(marcado));
    };
    mostrar(cartela.marcados.includes(numero));
    botao.addEventListener('click', () => mostrar(alternar(cartela, numero)));
    td.append(botao);
    return td;
  }

  function criarTabela(cartela) {
    const tabela = criarElemento('table');
    const cabecalho = criarElemento('tr');
    cabecalho.append(...LETRAS.map((letra) => criarElemento('th', { textContent: letra, scope: 'col' })));
    tabela.append(cabecalho);
    cartela.numeros.forEach((linha) => {
      const tr = criarElemento('tr');
      tr.append(...linha.map((numero) => criarCasa(numero, cartela)));
      tabela.append(tr);
    });
    return tabela;
  }

  function criarArtigo(cartela, indice) {
    const artigo = criarElemento('article');
    const topo = criarElemento('div', { className: 'cartela-topo' });
    const codigo = criarElemento('p', { className: 'codigo', textContent: 'Código ' });
    codigo.append(criarElemento('strong', { textContent: cartela.codigo }));
    topo.append(criarElemento('h2', { textContent: `Cartela ${indice + 1}` }), codigo);
    artigo.append(topo, criarTabela(cartela));
    return artigo;
  }

  function desenhar() {
    elCartelas.replaceChildren(...cartelas.map(criarArtigo));
    document.body.classList.toggle('jogando', cartelas.length > 0);
    btGerar.value = cartelas.length ? 'Mais uma cartela' : 'Jogar!';
    btGerar.disabled = cartelas.length >= MAX_CARTELAS;
    btNova.hidden = cartelas.length === 0;
  }

  function novaCartela() {
    const codigo = BingoLogica.criarCodigo(cartelas.map((c) => c.codigo));
    return { codigo, numeros: BingoLogica.cartelaDoCodigo(codigo), marcados: [] };
  }

  function trocarPor(novas) {
    cartelas = novas;
    salvar();
    desenhar();
    dialogo.close();
  }

  btGerar.addEventListener('click', () => {
    if (cartelas.length >= MAX_CARTELAS) return;
    cartelas = [...cartelas, novaCartela()];
    salvar();
    desenhar();
    elCartelas.lastElementChild.scrollIntoView({ block: 'nearest' });
  });

  btNova.addEventListener('click', () => dialogo.showModal());
  document.getElementById('cancelar').addEventListener('click', () => dialogo.close());
  document.getElementById('manter').addEventListener('click', () => {
    trocarPor(cartelas.map((c) => ({ ...c, marcados: [] })));
  });
  document.getElementById('trocar').addEventListener('click', () => trocarPor([]));

  cartelas = ler();
  desenhar();
})();
