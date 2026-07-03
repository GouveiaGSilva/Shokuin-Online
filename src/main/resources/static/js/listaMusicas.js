let listaMusicas = [];

// Carrega músicas
function carregarMusicas() {
    fetch("http://localhost:8080/apimusica/listamusicas")
        .then(response => response.json())
        .then(data => {
            listaMusicas = data;
            renderizarTabela(listaMusicas);
        })
        .catch(error => console.error("Erro:", error));
}

// Renderiza tabela
function renderizarTabela(lista) {
    const tabela = document.getElementById("tabelaMusicas");
    tabela.innerHTML = "";

    lista.forEach(musica => {
        const linha = `
            <tr>
                <td>${musica.nome}</td>
                <td>${musica.compositor}</td>
                <td>${musica.duracao}</td>
                <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center"><button type="button" class="btn btn-alterar px-4 fw-bold" onclick="carregaAtualiza(${musica.id})" data-bs-toggle="modal" data-bs-target="#editModal" title="Editar">Alterar</button><button type="button" class="btn btn-excluir px-4 fw-bold" onclick="deletarMusica(${musica.id})">Excluir</button></div>
                </td>
            </tr>
        `;
        tabela.innerHTML += linha;
    });
}

// Filtro de busca
function filtrarMusicas() {
    const termo = document.getElementById("busca").value.toLowerCase();
    if (termo !== "") {
        fetch(`http://localhost:8080/apimusica/pesquisarmusica?nome=${encodeURIComponent(termo)}`, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Erro na busca");
                return response.json();
            })
            .then(data => {
                renderizarTabela(data);
            })
            .catch(error => console.error(error));
    } else
        renderizarTabela(listaMusicas);
}

// Deletar música
function deletarMusica(id) {
    //alert(id);
    if (confirm("Tem certeza que deseja excluir?")) {
        fetch(`http://localhost:8080/apimusica/deletarmusica/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) throw new Error("Erro ao deletar");
                carregarMusicas(); // recarrega lista
            })
            .catch(error => console.error(error));
    }
}

function carregaAtualiza(id) {
    const musica = listaMusicas.find(m => m.id === id);
    if (musica) {
        document.getElementById("editNome").value = musica.nome;
        document.getElementById("editCompositor").value = musica.duracao;
        document.getElementById("editDuracao").value = musica.compositor;
        localStorage.setItem("musicaEditar", JSON.stringify(musica));
    }
}

function atualizarMusica() {
    event.preventDefault();
    const musicaOriginal = JSON.parse(localStorage.getItem("musicaEditar"));
    const musicaAtualizada = {
        id: musicaOriginal.id,
        nome: document.getElementById("editNome").value.trim(),
        duracao: document.getElementById("editDuracao").value.trim(),
        compositor: document.getElementById("editCompositor").value.trim()
    };

    fetch(`http://localhost:8080/apimusica/atualizarmusica`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(musicaAtualizada)
    })
        .then(() => {
            localStorage.removeItem("musicaEditar");
            window.location.reload();
        })
        .catch(error => console.error(error));
}

function adicionarMusica() {
    let nome = document.getElementById("addNome").value.trim();
    let duracao = document.getElementById("addDuracao").value.trim();
    let compositor = document.getElementById("addCompositor").value.trim();

    // Validação dos campos
    if (!nome || !duracao || !compositor) {
        alert("Preencha todos os campos!");
        return; // interrompe a execução
    }

    // Ajuste da duração
    if (duracao.length === 5) { // HH:MM
        duracao += ":00";
    }

    const musica = {
        nome: nome,
        duracao: duracao,
        compositor: compositor,
    };

    console.log(musica);
    // envio para o backend
    fetch("http://localhost:8080/apimusica/cadmusicas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(musica)
    })
        .then(data => {
            alert("Música cadastrada com sucesso!");
        })
    alert("Música cadastrada com sucesso!");
    window.location.reload();
}



// carrega automaticamente ao abrir a página
carregarMusicas();