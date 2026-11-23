// Lógica pura do Bingo — sem dependências de DOM.
// Exercida por `tests/main.test.js` via tests/helpers.js (node:test).
// No passo 4, estes mesmos nomes são reexportados por `src/js/main.js` como wrapper.
// Em produção, `src/js/main.js` passa a apenas `require('../js/logica.js')`.

/**
 * Retorna a coluna (1..5) correspondente ao índice da posição na cartela.
 * Equivalente ao código original: ((arrayPosition + 1) * 8 % 10) / -2 + 5
 * que se simplifica para (indice % 5) + 1, mantendo o ciclo 1,2,3,4,5,1,2,3,4,5,...
 * @param {number} indice - posição 0..24 (ou além, cicla a cada 5)
 * @returns {number} 1, 2, 3, 4 ou 5
 */
export function verificaPosicao(indice) {
  return ((indice % 5) + 5) % 5 + 1;
}

/**
 * Gera um número aleatório inteiro em [1, range].
 * Usa Math.random internamente; os testes substituem Math.random por meio
 * do comMathRandom helper para resultados determinísticos.
 * @param {number} range - número máximo inclusivo (ex.: 75 → devolve 1..75)
 * @returns {number} inteiro >= 1 e <= range
 */
export function gerarNumeroAleatorio(range) {
  return Math.floor(range * Math.random()) + 1;
}
