document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
document.onkeydown = function(e) {
     if(e.keyCode == 123) {
         return false;
     }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
    if(e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
        return false;
    }
}
function verificaPosicao(arrayPosition){
    //trata a posicao
    arrayPosition = (arrayPosition + 1);
    //retorna posicao em funcao do resto
    return ((arrayPosition * 8) % 10)/-2 + 5;
}
function gerarNumeroAleatorio(range){
    return Math.floor(range*Math.random());
}