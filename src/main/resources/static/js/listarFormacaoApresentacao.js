
let repertorio;
const idApresentacao = localStorage.getItem("id");
localStorage.clear();


async function carregarTudo() {
    try {
        const resRepertorio = await fetch("/apirepertorio/get?idApresentacao=" + idApresentacao);
        if (!resRepertorio.ok)
            throw new Error(`Erro Repertório: HTTP ${resRepertorio.status}`);
        repertorio = await resRepertorio.json();
        renderizar(repertorio);

    } catch (error) {
        console.error("Execução sequencial interrompida:", error.message);
    }
}

function renderizar(Repertorio) {
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    if(Repertorio.listaFormacao.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">Nenhuma formação encontrada.</div>`;
        return;
    }
    for (let i = 0; i < Repertorio.listaFormacao.length; i++) {
        container.innerHTML += `
        <div class="col">
           <div class="formation-card h-100 shadow-sm position-relative overflow-hidden rounded-4" 
                 onclick="abreEditarFormacao(${Repertorio.listaFormacao[i].forma_id})" 
                 style="cursor: pointer;">
                <!-- Linha superior de destaque -->
                <div class="position-absolute top-0 start-0 w-100" style="height: 4px; background: linear-gradient(90deg, var(--taiko-red), var(--taiko-gold));"></div>
                
                <div class="p-4 d-flex flex-column h-100 position-relative z-1">                   
                  <h4 class="font-display fw-bold mb-1" style="color: var(--taiko-ink);">${Repertorio.listaFormacao[i].forma_nome}</h4>
                    <p class="text-muted small mb-4 d-flex align-items-center fw-medium">
                        <i class="bi bi-music-note-beamed me-2 fs-6 text-taiko-red"></i> ${Repertorio.listaMusica[i].nome || 'Sem Música'}
                    </p>
                </div>
                
                <!-- Ícone de fundo abstrato -->
                <div class="card-bg-icon position-absolute opacity-10" style="bottom: -15px; right: -15px; font-size: 7rem; color: var(--taiko-gold); pointer-events: none; z-index: 0;">
                    <i class="bi bi-layout-wtf"></i>
                </div>
            </div>
        </div>`;
    }
}

function abreEditarFormacao(idFormacao) {
    window.location.href = `DefinirFormação.html?idFormacao=${idFormacao}`;
}

function voltar(){
    window.location.href="./../listarApresentacao.html";
}


carregarTudo();