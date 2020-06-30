function gerarCartela(){
    var tableSpace = document.getElementById("div-cartela");
    tableSpace.innerHTML = "";
    var table = document.createElement('table');
    var tr;
    var td;
    var num; 
    var numArr = [];
    tr = document.createElement('tr');
    tr.innerHTML= '<th> R </th><th> O </th><th> G </th><th> E </th><th> R </th>';
    table.appendChild(tr);
    for ( let i = 0; i < 5; i++){
        tr = document.createElement('tr');
        for ( let j = 0; j < 5; j++){
            num = gerarNumeroAleatorio(75);
            if(numArr.indexOf(num) > -1 || num == 0){
                j--;
            }
            else{
                numArr.push(num);
                td = document.createElement('td');
                td.addEventListener("click",function(){
                    this.style = "background-color: lime"
                });
                if(numArr.length == 13){
                    td.innerHTML += "<h1> ROGER </h1>";
                }
                else{
                    
                    td.innerHTML += "<h1> "+ num + "</h1>";
                }
                tr.appendChild(td);
            }
            
        }
        table.appendChild(tr);
    }  
    tableSpace.appendChild(table);
    
    document.getElementById("gerar").setAttribute("disabled","disabled");
}