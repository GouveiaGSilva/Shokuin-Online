const form = document.forms[0];
const url = "/"
const pesquisa = document.getElementById("pesquisar");
if(pesquisa != null){
    pesquisa.addEventListener("keyup", pesquisarCargos);
    constroiTabela("");
}

if(form) {
    form.onsubmit = valida;
    if(form.id === 'formAtualizacao')
        document.forms[1].onsubmit = valida;
}

function valida(event, id){
    let valido;
    let flag = false;
    event.preventDefault();
    let elementoID = event.target.id;
    if(elementoID === "formCadastro" && form.id === "formAtualizacao")
        valido = document.forms[1].checkValidity();
    else
        valido = form.checkValidity();
    adicionaValidacao(valido, event, flag);
    if(!flag) {
        if(elementoID === "formCadastro")
            cadastrarCargo();
    }
}

function pesquisarCargos(event) {
    constroiTabela(pesquisa.value);
}

function atualizarCargo(id) {
    const formData = {method: "PUT", body: new FormData(form)};
    let sucesso = false;
    removeMensagem();
    fetch(url + "cargos/atualizar-cargo?id="+id, formData)
        .then(response => {
            if(response.ok) {
                sucesso = true;
                removeValidacao();
                constroiTabela("");
            }
            return response.text();
        })
        .then(texto => {
            exibeMensagem(texto, sucesso, "alt");
        })
}

function excluirCargo(id){
    const cargo = {};
    cargo.id = id;
    cargo.nome = "";
    cargo.funcao = "";
    const data = { method: "DELETE", headers: {"Content-Type": "application/json"},
        body: JSON.stringify(cargo)
    };
    fetch(url + "cargos/excluir-cargo", data)
        .then(resp => {
            if(resp.ok){
                constroiTabela("");
            }
        })
}

function adicionaValidacao(valido, event, flag){
    var listaElementos = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(listaElementos)
        .forEach(function (form) {
            if (!valido) {
                flag = true;
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        })
}

function removeValidacao(){
    var listaElementos = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(listaElementos)
        .forEach(function (form) {
            form.classList.remove('was-validated')
        })
}

async function constroiSelect(){
    const select = document.getElementById("cargoAntigo");
    const filtro = "";
    if(select.children.length > 0)
        select.innerHTML = '<option disabled selected label="Selecione um cargo" hidden></option>';
    const response = await fetch(url + "cargos/get-cargos?keyword="+filtro);
        if(response.ok) {
            const array = await response.json();
            for(const obj of array){
                const op = document.createElement("option");
                op.innerText = obj.nome;
                op.name = obj.id;
                select.appendChild(op);
            }
        }
        else
            exibeMensagem("sem cargos", false, "");
}

async function constroiTabela(keyword){
    const resp = await fetch(url + "cargos/get-cargos?keyword="+keyword);
    const tabela = document.getElementById("tabela");
    const tbody = document.getElementById("resultado");
    tbody.innerHTML = "";
    if(resp.ok){
        const dados = await resp.json();
        for(const obj of dados){
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${obj.nome}</td>
                <td>${obj.funcao}</td>
                <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center"><button type="button" class="btn btn-alterar px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#alterar" onclick="exibeAlterar(${obj.id})">Alterar</button><button type="button" class="btn btn-excluir px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#excluir" onclick="exibeExcluir(${obj.id})">Excluir</button></div>
                </td>
            `;
            tbody.appendChild(tr);
            tabela.appendChild(tbody);
        }
    }
    else{
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='3' style='text-align: center'>Sem resultados</td>"
        tbody.appendChild(tr);
        tabela.appendChild(tbody);
    }

}

async function exibeAlterar(id){
    const cargo = document.getElementById("cargo");
    const funcao = document.getElementById("funcao");
    const resp = await fetch(url+"cargos/get-cargo-id?id="+id);
    if(resp.ok){
        const dados = await resp.json();
        cargo.value = dados.nome;
        funcao.value = dados.funcao;
        document.getElementById("btConfirmaAlterar").setAttribute("onclick", `atualizarCargo(${id})`);
    }
}

function exibeExcluir(id){
    document.getElementById("btConfirma").setAttribute("onclick", `excluirCargo(${id})`);
}

function cadastrarCargo(){
    let formCad = form;
    if(form.id === 'formAtualizacao')
        formCad = document.forms[1];
    const formData = {method: "POST", body: new FormData(formCad)};
    let sucesso = false;
    removeMensagem();
    fetch(url + "cargos/cadastrar-cargo", formData)
        .then(response => {
            if(response.ok) {
                sucesso = true;
                removeValidacao();
                formCad.reset();
                if(form.id === 'formAtualizacao')
                    constroiTabela("");
            }
            return response.text();
        })
        .then(texto => {
            exibeMensagem(texto, sucesso, "cad");
        })
}

function removeMensagem(){
    const result = document.getElementById("result");
    if(result != null)
        result.remove();
}

function exibeMensagem(texto, sucesso, tipo){
    let auxForm;
    if(form.id === "formAtualizacao" && tipo === "cad")
        auxForm = document.forms[1];
    else
        auxForm = form;
    let tempo = 5000;
    let mensagem = texto;
    let div = document.createElement('div');
    let h4 = document.createElement('h4');
    let elemento;
    let br = document.createElement('br');
    br.id = 'br';
    div.role = "alert";
    div.id = "result";
    h4.className = "\\alert-heading\\";
    if(sucesso){
        elemento = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>`;
        div.className = "alert alert-success d-flex align-items-center";
    }
    else{
        if(mensagem.includes("duplic"))
            mensagem = "Erro, cargo já cadastrado.";
        else if(mensagem.includes("sem cargos")) {
            mensagem = "Erro, nenhum cargo cadastrado.";
            tempo = 0;
        }
         else
             mensagem = "Ocorreu algum erro.";
        elemento = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>`;
        div.className = "alert alert-danger d-flex align-items-center";
    }
    h4.innerHTML = `${mensagem}`;
    div.appendChild(new DOMParser().parseFromString(elemento, 'text/html').body.firstChild);
    div.appendChild(h4);
    auxForm.appendChild(br);
    auxForm.appendChild(div);
    if(tempo > 0)
        setTimeout(() => {
            div.remove();
            br.remove();
        }, tempo);
}
