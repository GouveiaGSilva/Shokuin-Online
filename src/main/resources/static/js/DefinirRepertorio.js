
let listaMusica = [];
let listaFormacao = [];
let qtdeLinhas = 1;
const idApresentacao = localStorage.getItem('id');

if (!idApresentacao || idApresentacao === "undefined" || idApresentacao === "null") {
    alert("Apresentação não identificada. Por favor, selecione-a novamente.");
    window.location.href = "listarApresentacao.html";
}

let isEdicao = false;

function adicionarLinha() {
    const lista = document.getElementById('lista-repertorio');
    const itens = lista.getElementsByClassName('repertorio-item');
    const novaLinha = itens[0].cloneNode(true);
    const selects = novaLinha.querySelectorAll('select');
    
    // Reseta o select da Musica
    selects[0].value = "";
    
    // Reseta e desabilita o select da Formacao
    selects[1].innerHTML = '<option value="" selected disabled>Selecione a Música primeiro</option>';
    selects[1].disabled = true;
    
    const btnRemover = novaLinha.querySelector('.btn-remover');
    if (btnRemover) {
        btnRemover.classList.remove('d-none');
    }
    lista.appendChild(novaLinha);
}

function removerLinha(botao) {
    botao.closest('.repertorio-item').remove();
}

function salvarRepertorio() {
    const lista = document.getElementById('lista-repertorio');
    let itens = lista.getElementsByClassName('repertorio-item');
    let flag = true;
    let listaidMusica = [];
    let listaidFormacao = [];
    for(let i = 0; i < itens.length && flag; i++) {
        const selects = itens[i].querySelectorAll('select');
        let idMusica = selects[0].value;
        let idFormacao = selects[1].value;
        if(!idMusica || !idFormacao)
            flag = false;
        else{
            listaidMusica.push(parseInt(idMusica));
            listaidFormacao.push(parseInt(idFormacao));
        }
    }
    if(flag){
        let params = new URLSearchParams();
        //logica pra pegar o id
        // localStorage.clear(); // Mantém o ID da apresentação
        params.append('idApresentacao', parseInt(idApresentacao));
        listaidMusica.forEach(id => params.append('listaMusica', id));
        listaidFormacao.forEach(id => params.append('listaFormacao', id));
        let url = isEdicao ? "/apirepertorio/atualizarepertorio" : "/apirepertorio/cadrepertorio";
        let metodo = isEdicao ? "PUT" : "POST";
        fetch(url, {
            method: metodo,
            body: params
        })
            .then(async response => {
                const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
                const p = document.getElementById("msg");
                const span = document.getElementById("subtitulo");
                if (response.ok) {
                    span.innerText = "Sucesso";
                    p.innerText = "Repertório salvo com sucesso!";
                    
                    // Sobrescrevemos o onclick do botão fechar para não usar finalizarCadastro() vazio,
                    // e sim navegar para a definição de Membros passando o ID
                    const btnFechar = document.querySelector("#modalMsg .btn-taiko");
                    btnFechar.onclick = function() {
                        localStorage.setItem('id', idApresentacao);
                        window.location.href = "DefinirMembrosApresentacao.html";
                    };
                    
                    modal.show();
                } else {
                    const erroObjeto = await response.json();
                    let msg = erroObjeto.erro;

                    if (msg.includes("Onde:")) {
                        msg = msg.split("Onde:")[0];
                    }
                    msg = msg.replace("ERROR:", "").trim();
                    span.innerText = "Erro";
                    p.innerText = "Erro: "+ erroObjeto.mensagem +"\n"+ msg;
                    modal.show();
                }
            })
            .catch(error => {
                alert(error.message);
            })
    }else{
        alert("Preencha todos os campos");
    }
}

function limparRepertorio() {
    document.getElementById('formRepertorio').reset();
    const lista = document.getElementById('lista-repertorio');
    while (lista.children.length > 1) {
        lista.removeChild(lista.lastChild);
    }
}

function carregarSelectMusica(){
    fetch("/apimusica/listamusicas")
        .then(response => response.json())
        .then(data => {
            listaMusica = data;
            renderizarSelectMusica(listaMusica);
            carregarFormacoes();
        })
        .catch(error => renderizarSelectMusica(null));
}

function renderizarSelectMusica(lista) {
    const select = document.getElementById('selectMusica');
    select.innerHTML = '';
    if(!lista){
        select.innerHTML = `<option value="" selected disabled>Nenhuma musica</option>`
    }
    else {
        select.innerHTML = `<option value="" selected disabled>Selecione</option>`
        lista.forEach(musica => {
            const option = `
            <option value="${musica.id}">${musica.nome}</option>
        `
            select.innerHTML += option
        })
    }
}


function renderizarSelectFormacao(lista){
    const select = document.getElementById('selectFormacao');
    select.innerHTML = '';
    if(!lista){
        select.innerHTML = `<option value="" selected disabled>Nenhuma Formacao</option>`
    }
    else {
        select.innerHTML = `<option value="" selected disabled>Selecione</option>`
        lista.forEach(formacao => {
            const option = `
            <option value="${formacao.forma_id}">${formacao.forma_nome}</option>
        `
            select.innerHTML += option
        })
    }
}

function carregarFormacoes(){
    fetch('/formacao/listar-todas')
        .then(res => res.json())
        .then(lista => {
            listaFormacao = lista;
            renderizarSelectFormacao(listaFormacao);
            carregarRepertorioExistente();
        })
        .catch(err => renderizarSelectFormacao(null));
}

function carregarRepertorioExistente() {
    if(!idApresentacao || idApresentacao === "undefined" || idApresentacao === "null") return;
    fetch("/apirepertorio/get?idApresentacao=" + idApresentacao)
        .then(response => {
            if(response.ok) return response.json();
            throw new Error("Não encontrado");
        })
        .then(data => {
            if(data && data.listaMusica && data.listaMusica.length > 0) {
                isEdicao = true;
                const lista = document.getElementById('lista-repertorio');
                let itens = lista.getElementsByClassName('repertorio-item');
                while (itens.length > 1) {
                    lista.removeChild(lista.lastChild);
                }
                for(let i = 0; i < data.listaMusica.length - 1; i++){
                    adicionarLinha();
                }
                itens = lista.getElementsByClassName('repertorio-item');
                for(let i = 0; i < data.listaMusica.length; i++) {
                    const selects = itens[i].querySelectorAll('select');
                    selects[0].value = data.listaMusica[i].id;
                    selects[1].value = data.listaFormacao[i].forma_id || data.listaFormacao[i].id;
                }
            }
        })
        .catch(e => console.log("Sem repertório prévio"));
}

function voltar(){
    var flag = localStorage.getItem('flag');
    // localStorage.clear();
    if(flag === 'D') {
        localStorage.setItem('id', idApresentacao);
        window.location.href="definirApresentacao.html";
    }else {
        window.location.href = "listarApresentacao.html";
    }
}

function finalizarCadastro() {
    const subtitulo = document.getElementById("subtitulo").innerText;
    if (subtitulo === "Sucesso") {
        localStorage.setItem('id', idApresentacao);
        window.location.href = "DefinirMembrosApresentacao.html";
    }
    // Em caso de erro, apenas fecha o modal e mantém o usuário na tela
}

function aoSelecionarMusica(elementoSelect) {
    const linha = elementoSelect.closest('.repertorio-item');
    const selects = linha.querySelectorAll('select');
    const selectFormacao = selects[1];

    if (selectFormacao) {
        selectFormacao.disabled = false;
    }

    const idMusicaSelecionada = parseInt(elementoSelect.value);
    
    // Filtrar formações que pertencem a esta música
    const formacoesValidas = listaFormacao.filter(f => f.musi_id && f.musi_id.id === idMusicaSelecionada);

    selectFormacao.innerHTML = `<option value="" selected disabled>Selecione a Formação</option>`;
    if (formacoesValidas.length === 0) {
        selectFormacao.innerHTML = `<option value="" selected disabled>Nenhuma Formação para esta música</option>`;
    } else {
        formacoesValidas.forEach(formacao => {
            selectFormacao.innerHTML += `<option value="${formacao.forma_id}">${formacao.forma_nome}</option>`;
        });
    }
}

carregarSelectMusica();
