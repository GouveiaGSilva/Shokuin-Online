function cadastroMusicas(){
    let nome = document.getElementById("nome").value.trim();
    let duracao = document.getElementById("duracao").value.trim();
    let compositor = document.getElementById("compositor").value.trim();

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