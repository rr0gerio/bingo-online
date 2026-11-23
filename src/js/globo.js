// Globo do painel: simula e desenha as bolinhas em um <canvas>.
// Não conhece as regras do jogo; recebe as bolas e devolve a posição de saída.

const GloboBingo = (function () {
  'use strict';

  const LADO = 400; // unidades internas; o canvas é escalado para o tamanho real
  const MEIO = LADO / 2;
  const RAIO = 186;
  const RAIO_BOLA = 15;
  const PASSO = 1 / 120;
  const GRAVIDADE = 1100;
  const TINTA = '#1d1d1b';

  function criar(canvas, { semMovimento = false } = {}) {
    const ctx = canvas.getContext('2d');
    let bolas = [];
    let agitandoAte = 0;
    let quadrosParados = 0;
    let quadro = null;
    let anterior = 0;

    function definirBolas(lista) {
      bolas = lista.map(({ numero, cor }) => {
        const angulo = Math.random() * Math.PI * 2;
        const distancia = Math.sqrt(Math.random()) * (RAIO - RAIO_BOLA);
        return {
          numero, cor,
          x: MEIO + Math.cos(angulo) * distancia,
          y: MEIO + Math.sin(angulo) * distancia,
          vx: 0, vy: 0, giro: Math.random() * 6,
        };
      });
      assentar(480);
    }

    function assentar(passos) {
      for (let i = 0; i < passos; i += 1) simular(false);
      desenhar();
    }

    function simular(agitando) {
      for (const b of bolas) {
        b.vy += GRAVIDADE * PASSO;
        if (agitando) {
          // Sopro que sobe pelo meio, com turbulência.
          const perto = 1 - Math.min(1, Math.abs(b.x - MEIO) / RAIO);
          b.vy -= (900 + 3600 * perto * Math.random()) * PASSO;
          b.vx += (Math.random() - 0.5) * 9000 * PASSO;
        }
        b.vx *= 0.998;
        b.vy *= 0.998;
        b.x += b.vx * PASSO;
        b.y += b.vy * PASSO;
        b.giro += (b.vx / RAIO_BOLA) * PASSO;
      }
      for (let i = 0; i < bolas.length; i += 1) {
        for (let j = i + 1; j < bolas.length; j += 1) colidir(bolas[i], bolas[j]);
      }
      bolas.forEach(conter);
    }

    function colidir(a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= 4 * RAIO_BOLA * RAIO_BOLA || d2 === 0) return;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const sobra = (2 * RAIO_BOLA - d) / 2;
      a.x -= nx * sobra; a.y -= ny * sobra;
      b.x += nx * sobra; b.y += ny * sobra;
      const aproximacao = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (aproximacao <= 0) return;
      const impulso = aproximacao * 0.8;
      a.vx -= nx * impulso; a.vy -= ny * impulso;
      b.vx += nx * impulso; b.vy += ny * impulso;
    }

    function conter(b) {
      const dx = b.x - MEIO;
      const dy = b.y - MEIO;
      const d = Math.hypot(dx, dy);
      const limite = RAIO - RAIO_BOLA;
      if (d <= limite) return;
      const nx = dx / d;
      const ny = dy / d;
      b.x = MEIO + nx * limite;
      b.y = MEIO + ny * limite;
      const saindo = b.vx * nx + b.vy * ny;
      if (saindo <= 0) return;
      b.vx -= 1.55 * saindo * nx;
      b.vy -= 1.55 * saindo * ny;
      b.vx *= 0.97;
    }

    function circulo(raio, cor, traco) {
      ctx.beginPath();
      ctx.arc(0, 0, raio, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.lineWidth = traco;
      ctx.strokeStyle = TINTA;
      ctx.stroke();
    }

    function desenhar() {
      const largura = canvas.clientWidth * (window.devicePixelRatio || 1);
      if (!largura) return;
      if (canvas.width !== Math.round(largura)) {
        canvas.width = Math.round(largura);
        canvas.height = canvas.width;
      }
      const escala = canvas.width / LADO;
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.clearRect(0, 0, LADO, LADO);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "900 11px 'Roboto', Arial, sans-serif";
      for (const b of bolas) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.giro);
        circulo(RAIO_BOLA - 1, b.cor, 1.8);
        circulo(8.8, '#fff', 1.2);
        ctx.fillStyle = TINTA;
        ctx.fillText(b.numero, 0, 0.8);
        ctx.restore();
      }
    }

    function ciclo(agora) {
      const agitando = agora < agitandoAte;
      const passos = Math.min(4, Math.max(1, Math.round((agora - anterior) / 1000 / PASSO)));
      anterior = agora;
      for (let i = 0; i < passos; i += 1) simular(agitando);
      desenhar();
      const parado = !agitando && bolas.every((b) => Math.hypot(b.vx, b.vy) < 45);
      quadrosParados = parado ? quadrosParados + 1 : 0;
      // Repousa quando tudo assenta (ou 4 s após agitar), para poupar a TV.
      quadro = quadrosParados > 20 || agora > agitandoAte + 4000 ? null : requestAnimationFrame(ciclo);
    }

    function agitar(duracaoMs) {
      if (semMovimento) return;
      agitandoAte = performance.now() + duracaoMs;
      quadrosParados = 0;
      if (quadro === null) {
        anterior = performance.now();
        quadro = requestAnimationFrame(ciclo);
      }
    }

    /** Tira a bola do globo. Devolve onde ela estava, em pixels da janela. */
    function retirar(numero) {
      const caixa = canvas.getBoundingClientRect();
      const escala = caixa.width / LADO;
      const bola = bolas.find((b) => b.numero === numero) || { x: MEIO, y: MEIO };
      bolas = bolas.filter((b) => b.numero !== numero);
      assentar(semMovimento ? 120 : 0);
      return {
        x: caixa.left + bola.x * escala,
        y: caixa.top + bola.y * escala,
        diametro: 2 * RAIO_BOLA * escala,
      };
    }

    window.addEventListener('resize', desenhar);
    return { definirBolas, agitar, retirar, desenhar };
  }

  return { criar };
})();
