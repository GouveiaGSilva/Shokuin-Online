const form = document.forms[0];
const url = "/"
const pesquisa = document.getElementById("pesquisar");
const btPesquisar = document.getElementById("btPesquisar");
if(pesquisa != null)
    pesquisa.addEventListener("keyup", pesquisarMembros);
if(btPesquisar != null)
    btPesquisar.addEventListener("click", pesquisarMembros);

if(form) {
    form.onsubmit = valida;
    if (form.id === "formAtualizacao")
        constroiSelect();
}
else{
    constroiTabela("");
}

function valida(event){
    let valido = form.checkValidity();
    let flag = false;
    event.preventDefault();
    adicionaValidacao(valido, event, flag);
    if(!flag) {
        if(form.id === "formCadastro")
            cadastrarCargo();
        else if(form.id === "formAtualizacao")
            atualizarCargo();
    }
}

function pesquisarMembros(event) {
    const key = event.keyCode;
    if((key>= 48 && key<=57) || (key>=65 && key<=90) || (key>=97 && key<=122) || key===8 || key===13)
        constroiTabela(pesquisa.value);
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

async function constroiTabela(keyword){
    const resp = await fetch(url + "apimembro/getMembro?keyword="+keyword);
    const tabela = document.getElementById("tabela");
    const tbody = document.getElementById("resultado");
    tbody.innerHTML = "";
    if(resp.ok){
        const dados = await resp.json();
        console.log("Olha o que chegou do Java:", dados); //
        for(let obj of dados){
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${obj.nome}</td>
                <td>${obj.cargo}</td>
                <td>${obj.cpf}</td>
                <td>${obj.sexo}</td>
                <td><button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModalCenter" onclick="setarMembro(${obj.id})">❌</button></td>
            `;
            tbody.appendChild(tr);
            tabela.appendChild(tbody);
        }
    }
    else{
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='3'>Sem resultados</td>"
        tbody.appendChild(tr);
        tabela.appendChild(tbody);
    }
}

function excluirMembro(id){
    const membro = {
        id: id,
        nome: "",
        sexo: "",
        cargo: -1,
        endereco: "",
        idade: -1
    };

    const data = {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(membro)
    };

    fetch(`/apimembro/excluirMembro/${id}`, data)
        .then(resp => {
            if(resp.ok){
                constroiTabela("");
            }
        });
}

function setarMembro(id){
    document.getElementById("btConfirma").setAttribute("onclick", `excluirMembro(${id})`);
}

