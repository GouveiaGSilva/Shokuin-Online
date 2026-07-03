const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const url = "/apresentacao";
const urlDoc = "/doc";
const urlReper = "/apirepertorio"

let idApresentacaoSelecionada = null;
let listaAg = [];

function cadastrarAgenda(id) {
    localStorage.setItem("id", id);
    window.location.href = "cadAgenda.html";
}

async function verificarLogin() {
    try {
        const response = await fetch("/apiautenticacao/usuario-atual");
        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }
        if (!response.ok) {
            throw new Error(`Erro na requisição: Status ${response.status}`);
        }
    } catch (error) {
        console.error("Erro de autenticação:", error);
        window.location.href = "/login.html";
    }
}

document.addEventListener("click", async function (event) {
    const cardClicado = event.target.closest('.event-item');
    const dropdown = document.getElementById("dropdown");
    const lista = document.getElementById("lista-agendas");

    if (cardClicado) {
        return;
    }

    if (!dropdown.contains(event.target) || event.target.classList.contains('dropdown-item')) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
    }
});

async function listarApresentacao() {
    const container = document.getElementById('lista-agendas');
    try {
        var resp = await fetch(url + "/get-all-sem-agenda");
        var listaAp = [];
        var listaAgLocal = [];

        if (resp.ok) {
            listaAp = await resp.json();
            if (listaAp.length > 0) {
                for (const ap of listaAp) {
                    var ag = {
                        localidade: ap.nome,
                        local: null,
                        Data: null,
                        Horario: null,
                        id: null,
                        status: 'N',
                        idApresentacao: ap.id,
                        statusApresentacao: ap.status
                    };
                    listaAgLocal.push(ag);
                }
            }
            const respAgenda = await fetch("/apiagenda/getagenda");
            if (respAgenda.ok) {
                const agendasAgendadas = await respAgenda.json();
                for (const ag of agendasAgendadas) {
                    ag.idApresentacao = ag.apresentacao ? ag.apresentacao.id : null;
                    try {
                        const respApIndividual = await fetch(url+"/get-byId?id="+ag.idApresentacao);
                        if (respApIndividual.ok) {
                            const apDados = await respApIndividual.json();
                            ag.statusApresentacao = apDados.status;
                        } else {
                            ag.statusApresentacao = 'I';
                        }
                    } catch (e) {
                        ag.statusApresentacao = 'I';
                    }
                }
                listaAgLocal = listaAgLocal.concat(agendasAgendadas);
            }

            if (listaAgLocal.length > 0) {
                listaAg = listaAgLocal;
                exibirAp(listaAgLocal);
            } else {
                listaAg = [];
                mostrarMensagemVazia(container, "Nenhuma apresentação encontrada.");
            }
        } else {
            mostrarMensagemVazia(container, "Algum erro ocorreu ao buscar os dados.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        mostrarMensagemVazia(container, "Erro de conexão com o servidor.");
    }
}

function filtrarApresentacoes() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const listaFiltrada = listaAg.filter(agenda => {
        return agenda.localidade && agenda.localidade.toLowerCase().includes(searchInput);
    });
    
    const container = document.getElementById('lista-agendas');
    if (listaFiltrada.length > 0) {
        exibirAp(listaFiltrada);
    } else {
        mostrarMensagemVazia(container, "Nenhuma apresentação encontrada com esse nome.");
    }
}

function mostrarMensagemVazia(container, mensagem) {
    container.innerHTML = `
        <div class="text-center p-5 text-muted">
            <i class="bi bi-calendar-x display-4 mb-3 d-block opacity-50"></i>
            <p class="mb-0">${mensagem}</p>
        </div>`;
}


async function deletarDoc(id) {
    try {
        const resp = await fetch(`${urlDoc}/deletar?id=${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (resp.ok) {
            exibirSucesso("Documento excluido com sucesso!");
        } else {
            exibirErro("Não foi possível excluir o documento!\nTente novamente mais tarde");
        }
    } catch (error) {
        exibirErro("Não possivel realizar a requição!\nTente novamente mais tarde");
    }
}


function atualizarDoc(id) {
    localStorage.setItem('id', id);
    window.location.href = 'docTxt.html';
}

async function carregarNomeAprese(id){
    const nomeA = document.getElementById("nomeA");
    try{
        const resp = await fetch(url+"/get-byId?id="+id);
        if(resp.ok){
            const dados = await resp.json();
            nomeA.value = dados.nome;
        }
        else{
            nomeA.value = "Apresentação não encontrada";
        }
    }catch (error) {
        console.error("Erro na requisição de buscar apresentação: ", error);
    }
    configurarBtnAtualizar(id);
}

async function atualizarNome(id){
    const nomeA = document.getElementById("nomeA").value;
    const apresentacao = {
        nome: nomeA
    };
    try{
        const resp = await fetch(url+"/atualizar?id="+id, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(apresentacao)
        });
        if(resp.ok){
            exibirSucesso("Nome da apresentação alterado com sucesso!");
        }
        else{
            exibirErro("Não foi possível alterar o nome da apresentação!\nTente novamente mais tarde");
        }
    }catch (error) {
        exibirErro("Não possível realizar a requisição!\nTente novamente mais tarde");
    }
}

function configurarBtnAtualizar(id){
    const btnAtualizar = document.getElementById("btnConfirmaAlterar");
    if(btnAtualizar)
        btnAtualizar.setAttribute("onclick", `atualizarNome(${id})`)

}

async function deletarApre(id){
    try{
        const resp = await fetch(url+"/excluir?id="+id, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        });
        if(resp.ok){
            exibirSucesso("Apresentação excluida com sucesso!");
        }
        else{
            exibirErro("Não foi possível excluir a apresentação!\nTente novamente mais tarde");
        }
    }catch (error) {
        exibirErro("Não foi possível realizar a requisição!\nTente novamente mais tarde");
    }
}

function configurarBtnDeletarApre(id){
    const btnDeletar = document.getElementById("btnConfirmaApre");
    if(btnDeletar)
        btnDeletar.setAttribute("onclick", `deletarApre(${id})`);
}


async function criarBotoes(id) {
    const dropdown = document.getElementById("dropdown");

    let botoesHTML = `
        <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#alterarApre" onclick="carregarNomeAprese(${id})">
            <i class="bi bi-pencil-square me-2 text-secondary"></i>Editar Nome da Apresentação
        </button>
        <button class="dropdown-item text-danger" data-bs-toggle="modal" data-bs-target="#deletarApre" onclick="configurarBtnDeletarApre(${id})">
            <i class="bi bi-trash3 me-2 text-secondary"></i>Excluir Apresentação
        </button>
    `;
    try {
        const respAp = await fetch(url + "/get-all-sem-agenda");
        if (respAp.ok) {
            const listaAp = await respAp.json();
            const naoAgendada = listaAp.some(ap => ap.id == id);
            if (naoAgendada) {
                botoesHTML += `<button onclick="cadastrarAgenda(${id})" class="dropdown-item text-primary fw-medium">
                    <i class="bi bi-calendar-plus me-2"></i>Agendar apresentação
                </button>`;
            }
            else {
                botoesHTML += `
                    <button onclick="localStorage.setItem('id', ${id}); window.location.href='exibirAgendas.html'" class="dropdown-item text-info fw-medium">
                        <i class="bi bi-calendar3 me-1"></i> Ver apresentação na agenda
                    </button>`;
            }
        }
    } catch (e) { console.error("Erro ao verificar status de agenda", e); }
    try {
        const respMusicas = await fetch(urlReper+"/getApresentacao?id="+id);
        if (respMusicas.ok) {
            botoesHTML += `
                <button onclick="localStorage.setItem('id', ${id}); window.location.href='atualizarRepertorio.html'" class="dropdown-item text-success fw-medium">
                    <i class="bi bi-music-note-list me-1"></i> Alterar Repertório
                </button>
                <button onclick="localStorage.setItem('id', ${id}); window.location.href='listarFormacoesApresentacao.html'" class="dropdown-item text-success fw-medium">
                    <i class="bi bi-columns-gap me-2"></i> Alterar Formações da Apresentação
                </button>
                <button onclick="gerarPDFFormacoesApre(${id})" class="dropdown-item text-danger fw-medium">
                    <i class="bi bi-file-earmark-pdf me-2"></i> Gerar PDF de Formações
                </button>`;
        } else {
            botoesHTML += `
                <button onclick="localStorage.clear(); localStorage.setItem('id', ${id}); localStorage.setItem('flag', 'E'); window.location.href='DefinirMusicasNaApresentacao.html'" class="dropdown-item text-warning fw-medium">
                    <i class="bi bi-music-note-beamed me-1"></i> Definir Repertório
                </button>`;
        }
    } catch (error) {
        console.error("Erro ao verificar tabela listamusicas:", error);
        botoesHTML += `
            <button onclick="localStorage.setItem('id', ${id}); window.location.href='DefinirMusicasNaApresentacao.html'" class="dropdown-item text-warning fw-medium">
                <i class="bi bi-music-note-beamed me-1"></i> Definir Repertório
            </button>`;
    }

    // Botão para Gerenciar Participantes independentemente do status
    botoesHTML += `
        <button onclick="localStorage.setItem('id', ${id}); window.location.href='DefinirMembrosApresentacao.html'" class="dropdown-item text-primary fw-medium">
            <i class="bi bi-people-fill me-2 text-primary"></i> Gerenciar Participantes
        </button>
    `;

    try {
        const respDoc = await fetch(`${urlDoc}/get-byIdAprese?id=${id}`);

        if (respDoc.ok) {
            botoesHTML += `
                <button class="dropdown-item" onclick="atualizarDoc(${id})">
                    <i class="bi bi-file-earmark-arrow-up me-2 text-dark"></i>Atualizar Documento
                </button>
                <button class="dropdown-item text-danger" data-bs-toggle="modal" data-bs-target="#deletarDoc" onclick="configurarModalDeletar(${id})">
                    <i class="bi bi-file-earmark-x me-2"></i>Excluir Documento
                </button>
            `;
        } else {
            botoesHTML += `
                <button class="dropdown-item" onclick="localStorage.setItem('id', ${id}); window.location.href='docTxt.html'">
                    <i class="bi bi-file-earmark-plus me-2 text-dark"></i>Criar Documento
                </button>
            `;
        }
    } catch (error) {
        console.error("Erro ao verificar documento:", error);
    }
    dropdown.innerHTML = botoesHTML;
}


function configurarModalDeletar(id) {
    const btnConfirma = document.getElementById("btConfirma");
    if(btnConfirma) {
        btnConfirma.setAttribute("onclick", `deletarDoc(${id})`);
    }
}

function exibirDrop(event) {
    event.stopPropagation();

    const cardClicado = event.target.closest('.event-item');
    if (!cardClicado) return;

    idApresentacaoSelecionada = cardClicado.getAttribute("id");

    const dropdown = document.getElementById("dropdown");
    dropdown.style.display = "block";
    dropdown.style.left = event.clientX + "px";
    dropdown.style.top = event.clientY + "px";

    dropdown.innerHTML = `<span class="dropdown-item text-muted small"><i class="bi bi-hourglass-split"></i> Carregando...</span>`;

    criarBotoes(idApresentacaoSelecionada);
}

function exibirAp(listaAgendas) {
    const container = document.getElementById('lista-agendas');
    container.innerHTML = '';

    if (!listaAgendas || listaAgendas.length === 0) {
        mostrarMensagemVazia(container, "Nenhuma apresentação encontrada para esta data.");
        return;
    }

    listaAgendas.forEach(agenda => {
        let status;
        let statusColorClass;
        let cardHTML = '';
        let compTexto = "Incompleto";
        let compColor = "bg-warning text-dark"; // Amarelo suave
        let bgStyle = "background-color: #ffffff;";
        let iconStatus = "bi-exclamation-circle";

        if (agenda.statusApresentacao === 'C') {
            compTexto = "Completo";
            compColor = "bg-success text-white"; // Verde para completo
            iconStatus = "bi-check-circle-fill";
        }

        let mesAbrev = "N/A";
        let dia = "-";
        let horarioFormatado = "--:--";
        let localTexto = "-";
        let cardSideColor = "var(--taiko-gold)"; // Dourado padrão no lugar de vermelho

        if (agenda.status === 'N') {
            status = "Sem Agenda";
            statusColorClass = 'text-warning bg-light border-warning border';
            cardSideColor = "var(--taiko-gold)";
        } else {
            const [ano, mesStr, d] = agenda.Data.split('-');
            mesAbrev = meses[parseInt(mesStr) - 1].substring(0, 3);
            dia = d;
            horarioFormatado = agenda.Horario ? agenda.Horario.substring(0, 5) : '--:--';
            localTexto = agenda.local ? agenda.local.rua : '-';

            if (agenda.status === 'A') {
                status = "Agendado";
                statusColorClass = 'bg-success bg-opacity-10 text-success border-success border'; // Verde para agendado
                cardSideColor = "#198754"; // Verde da marcação lateral
            } else if (agenda.status === 'C') {
                status = "Cancelado";
                statusColorClass = 'bg-danger bg-opacity-10 text-danger border-danger border'; // Mantém um pouco de vermelho aqui pois é erro/cancelado
                cardSideColor = "#dc3545";
            } else if (agenda.status === 'F') {
                status = "Finalizado";
                statusColorClass = 'bg-secondary bg-opacity-10 text-secondary border-secondary border';
                cardSideColor = "#6c757d";
            }
        }

        cardHTML = `
        <div class="col-12 mb-3">
            <div class="card border-0 rounded-4 event-item position-relative overflow-hidden shadow-sm" 
                 style="${bgStyle} cursor: pointer;"
                 onmouseover="this.style.transform='translateY(-3px)';" 
                 onmouseout="this.style.transform='translateY(0)'; "
                 role="button"
                 aria-label="Ver detalhes"
                 id="${agenda.idApresentacao}"
                 onclick="exibirDrop(event)"
                 >
                <!-- Decoração lateral dinâmica baseada no status -->
                <div class="position-absolute top-0 start-0 h-100" style="width: 5px; background-color: ${cardSideColor};"></div>
                
                <div class="card-body p-3 d-flex flex-column flex-xl-row align-items-xl-center ms-2 gap-3">
                    
                    <!-- Cabeçalho do Card (Status + Data) -->
                    <div class="d-flex flex-column text-center pe-xl-3 border-end" style="min-width: 120px;">
                        <span class="fw-bold text-uppercase d-block mb-1" style="color: ${cardSideColor}; font-size: 0.75rem; letter-spacing: 0.1em;">${mesAbrev}</span>
                        <span class="font-display fs-3 fw-bold text-dark d-block lh-1 mb-2">${dia}</span>
                        <span class="badge rounded-pill ${statusColorClass} fw-bold w-100 shadow-sm" style="font-size: 0.65rem; letter-spacing: 0.05em;">${status}</span>
                    </div>
                    
                    <!-- Título e Local -->
                    <div class="flex-grow-1">
                        <h5 class="fw-bold text-dark mb-2" style="line-height: 1.3;">
                            ${agenda.localidade}
                        </h5>
                        <div class="d-flex flex-wrap gap-3 text-secondary small fw-medium">
                            <div class="d-flex align-items-center gap-1">
                                <i class="bi bi-geo-alt text-taiko-gold fs-6"></i>
                                <span class="text-truncate" style="max-width: 250px;">${localTexto}</span>
                            </div>
                            <div class="d-flex align-items-center gap-1">
                                <i class="bi bi-clock text-taiko-gold fs-6"></i>
                                <span>${horarioFormatado}</span>
                            </div>
                            <div class="d-flex align-items-center gap-1">
                                <span class="badge rounded-pill ${compColor} px-2 py-1 fw-semibold d-flex align-items-center gap-1">
                                    <i class="bi ${iconStatus}"></i> ${compTexto}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botões Rápidos -->
                    <div class="d-flex gap-2 flex-wrap align-items-center justify-content-xl-end mt-3 mt-xl-0 border-start ps-xl-3">
                        <button onclick="event.stopPropagation(); irParaRepertorio(${agenda.idApresentacao})" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 shadow-sm font-monospace fw-bold" style="font-size: 0.75rem;">
                            <i class="bi bi-music-note-list fs-6"></i> Repertório
                        </button>
                        <button onclick="event.stopPropagation(); localStorage.setItem('id', ${agenda.idApresentacao}); window.location.href='DefinirMembrosApresentacao.html'" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm font-monospace fw-bold" style="font-size: 0.75rem;">
                            <i class="bi bi-people-fill fs-6"></i> Membros
                        </button>
                        <button onclick="event.stopPropagation(); irParaAgenda(${agenda.idApresentacao})" class="btn btn-sm btn-outline-info d-flex align-items-center gap-1 shadow-sm font-monospace fw-bold" style="font-size: 0.75rem;">
                            <i class="bi bi-calendar3 fs-6"></i> Agenda
                        </button>
                        <button onclick="event.stopPropagation(); irParaDocumento(${agenda.idApresentacao})" class="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 shadow-sm font-monospace fw-bold" style="font-size: 0.75rem;">
                            <i class="bi bi-file-earmark-text fs-6"></i> Documento
                        </button>
                        <div class="rounded-circle d-flex align-items-center justify-content-center text-secondary hover-bg-light ms-1" style="width: 32px; height: 32px; background-color: #f8f9fa; border: 1px solid #eee; transition: 0.2s;" title="Mais opções">
                            <i class="bi bi-three-dots-vertical"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        container.innerHTML += cardHTML;
    });
}

function exibirSucesso(mensagem) {
    document.getElementById("textoSucessoGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalSucessoGenerico"));
    modal.show();
}

function exibirErro(mensagem) {
    document.getElementById("textoErroGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalErroGenerico"));
    modal.show();
}

window.addEventListener('load', function (){
    localStorage.clear();
});

// Helper Functions for Routing
async function irParaRepertorio(idApresentacao) {
    try {
        const respMusicas = await fetch(urlReper+"/getApresentacao?id="+idApresentacao);
        if (respMusicas.ok) {
            localStorage.setItem('id', idApresentacao);
            window.location.href='atualizarRepertorio.html';
        } else {
            localStorage.clear();
            localStorage.setItem('id', idApresentacao);
            localStorage.setItem('flag', 'E');
            window.location.href='DefinirMusicasNaApresentacao.html';
        }
    } catch (e) {
        localStorage.setItem('id', idApresentacao);
        window.location.href='DefinirMusicasNaApresentacao.html';
    }
}

async function irParaDocumento(idApresentacao) {
    try {
        const respDoc = await fetch(`${urlDoc}/get-byIdAprese?id=${idApresentacao}`);
        if (respDoc.ok) {
            atualizarDoc(idApresentacao);
        } else {
            localStorage.setItem('id', idApresentacao); 
            window.location.href='docTxt.html';
        }
    } catch(e) {
        localStorage.setItem('id', idApresentacao); 
        window.location.href='docTxt.html';
    }
}

async function irParaAgenda(idApresentacao) {
    try {
        const respAp = await fetch(url + "/get-all-sem-agenda");
        if (respAp.ok) {
            const listaAp = await respAp.json();
            const naoAgendada = listaAp.some(ap => ap.id == idApresentacao);
            if (naoAgendada) {
                cadastrarAgenda(idApresentacao);
            } else {
                localStorage.setItem('id', idApresentacao); 
                window.location.href='exibirAgendas.html';
            }
        }
    } catch (e) {
        localStorage.setItem('id', idApresentacao); 
        window.location.href='exibirAgendas.html';
    }
}