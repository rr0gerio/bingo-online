var numArr = [];
var table = document.createElement('table');
var tr = document.createElement('tr');

function gerarTabelaSorteio(){
    if(numArr.length == 0 || numArr.length%5 == 0){
        tr = document.createElement('tr');
    }
    if(numArr.length == 75 ){
        document.getElementById("sortear").setAttribute("disable","disable");
        return;
    }
    var tableSpace = document.getElementById("div-cartela");
    //tableSpace.innerHTML = "";
    var td;
    var num; 
    
    
    num = gerarNumeroAleatorio(76);
    if(numArr.length != 75 && numArr.indexOf(num) > -1 || num == 0){
        gerarTabelaSorteio();
    }
    else{
        numArr.push(num);
        td = document.createElement('td');
        td.innerHTML += "<h1> "+ num + "</h1>";
        tr.appendChild(td);
    }
    
    
    table.appendChild(tr);
    
    tableSpace.appendChild(table);
    if(numArr.length == 75){
        document.getElementById("sortear").setAttribute("disabled","disabled");
    }
}