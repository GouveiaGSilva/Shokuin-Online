const idApresentacao = localStorage.getItem('id');
let todosMembros = [];
let membrosVinculados = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!idApresentacao || idApresentacao === "undefined" || idApresentacao === "null") {
        alert("Apresentação não identificada. Por favor, selecione-a novamente.");
        window.location.href = 'listarApresentacao.html';
        return;
    }
    await carregarMembros();
});

async function carregarMembros() {
    try {
        const respMembros = await fetch("http://localhost:8080/apimembro/get-membro");
        if (respMembros.ok) {
            todosMembros = await respMembros.json();
        }
        const respVinculados = await fetch(`http://localhost:8080/apresentacao/membros-vinculados?id=${idApresentacao}`);
        if (respVinculados.ok) {
            membrosVinculados = await respVinculados.json();
        }
        renderizarMembros();
    } catch (error) {
        console.error("Erro ao carregar dados dos membros:", error);
        mostrarErro("Erro de Comunicação", "Não foi possível carregar a lista de membros.");
    }
}

function renderizarMembros() {
    const container = document.getElementById('lista-membros');
    container.innerHTML = '';
    if (!todosMembros || todosMembros.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted p-4">Nenhum membro cadastrado no sistema.</div>`;
        return;
    }
    todosMembros.forEach(membro => {
        const isVinculado = membrosVinculados.includes(membro.id);
        
        const cardHTML = `
        <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 4px solid ${isVinculado ? 'var(--taiko-gold)' : '#e5e7eb'} !important; transition: all 0.3s ease;">
                <div class="card-body d-flex align-items-center justify-content-between p-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #f3f4f6; color: var(--taiko-ink);">
                            <i class="bi bi-person-fill fs-5"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold text-dark">${membro.nome}</h6>
                        </div>
                    </div>
                    <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input chk-membro cursor-pointer" type="checkbox" role="switch" value="${membro.id}" ${isVinculado ? 'checked' : ''} style="cursor: pointer;">
                    </div>
                </div>
            </div>
        </div>`;
        
        container.innerHTML += cardHTML;
    });
    document.querySelectorAll('.chk-membro').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const card = e.target.closest('.card');
            if (e.target.checked) {
                card.style.setProperty('border-left', '4px solid var(--taiko-gold)', 'important');
            } else {
                card.style.setProperty('border-left', '4px solid #e5e7eb', 'important');
            }
        });
    });
}

async function salvarParticipantes() {
    const checkboxes = document.querySelectorAll('.chk-membro:checked');
    const selecionados = Array.from(checkboxes).map(chk => parseInt(chk.value));
    try {
        const response = await fetch(`http://localhost:8080/apresentacao/salvar-membros?id=${idApresentacao}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selecionados)
        });
        if (response.ok) {
            mostrarSucesso("Sucesso", "Participantes vinculados com sucesso à apresentação!");
        } else {
            const err = await response.text();
            mostrarErro("Erro", err || "Não foi possível salvar os participantes.");
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        mostrarErro("Erro", "Falha de comunicação com o servidor.");
    }
}

function mostrarSucesso(titulo, mensagem) {
    document.getElementById("subtitulo").innerText = titulo;
    document.getElementById("msg").innerText = mensagem;
    const iconContainer = document.querySelector("#modalMsg .bg-taiko-red");
    if(iconContainer) {
        iconContainer.className = "bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm";
        iconContainer.innerHTML = '<i class="bi bi-check-lg fs-4"></i>';
    }
    const btnContainer = document.getElementById("modal-footer-botoes");
    if (btnContainer) {
        btnContainer.innerHTML = `
            <button type="button" class="btn btn-light px-4 fw-bold shadow-sm flex-grow-1" style="border: 1px solid #e5e7eb;" data-bs-dismiss="modal">
                <i class="bi bi-pencil"></i> OK
            </button>
            <button type="button" class="btn btn-taiko px-4 fw-bold shadow-sm flex-grow-1" onclick="irParaListagem()">
                <i class="bi bi-list-task"></i> Ir para Listagem
            </button>
        `;
    }
    const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
    modal.show();
}

function irParaListagem() {
    localStorage.clear();
    window.location.href = "listarApresentacao.html";
}

function mostrarErro(titulo, mensagem) {
    document.getElementById("subtitulo").innerText = titulo;
    document.getElementById("msg").innerText = mensagem;
    const iconContainer = document.querySelector("#modalMsg .rounded-circle");
    if(iconContainer) {
        iconContainer.className = "bg-taiko-red text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm";
        iconContainer.innerHTML = '<i class="bi bi-exclamation-triangle fs-5"></i>';
    }
    const btnContainer = document.getElementById("modal-footer-botoes");
    if (btnContainer) {
        btnContainer.innerHTML = `
            <button type="button" class="btn btn-taiko px-4 fw-bold shadow-sm w-100" data-bs-dismiss="modal">
                <i class="bi bi-check2"></i> Fechar
            </button>
        `;
    }
    const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
    modal.show();
}

function voltar() {
    localStorage.setItem('id', idApresentacao);
    window.location.href = "DefinirMusicasNaApresentacao.html";
}

function filtrarMembros() {
    const input = document.getElementById("buscaMembro");
    if (!input) return;
    const termo = input.value.toLowerCase();
    
    const container = document.getElementById('lista-membros');
    const cards = container.querySelectorAll('.col-md-6');
    
    cards.forEach(card => {
        const nomeElemento = card.querySelector('h6');
        if (nomeElemento) {
            const nome = nomeElemento.textContent.toLowerCase();
            if (nome.includes(termo)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    });
}
