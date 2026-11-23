// Painel da TV (painel.html): sorteio, animações, automático e voz.
// As regras ficam em logica.js e a simulação do globo em globo.js.

(function () {
  'use strict';

  const CORES = ['#ff5440', '#ffc94d', '#58ab3d', '#b02a19', '#2f7d1e'];
  const TOTAL = 75;
  const TEMPO = { min: 5, max: 30, inicial: 8 };
  const ESPERA_VOZ_MS = 5000;
  const ULTIMOS = 4;
  const CHAVE = 'bingo-painel';
  const MOLA = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  const pegar = (id) => document.getElementById(id);
  const elGlobo = pegar('globo');
  const elSoquete = pegar('soquete');
  const elQuadro = pegar('quadro');
  const elAnteriores = pegar('anteriores');
  const elContagem = pegar('contagem');
  const elMensagem = pegar('mensagem');
  const elAviso = pegar('aviso');
  const elProgresso = pegar('progresso');
  const btSortear = pegar('sortear');
  const btAutomatico = pegar('automatico');
  const btCantar = pegar('cantar');
  const dialogo = pegar('confirmar');
  const conferencia = pegar('conferencia');
  const elCodigo = pegar('codigo');
  const elResultado = pegar('resultado');
  const elConferida = pegar('cartela-conferida');

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const globo = GloboBingo.criar(pegar('bolas'), { semMovimento });
  const casas = new Map();

  let sorteados = [];
  let cores = [];
  let vencedor = null; // código da cartela que encerrou a rodada
  let sorteando = false;
  let emCurso = Promise.resolve(); // apresentação do número atual
  let automatico = false;
  let cantar = true;
  let querCantar = true; // preferência salva; `cantar` é falso se não houver voz
  let intervalo = TEMPO.inicial;
  let inicioSorteio = 0;
  let relogio = null;
  let barra = null;
  let reiniciarAoTerminar = false;

  const corDe = (numero) => CORES[cores[numero - 1]];
  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const acabou = () => sorteados.length === TOTAL;
  const encerrada = () => vencedor !== null || acabou();
  const dialogoAberto = () => dialogo.open || conferencia.open;

  function criarElemento(tag, propriedades = {}) {
    return Object.assign(document.createElement(tag), propriedades);
  }

  function criarBola(numero, comLetra) {
    const bola = criarElemento('div', { className: 'bola' });
    const disco = criarElemento('span', { className: 'bola-disco' });
    if (comLetra) disco.append(criarElemento('small', { textContent: BingoLogica.letraDoNumero(numero) }));
    disco.append(String(numero));
    bola.style.setProperty('--cor', corDe(numero));
    bola.append(disco);
    return bola;
  }

  // ---------- Memória (sobrevive a um recarregamento da página) ----------

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ sorteados, cores, vencedor, intervalo, cantar: querCantar }));
    } catch { /* sem armazenamento: o painel funciona, só não lembra */ }
  }

  function ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE));
    } catch {
      return null;
    }
  }

  // ---------- Animações ----------

  /** Anima e espera o fim. O limite evita travar se a aba estiver escondida. */
  function animar(elemento, quadros, opcoes) {
    const animacao = elemento.animate(quadros, { fill: 'both', ...opcoes });
    const limite = opcoes.duration + (opcoes.delay || 0) + 400;
    return Promise.race([animacao.finished.catch(() => {}), esperar(limite)]).then(() => animacao);
  }

  function centroDe(elemento) {
    const r = elemento.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, diametro: r.width };
  }

  const suavizar = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

  /** Voo em arco entre dois pontos; a escala acompanha o tamanho de cada um. */
  function voar(bola, de, para, { base, altura, voltas, duracao }) {
    const total = 24;
    const quadros = Array.from({ length: total + 1 }, (_, i) => {
      const t = suavizar(i / total);
      const x = de.x + (para.x - de.x) * t - base / 2;
      const y = de.y + (para.y - de.y) * t - altura * 4 * t * (1 - t) - base / 2;
      const escala = (de.diametro + (para.diametro - de.diametro) * t) / base;
      return { transform: `translate(${x}px, ${y}px) scale(${escala}) rotate(${(1 - t) * voltas * 360}deg)` };
    });
    return animar(bola, quadros, { duration: duracao, easing: 'linear' });
  }

  function quicar(elemento, forca = 1) {
    const s = (x, y) => ({ transform: `scale(${1 + x * forca}, ${1 + y * forca})` });
    return animar(
      elemento,
      [s(0, 0), s(0.28, -0.26), s(-0.14, 0.2), s(0.09, -0.08), s(-0.03, 0.04), s(0, 0)],
      { duration: 620, easing: 'ease-out', fill: 'none' },
    );
  }

  function soltarConfetes({ x, y }, quantidade, alcance, onde = document.body) {
    if (semMovimento) return;
    for (let i = 0; i < quantidade; i += 1) {
      const pedaco = criarElemento('span', { className: 'confete' });
      pedaco.style.setProperty('--cor', CORES[i % CORES.length]);
      if (i % 2) pedaco.style.borderRadius = '50%';
      onde.append(pedaco);
      const angulo = (i / quantidade) * Math.PI * 2 + Math.random() * 0.5;
      const longe = alcance * (0.6 + Math.random() * 0.6);
      const dx = Math.cos(angulo) * longe;
      const dy = Math.sin(angulo) * longe;
      animar(pedaco, [
        { transform: `translate(${x}px, ${y}px) scale(0.3)`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + dy}px) scale(1) rotate(200deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${x + dx * 1.1}px, ${y + dy + alcance * 0.5}px) scale(0.4) rotate(420deg)`, opacity: 0 },
      ], { duration: 800 + Math.random() * 300, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)' })
        .then(() => pedaco.remove());
    }
  }

  function balancarVizinhas(numero) {
    [numero - 1, numero + 1].forEach((vizinho) => {
      if (BingoLogica.letraDoNumero(vizinho) === BingoLogica.letraDoNumero(numero)) {
        quicar(casas.get(vizinho), 0.4);
      }
    });
    quicar(casas.get(numero).parentElement.querySelector('.letra'), 0.5);
  }

  // ---------- Voz ----------

  const voz = window.speechSynthesis;

  const vozEmPortugues = () => voz.getVoices().find((v) => /^pt[-_]BR/i.test(v.lang))
    || voz.getVoices().find((v) => /^pt/i.test(v.lang));

  function avisar(texto) {
    elAviso.textContent = texto;
    elAviso.hidden = !texto;
  }

  function conferirVoz() {
    if (!voz) {
      cantar = false;
      btCantar.disabled = true;
      btCantar.setAttribute('aria-checked', 'false');
      avisar('Este navegador não tem voz para cantar os números.');
      return;
    }
    const semPortugues = voz.getVoices().length > 0 && !vozEmPortugues();
    avisar(cantar && semPortugues ? 'Não há voz em português neste aparelho; a pronúncia pode ficar estranha.' : '');
  }

  /** Fala o texto e espera o fim, com limite de tempo. */
  function falar(texto) {
    if (!cantar || !voz) return Promise.resolve();
    voz.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 0.9;
    fala.voice = vozEmPortugues() || null;
    const fim = new Promise((ok) => { fala.onend = ok; fala.onerror = ok; });
    voz.speak(fala);
    return Promise.race([fim, esperar(ESPERA_VOZ_MS)]);
  }

  const cantarNumero = (numero) => falar(BingoLogica.textoParaCantar(numero));

  // ---------- Desenho ----------

  function desenharQuadro() {
    casas.clear();
    const linhas = ['B', 'I', 'N', 'G', 'O'].map((letra) => {
      const linha = criarElemento('div', { className: 'linha-letra' });
      linha.setAttribute('role', 'group');
      linha.setAttribute('aria-label', `Letra ${letra}`);
      linha.append(criarElemento('div', { className: 'letra', textContent: letra }));
      return linha;
    });
    for (let n = 1; n <= TOTAL; n += 1) {
      const casa = criarElemento('div', { className: 'casa', textContent: n });
      casas.set(n, casa);
      linhas['BINGO'.indexOf(BingoLogica.letraDoNumero(n))].append(casa);
    }
    elQuadro.replaceChildren(...linhas);
  }

  function desenharSoquete(numero) {
    elSoquete.classList.toggle('cheio', Boolean(numero));
    if (!numero) {
      elSoquete.replaceChildren(criarElemento('span', { textContent: '?' }));
      return;
    }
    elSoquete.style.setProperty('--cor', corDe(numero));
    elSoquete.replaceChildren(
      criarElemento('span', { className: 'letra-atual', textContent: BingoLogica.letraDoNumero(numero) }),
      criarElemento('span', { textContent: numero }),
    );
  }

  function desenharAnteriores() {
    const itens = sorteados.slice(-1 - ULTIMOS, -1).reverse().map((numero) => {
      const item = criarElemento('li');
      item.append(criarBola(numero, false));
      return item;
    });
    elAnteriores.replaceChildren(...itens);
    if (itens.length && !semMovimento) {
      animar(itens[0], [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 420, easing: MOLA });
    }
  }

  function ocuparCasa(numero) {
    document.querySelectorAll('.casa.recente').forEach((c) => c.classList.remove('recente'));
    const casa = casas.get(numero);
    casa.classList.add('saiu', 'recente');
    casa.replaceChildren(criarBola(numero, false));
    return casa;
  }

  function textoSortear() {
    if (vencedor) return 'Rodada encerrada';
    return acabou() ? 'Fim do sorteio' : 'Sortear';
  }

  function atualizarBotoes() {
    btSortear.setAttribute('aria-disabled', String(sorteando || encerrada()));
    pegar('sortear-texto').textContent = textoSortear();
    btAutomatico.setAttribute('aria-checked', String(automatico));
    btCantar.setAttribute('aria-checked', String(cantar));
    pegar('intervalo').textContent = `${intervalo} s`;
  }

  // ---------- Sorteio ----------

  async function apresentar(numero) {
    if (semMovimento) {
      globo.retirar(numero);
      desenharSoquete(numero);
      await cantarNumero(numero);
      ocuparCasa(numero);
      return;
    }

    elGlobo.classList.add('agitando');
    globo.agitar(1000);
    await esperar(900);
    elGlobo.classList.remove('agitando');

    const origem = globo.retirar(numero);
    const palco = centroDe(elSoquete);
    const bola = criarBola(numero, true);
    bola.classList.add('voadora');
    bola.style.setProperty('--d', `${palco.diametro}px`);
    document.body.append(bola);

    await voar(bola, origem, palco, {
      base: palco.diametro, altura: palco.diametro * 0.25, voltas: -1, duracao: 750,
    });
    quicar(bola.firstElementChild, 0.6);
    soltarConfetes(palco, 18, palco.diametro * 0.75);
    desenharSoquete(numero);
    await Promise.all([cantarNumero(numero), esperar(1000)]);

    // Mede a casa só agora: a janela pode ter mudado de tamanho.
    const destino = centroDe(casas.get(numero));
    const partida = centroDe(elSoquete);
    await voar(bola, partida, destino, {
      base: palco.diametro, altura: palco.diametro * 0.45, voltas: 1, duracao: 750,
    });
    const casa = ocuparCasa(numero);
    bola.remove();
    quicar(casa.firstElementChild);
    balancarVizinhas(numero);
    soltarConfetes(destino, 12, destino.diametro * 1.1);
  }

  async function sortear() {
    if (sorteando || encerrada() || dialogoAberto()) return;
    pararRelogio();
    sorteando = true;
    inicioSorteio = performance.now();
    const numero = BingoLogica.sortearNumero(sorteados);
    sorteados = [...sorteados, numero];
    salvar();
    desenharAnteriores();
    atualizarBotoes();

    emCurso = apresentar(numero);
    await emCurso;

    elMensagem.textContent = `Número sorteado: ${BingoLogica.letraDoNumero(numero)} ${numero}.`
      + (acabou() ? ' Todos os números já saíram.' : '');
    elContagem.textContent = sorteados.length;
    sorteando = false;
    if (reiniciarAoTerminar) {
      novaRodada();
      return;
    }
    if (acabou()) {
      automatico = false;
      soltarConfetes({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 80, window.innerHeight * 0.5);
    }
    atualizarBotoes();
    agendar();
  }

  // ---------- Automático ----------

  function pararRelogio() {
    clearTimeout(relogio);
    relogio = null;
    if (barra) barra.cancel();
    barra = null;
  }

  function agendar() {
    pararRelogio();
    if (!automatico || sorteando || encerrada() || dialogoAberto()) return;
    const total = intervalo * 1000;
    // Sem sorteio anterior (ou já passado do prazo), dá um respiro curto.
    const decorrido = sorteados.length ? performance.now() - inicioSorteio : total;
    const espera = Math.max(600, BingoLogica.esperaRestante(total, decorrido));
    relogio = setTimeout(sortear, espera);
    barra = elProgresso.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: espera });
  }

  function mudarIntervalo(passo) {
    intervalo = Math.min(TEMPO.max, Math.max(TEMPO.min, intervalo + passo));
    salvar();
    atualizarBotoes();
    agendar();
  }

  // ---------- Rodada ----------

  function novaRodada() {
    pararRelogio();
    if (voz) voz.cancel();
    reiniciarAoTerminar = false;
    automatico = false;
    vencedor = null;
    sorteados = [];
    cores = BingoLogica.sortearCores(CORES.length);
    salvar();
    desenharRodada();
    globo.agitar(500);
    elMensagem.textContent = 'Nova rodada pronta.';
  }

  /** Desenha tudo a partir de `sorteados`, sem animar. */
  function desenharRodada() {
    const noGlobo = Array.from({ length: TOTAL }, (_, i) => i + 1).filter((n) => !sorteados.includes(n));
    globo.definirBolas(noGlobo.map((numero) => ({ numero, cor: corDe(numero) })));
    desenharQuadro();
    sorteados.forEach(ocuparCasa);
    desenharSoquete(sorteados[sorteados.length - 1] || null);
    desenharAnteriores();
    elContagem.textContent = sorteados.length;
    atualizarBotoes();
  }

  /** Retoma a rodada salva; o automático sempre volta desligado. */
  function abrir() {
    const salvo = ler();
    const rodada = BingoLogica.restaurarSorteio(salvo, CORES.length);
    if (!rodada) {
      novaRodada();
      return;
    }
    if (Number.isInteger(salvo.intervalo) && salvo.intervalo >= TEMPO.min && salvo.intervalo <= TEMPO.max) {
      intervalo = salvo.intervalo;
    }
    querCantar = salvo.cantar !== false;
    cantar = querCantar;
    ({ sorteados, cores } = rodada);
    const conferido = BingoLogica.conferirCodigo(salvo.vencedor, sorteados);
    vencedor = conferido && conferido.padrao ? conferido.codigo : null;
    desenharRodada();
  }

  function confirmarNova() {
    dialogo.close();
    if (sorteando) reiniciarAoTerminar = true;
    else novaRodada();
  }

  // ---------- Conferência do Bingo ----------

  function mostrarResultado(texto, classe = '') {
    elResultado.textContent = texto;
    elResultado.className = `resultado ${classe}`;
  }

  function desenharConferida(numeros, padrao) {
    const tabela = criarElemento('table');
    const cabecalho = criarElemento('tr');
    cabecalho.append(...[...'BINGO'].map((letra) => criarElemento('th', { textContent: letra, scope: 'col' })));
    tabela.append(cabecalho);
    const doPadrao = (l, c) => Boolean(padrao) && padrao.posicoes.some(([pl, pc]) => pl === l && pc === c);
    numeros.forEach((linha, l) => {
      const tr = criarElemento('tr');
      tr.append(...linha.map((numero, c) => {
        const td = criarElemento('td', { textContent: numero === null ? '' : numero });
        td.classList.toggle('central', numero === null);
        td.classList.toggle('chamado', sorteados.includes(numero));
        td.classList.toggle('padrao', doPadrao(l, c));
        return td;
      }));
      tabela.append(tr);
    });
    elConferida.replaceChildren(tabela);
  }

  function limparConferencia() {
    elCodigo.value = '';
    mostrarResultado('');
    elConferida.replaceChildren();
  }

  function abrirConferencia() {
    pararRelogio();
    limparConferencia();
    conferencia.showModal();
    elCodigo.focus();
  }

  async function conferir(evento) {
    evento.preventDefault();
    const texto = elCodigo.value;
    // O número em apresentação só vale depois de aparecer.
    await emCurso;
    if (!conferencia.open) return;
    const obtido = BingoLogica.conferirCodigo(texto, sorteados);
    elConferida.replaceChildren();
    if (!obtido) {
      mostrarResultado('Código não encontrado. Confira com o jogador e digite de novo.');
      elCodigo.select();
      return;
    }
    desenharConferida(obtido.numeros, obtido.padrao);
    if (!obtido.padrao) {
      mostrarResultado(`Ainda não é Bingo na cartela ${obtido.codigo}. Em amarelo, o que já saiu.`);
      elCodigo.select();
      return;
    }
    mostrarResultado(`BINGO! A cartela ${obtido.codigo} venceu com ${BingoLogica.descreverPadrao(obtido.padrao)}.`, 'vitoria');
    soltarConfetes({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 60, window.innerHeight * 0.45, conferencia);
    falar('Bingo!');
    if (vencedor) return;
    vencedor = obtido.codigo;
    automatico = false;
    salvar();
    atualizarBotoes();
  }

  function alternarTelaCheia() {
    const pedido = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    pedido.catch(() => avisar('O navegador não permitiu a tela cheia. Tente a tecla F11.'));
  }

  btSortear.addEventListener('click', sortear);
  btAutomatico.addEventListener('click', () => {
    automatico = !automatico && !encerrada();
    atualizarBotoes();
    agendar();
  });
  btCantar.addEventListener('click', () => {
    cantar = !cantar;
    querCantar = cantar;
    salvar();
    if (!cantar) voz.cancel();
    conferirVoz();
    atualizarBotoes();
  });
  pegar('menos').addEventListener('click', () => mudarIntervalo(-1));
  pegar('mais').addEventListener('click', () => mudarIntervalo(1));
  pegar('nova').addEventListener('click', () => {
    if (!sorteados.length) return;
    pararRelogio();
    dialogo.showModal();
  });
  pegar('cancelar').addEventListener('click', () => dialogo.close());
  pegar('confirmar-nova').addEventListener('click', confirmarNova);
  dialogo.addEventListener('close', agendar);
  pegar('conferir').addEventListener('click', abrirConferencia);
  pegar('conferencia-form').addEventListener('submit', conferir);
  pegar('fechar-conferencia').addEventListener('click', () => conferencia.close());
  conferencia.addEventListener('close', agendar);

  const btTelaCheia = pegar('tela-cheia');
  btTelaCheia.hidden = !document.documentElement.requestFullscreen;
  btTelaCheia.addEventListener('click', alternarTelaCheia);
  document.addEventListener('fullscreenchange', () => {
    btTelaCheia.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
  });

  if (voz && voz.addEventListener) voz.addEventListener('voiceschanged', conferirVoz);
  abrir();
  conferirVoz();
  elMensagem.textContent = '';
})();
