var ingredientes = [];

var quantidade = parseInt(prompt("Quantos ingredientes você vai adicionar?"));

var contador = 1;

while (contador <= quantidade) {

    var ingrediente = prompt("Informe o ingrediente " + contador);

    var existe = false;

    for (var posicao = parseInt(0); posicao < ingredientes.length; posicao++) {

        if (ingredientes[posicao] == ingrediente) {
            alert("Você já digitou este ingrediente na posição: " + (posicao + 1));
            existe = true;
            break;
        }
    }

    if (existe == false) {

        ingredientes.push(ingrediente);
        contador++;
    }
}

console.log(ingredientes);