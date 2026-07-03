export function carregaAtualiza() {
    const musica = JSON.parse(localStorage.getItem("musicaEditar"));
    if(musica){
        document.getElementById("nome").value = musica.nome;
        document.getElementById("duracao").value = musica.compositor;
        document.getElementById("compositor").value = musica.duracao;
    }
}

function atualizarMusica() {
    event.preventDefault();
    const musicaOriginal = JSON.parse(localStorage.getItem("musicaEditar"));
    const musicaAtualizada = {
        id: musicaOriginal.id,
        nome: document.getElementById("nome").value.trim(),
        duracao: document.getElementById("duracao").value,
        compositor: document.getElementById("compositor").value.trim()
    };

    fetch(`http://localhost:8080/apimusica/atualizarmusica`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(musicaAtualizada)
    })
        .then(() => {
            alert("Música atualizada com sucesso!");
            localStorage.removeItem("musicaEditar");
            window.location.href = "./../listaMusicas.html";
        })
        .catch(error => console.error(error));
}

carregarHome();