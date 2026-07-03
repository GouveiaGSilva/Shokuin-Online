

let repertorio;
const idApresentacao = localStorage.getItem('id');

if (!idApresentacao || idApresentacao === "undefined" || idApresentacao === "null") {
    alert("Apresentação não identificada. Por favor, selecione-a novamente.");
    window.location.href = "listarApresentacao.html";
}

// localStorage.clear();
let listaMusica = [];
let listaFormacao = [];


async function carregarTudo() {
    try {

        const resMusicas = await fetch("/apimusica/listamusicas");
        if (!resMusicas.ok)
            throw new Error(`Erro Músicas: HTTP ${resMusicas.status}`);
        listaMusica = await resMusicas.json();

        const resFormacoes = await fetch("/formacao/listar-todas");
        if (!resFormacoes.ok)
            throw new Error(`Erro Formações: HTTP ${resFormacoes.status}`);
        listaFormacao = await resFormacoes.json();


        const resRepertorio = await fetch("/apirepertorio/get?idApresentacao=" + idApresentacao);
        if (!resRepertorio.ok)
            throw new Error(`Erro Repertório: HTTP ${resRepertorio.status}`);
        repertorio = await resRepertorio.json();

        console.log("Tudo carregado na sequência:", repertorio);


        montarTela();

    } catch (error) {
        console.error("Execução sequencial interrompida:", error.message);
    }
}


function montarTela() {
    limparRepertorio();
    let optionsMusicas = '<option value="" disabled>Selecione a Música</option>';
    listaMusica.forEach(m => optionsMusicas += `<option value="${m.id}">${m.nome}</option>`);

    const lista = document.getElementById('lista-repertorio');
    const itens = lista.getElementsByClassName('repertorio-item');

    // Se o repertório veio vazio
    if (!repertorio || !repertorio.listaMusica || repertorio.listaMusica.length === 0) {
        // Passa null para os IDs, indicando linha vazia
        preencherLinha(itens[0], optionsMusicas, null, null);
        return;
    }

    for (let i = 0; i < repertorio.listaMusica.length; i++) {
        let Musica = repertorio.listaMusica[i];
        let Formacao = repertorio.listaFormacao[i];

        let linhaAtual;
        if (i === 0) {
            linhaAtual = itens[0];
        } else {
            linhaAtual = itens[0].cloneNode(true);
            const btnRemover = linhaAtual.querySelector('.btn-remover');
            if (btnRemover)
                btnRemover.classList.remove('d-none');
            lista.appendChild(linhaAtual);
        }

        // Chama a função atualizada, sem passar 'optionsFormacoes'
        preencherLinha(linhaAtual, optionsMusicas, Musica.id, Formacao.forma_id);
    }
}


function preencherLinha(linha, htmlMusicas, idMusicaSelecionada, idFormacaoSelecionada) {
    const selects = linha.querySelectorAll('select');

    // 1. Preenche o select de Músicas
    selects[0].innerHTML = htmlMusicas;
    if (idMusicaSelecionada) {
        selects[0].value = idMusicaSelecionada;
    }

    // 2. Preenche o select de Formações já filtrado
    const selectFormacao = selects[1];

    if (idMusicaSelecionada) {
        selectFormacao.disabled = false;

        // Aplica o mesmo filtro que você usa no 'aoSelecionarMusica'
        const formacoesValidas = listaFormacao.filter(f => f.musi_id && f.musi_id.id === parseInt(idMusicaSelecionada));

        selectFormacao.innerHTML = `<option value="" disabled>Selecione a Formação</option>`;

        if (formacoesValidas.length === 0) {
            selectFormacao.innerHTML = `<option value="" selected disabled>Nenhuma Formação para esta música</option>`;
        } else {
            formacoesValidas.forEach(formacao => {
                selectFormacao.innerHTML += `<option value="${formacao.forma_id}">${formacao.forma_nome}</option>`;
            });
        }

        // Define a formação que já estava salva no banco
        if (idFormacaoSelecionada) {
            selectFormacao.value = idFormacaoSelecionada;
        }

    } else {
        // Se for uma linha nova/vazia
        selectFormacao.innerHTML = '<option value="" selected disabled>Selecione a Música primeiro</option>';
        selectFormacao.disabled = true;
    }
}

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

function limparRepertorio() {
    document.getElementById('formRepertorio').reset();
    const lista = document.getElementById('lista-repertorio');
    while (lista.children.length > 1) {
        lista.removeChild(lista.lastChild);
    }
}

function atualizarRepertorio() {
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
        params.append('idApresentacao', idApresentacao);
        listaidMusica.forEach(id => params.append('listaMusica', id));
        listaidFormacao.forEach(id => params.append('listaFormacao', id));
        fetch("/apirepertorio/atualizarepertorio", {
            method: "PUT",
            body: params
        })
            .then(async response => {
                const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
                const p = document.getElementById("msg");
                const span = document.getElementById("subtitulo");
                if (response.ok) {
                    span.innerText = "Sucesso";
                    p.innerText = "Formações atualizadas com sucesso";
                    modal.show();
                } else {
                    const erroObjeto = await response.json();
                    let msg = erroObjeto.erro || "";
                    let mensagemPrincipal = erroObjeto.mensagem || "Erro inesperado no servidor";

                    if (msg.includes("Onde:")) {
                        msg = msg.split("Onde:")[0];
                    }
                    msg = msg.replace("ERROR:", "").trim();
                    span.innerText = "Erro";
                    p.innerText = "Erro: "+ mensagemPrincipal +"\n"+ msg;
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

function voltar(){
    window.location.href="listarApresentacao.html";
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


carregarTudo();

