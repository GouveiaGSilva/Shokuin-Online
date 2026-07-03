let combox = document.getElementById("opInstrumentos");
let comboxF = document.getElementById("opFornecedores");
let idI;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let nome = urlParams.get('nome'); // "10"

async function carregarInstrumento(nome){
   await fetch("http://localhost:8080/apiInstrumento/listarInstrumentos?chave=")
        .then(response => {
            if (response.status === 200)
                return response.json()
                    .then(json => {
                        for(instrumento of json){
                            let elemen = document.getElementById("op"+instrumento.nome)
                            if(name = elemen){
                                elemen.selected = true;
                                document.getElementById("nomeInstrumento").value = nome;
                                let fornecedor = getfornecedor(instrumento.id)
                                let comboxFornecedor = document.getElementById(instrumento.idFornecedores)
                                comboxFornecedor.selected = true;
                                idI = instrumento.id;
                            }
                        }
                    })
        })
    let linha = "<option disabled selected></option>"
}

async function atualizarInstrumentos(){
    let nome = document.getElementById("nomeInstrumento").value;
    let idF = document.getElementById("opFornecedores").value;
    const instrumento = {
        nome : nome,
        idFornecedores: parseInt(idF),
        id : idI,
    };
    console.log(instrumento)
    const requestOptions = { method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify(instrumento)}
    let flag = await validaInstrumento(nome)
    if(flag){
        fetch("http://localhost:8080/apiInstrumento/atualizaInstrumento",requestOptions)
            .then(resp =>{
                if(resp.ok)
                    return resp.json()
                        .then(data =>{
                            document.getElementById("formInstrumento").reset();
                            alert(data.nome + " atualizado com sucesso!")
                            //window.location.href = "HomeFornecedor.html"
                        })
            })
            .catch(Error => alert("Erro ao atualizar o Instrumento!"))
    }
    else{
        alert("impossivel atualizar, Instrumento já cadastrado com esse nome");
    }
}

async function validaInstrumento(nome){
    let validacao = true;
    await fetch("http://localhost:8080/apiInstrumento/listarInstrumentos?chave="+nome)
        .then(resp =>{
            if (resp.ok)
                return resp.json()
                    .then(data=>{
                        for (instrumento of data){
                            console.log(instrumento.nome + " = " + nome);
                            if(nome === instrumento.nome)
                                validacao = false;
                        }
                    })
        })
    return validacao;
}

function procurarInstrumentos(nome) {
    fetch("http://localhost:8080/apiInstrumento/listarInstrumentos?chave="+nome)
        .then(response => {
            if (response.status === 200)
                return response.json()
                    .then(json => {
                        combox.innerHTML = alimentaCombox(json)
                    })
        })
}

function alimentaCombox(json){
    let linha = "<option disabled selected>selecione um Instrumento</option>";
    console.log(json)
    if(json.length > 0){
        for(instrumento of json){
            linha += `
            <option id="op${instrumento.nome}" value="${instrumento.nome}" >${instrumento.nome}</option>`
        }
    }
    else {
        linha = "<option  value='null' disabled selected>nenhum Instrumento Cadastrado</option>";
    }
    return linha
}

if(nome === null){
    nome = "";
    procurarInstrumentos(nome);
}
else{
    procurarInstrumentos(nome);
    carregarInstrumento(nome);
}

function procuraFornecedores() {
    fetch("http://localhost:8080/apiFornecedor/listar-fornecedor")
        .then(response => {
            if (response.status === 200)
                return response.json()
                    .then(json => {
                        comboxF.innerHTML = alimentaComboxF(json)
                    })
        })
}
function alimentaComboxF(json){
    let linha = "<option disabled selected>selecione um fornecedor</option>";
    for(fornecedor of json){
        linha += `
        <option id="${fornecedor.id}" value="${fornecedor.id}" >${fornecedor.nome}</option>`
    }
    return linha
}

async function getfornecedor(id){
    let fornecedor = null;
    await fetch("http://localhost:8080/apiFornecedor/buscar-id?id="+id)
        .then(resp =>{
            if (resp.ok)
                return resp.json()
                    .then(data => fornecedor = data )
        })
        .catch(Error => alert("Erro ao encontra Fornecedor"))
    console.log(fornecedor);
    return fornecedor;
}

procuraFornecedores();
