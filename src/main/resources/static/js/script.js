// Injeta o Favicon automaticamente em todas as páginas
(function () {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_EW1pVi14HZShWF8KD4Uu3NALLJ7uBalzJA&s';
})();
// ====== GLOBAL LOADER PARA REQUISIÇÕES ======
let activeRequests = 0;

function mostrarGlobalLoader() {
    if (activeRequests === 0) {
        let loader = document.getElementById('shokuin-global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'shokuin-global-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(255, 255, 255, 0.75);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transition: opacity 0.3s ease;
            `;
            loader.innerHTML = `
                <style>
                    @keyframes taiko-pulse {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.4); }
                        70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(198, 40, 40, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); }
                    }
                    .loader-pulse-circle {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, var(--taiko-red, #C62828), #8a1717);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: taiko-pulse 1.5s infinite;
                        margin-bottom: 20px;
                    }
                </style>
                <div class="loader-pulse-circle text-white shadow-lg">
                    <i class="bi bi-hourglass-split fs-1"></i>
                </div>
                <h4 class="font-display fw-bold text-dark mb-1">Só um momento...</h4>
                <span class="text-muted fw-medium" style="font-size: 1rem;">Salvando tudo com segurança para você! 🥁</span>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }
    activeRequests++;
}

function esconderGlobalLoader() {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        const loader = document.getElementById('shokuin-global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

const originalFetch = window.fetch;
window.fetch = async function () {
    let showLoader = false;
    const options = arguments[1];

    if (options && options.method) {
        const method = options.method.toUpperCase();
        // Dispara o loading apenas para ações de escrita no banco (alterar, salvar, excluir)
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            showLoader = true;
        }
    }

    if (showLoader) {
        mostrarGlobalLoader();
    }

    try {
        const response = await originalFetch.apply(this, arguments);
        return response;
    } finally {
        if (showLoader) {
            esconderGlobalLoader();
        }
    }
};
// ============================================

let homeCarregado = false;

async function carregarHome() {
    if (homeCarregado) return;
    homeCarregado = true;
    try {
        const response = await fetch("/apiautenticacao/usuario-atual");
        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }
        if (!response.ok) {
            throw new Error(`Erro na requisição: Status ${response.status}`);
        }
        const usuario = await response.json();

        const path = decodeURIComponent(window.location.pathname).toLowerCase();
        if (usuario.nivel === 1) {
            const paginasPermitidas = ['/exibiragendas.html', '/index.html', '/login.html', '/'];
            if (!paginasPermitidas.includes(path)) {
                window.location.href = '/index.html';
                return;
            }
        } else if (usuario.nivel === 2) {
            const paginasPermitidas = [
                '/exibiragendas.html', '/index.html', '/login.html', '/',
                '/definirformação.html', '/listarformacoes.html'
            ];
            if (!paginasPermitidas.includes(path)) {
                window.location.href = '/index.html';
                return;
            }
        }

        if (usuario.nivel === 1 || usuario.nivel === 2) {
            const btnApreIndex = document.getElementById("btnNovaApresentacaoIndex");
            if (btnApreIndex) btnApreIndex.style.display = 'none';
        }

        if (usuario.nivel === 1) {
            const boxFormacoes = document.getElementById("boxGestaoFormacoesIndex");
            if (boxFormacoes) boxFormacoes.style.display = 'none';
        }

        const iniciais = usuario.nome ? usuario.nome.substring(0, 2).toUpperCase() : "US";
        const sidebarElement = document.getElementById("sidebar");
        if (!sidebarElement)
            return;
        let cargos = ["", "Membro Comum", "Criador de Formações", "Acesso Total"];
        let textoCargo = usuario.nivel && usuario.nivel <= 3 ? cargos[usuario.nivel] : "Membro Comum";

        let menuItems = ``;

        if (usuario.nivel === 1) {
            menuItems = `
            <div class="mb-4">
                <h6 class="nav-section-title px-3 mb-3 fw-bold">GERAL</h6>
                <ul class="list-unstyled ps-0">
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#agenda-collapse" aria-expanded="false" aria-controls="agenda-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-calendar-event-fill icon-main"></i>
                                <span>Agenda</span>
                            </div>
                        </button>
                        <div class="collapse" id="agenda-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="../exibirAgendas.html">Ver Agenda Completa</a></li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>`;
        } else if (usuario.nivel === 2) {
            menuItems = `
            <div class="mb-4">
                <h6 class="nav-section-title px-3 mb-3 fw-bold">GERAL</h6>
                <ul class="list-unstyled ps-0">
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#agenda-collapse" aria-expanded="false" aria-controls="agenda-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-calendar-event-fill icon-main"></i>
                                <span>Agenda</span>
                            </div>
                        </button>
                        <div class="collapse" id="agenda-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="../exibirAgendas.html">Ver Agenda Completa</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#formacoes-collapse" aria-expanded="false" aria-controls="formacoes-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-grid-fill icon-main"></i>
                                <span>Formações</span>
                            </div>
                        </button>
                        <div class="collapse" id="formacoes-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="DefinirFormação.html">Criar Nova Formação</a></li>
                                <li><a href="listarFormacoes.html">Ver Todas as Formações</a></li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>`;
        } else {
            menuItems = `
            <div class="mb-4">
                <h6 class="nav-section-title px-3 mb-3 fw-bold">FUNDAMENTAIS</h6>
                <ul class="list-unstyled ps-0">
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#apresentacoes-collapse" aria-expanded="false" aria-controls="apresentacoes-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-record-circle icon-main"></i>
                                <span>Apresentações</span>
                            </div>
                        </button>
                        <div class="collapse" id="apresentacoes-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="/definirApresentacao.html">Criar Nova Apresentação</a></li>
                                <li><a href="/listarApresentacao.html">Ver Todas as Apresentações</a></li>
                                <li><a href="/detalhesApresentacao.html">Ver Detalhes das Apresentações</a></li>
                                <li><a href="/VerDocumentos.html">Ver Documentos das Apresentações</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#formacoes-collapse" aria-expanded="false" aria-controls="formacoes-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-grid-fill icon-main"></i>
                                <span>Formações</span>
                            </div>
                        </button>
                        <div class="collapse" id="formacoes-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="DefinirFormação.html">Criar Nova Formação</a></li>
                                <li><a href="listarFormacoes.html">Ver Todas as Formações</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#agenda-collapse" aria-expanded="false" aria-controls="agenda-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-calendar-event-fill icon-main"></i>
                                <span>Agenda</span>
                            </div>
                        </button>
                        <div class="collapse" id="agenda-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="../exibirAgendas.html">Ver Agenda Completa</a></li>
                                <li><a href="RelatorioApresentacoesDia.html">Relatório Agenda</a></li>
                            </ul>
                        </div>
                    </li>
                     <li class="mb-1">
                        <button class="btn btn-toggle align-items-center rounded collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#estoque-collapse"
                            aria-expanded="false">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-box-seam icon-main"></i>
                                <span>Estoque</span>
                            </div>
                        </button>
                    
                        <div class="collapse" id="estoque-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                                <li>
                                    <a href="controlarEstoque.html">
                                        Controle de Estoque
                                    </a>
                                </li>
                                <li>
                                    <a href="historicoMovimentacao.html">
                                        Histórico de Movimentação
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>

                <hr class="border-secondary mx-3 mb-4" style="opacity: 0.2;">

            <div class="mb-4">
                <h6 class="nav-section-title px-3 mb-3 fw-bold">BÁSICAS</h6>
                <ul class="list-unstyled ps-0">
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#musicas-collapse" aria-expanded="false" aria-controls="musicas-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-music-note-list icon-main"></i>
                                <span>Músicas</span>
                            </div>
                        </button>
                        <div class="collapse" id="musicas-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="cadMusica.html">Cadastrar</a></li>
                                <li><a href="listaMusicas.html">Ver Lista</a></li>
                                <li><a href="MusicasMaisTocadas.html">Músicas mais Tocadas</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#membros-collapse" aria-expanded="false" aria-controls="membros-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-people-fill icon-main"></i>
                                <span>Membros</span>
                            </div>
                        </button>
                        <div class="collapse" id="membros-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="cadMembro.html">Cadastrar</a></li>
                                <li><a href="listarMembros.html">Ver Lista</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-1">
                        <button class="btn btn-toggle align-items-center rounded collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#usuario-collapse"
                            aria-expanded="false">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-person-circle icon-main"></i>
                                <span>Usuários</span>
                            </div>
                        </button>
                        <div class="collapse" id="usuario-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                                <li>
                                    <a href="cadastroUsuario.html">
                                        Cadastrar Usuário
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#cargos-collapse" aria-expanded="false" aria-controls="cargos-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-person-badge-fill icon-main"></i>
                                <span>Cargos</span>
                            </div>
                        </button>
                        <div class="collapse" id="cargos-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="cadastroCargo.html">Cadastrar Cargos</a></li>
                                <li><a href="listarCargos.html">Ver Lista</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#instrumentos-collapse" aria-expanded="false" aria-controls="instrumentos-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-tools icon-main"></i>
                                <span>Instrumentos</span>
                            </div>
                        </button>
                        <div class="collapse" id="instrumentos-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="cadastrarInstrumento.html">Cadastrar</a></li>
                                <li><a href="listarInstrumentos.html">Ver Lista</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="mb-2">
                        <button type="button" class="btn-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#fornecedores-collapse" aria-expanded="false" aria-controls="fornecedores-collapse">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-truck icon-main"></i>
                                <span>Fornecedores</span>
                            </div>
                        </button>
                        <div class="collapse" id="fornecedores-collapse">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1">
                                <li><a href="cadastrarFornecedor.html">Cadastrar</a></li>
                                <li><a href="homeFornecedor.html">Ver Lista</a></li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>`;
        }

        sidebarElement.innerHTML = `    <div class="sidebar-logo-area p-4 position-relative">
                <a href="index.html" class="d-flex align-items-center gap-3 text-decoration-none" style="cursor: pointer;">
                    <div class="sidebar-logo-glow"></div>
                    <div class="logo-circle rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow">
                        <span class="text-white font-display fw-bold fs-5">F</span>
                    </div>
                    <div>
                        <h1 class="text-white font-display fw-bold fs-5 mb-0" style="letter-spacing: 0.1em;">SHOKUIN</h1>
                        <p class="text-taiko-red m-0" style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600;">Dantai Fênix</p>
                    </div>
                </a>
                <button type="button" class="btn btn-link text-secondary d-md-none position-absolute top-0 end-0 mt-3 me-2 text-decoration-none" onclick="toggleSidebar()">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

        <div class="flex-grow-1 overflow-auto p-3 sidebar-container mt-2">
            ${menuItems}
        </div>

            <div class="p-3 border-top border-secondary" style="border-opacity: 0.2 !important;">
                <div class="d-flex align-items-center justify-content-between p-2 rounded" style="transition: background 0.2s;" onmouseover="this.style.backgroundColor='var(--taiko-ink)'" onmouseout="this.style.backgroundColor='transparent'">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex justify-content-center align-items-center" style="width: 40px; height: 40px; background-color: #374151; border: 2px solid var(--taiko-ink); color: #d1d5db; font-weight: bold;">
                            ${iniciais}
                        </div>
                        <div>
                            <h6 class="text-white mb-0" style="font-size: 0.875rem; text-transform: capitalize;">${usuario.nome}</h6>
                            <small class="text-taiko-gold" style="font-size: 0.75rem;">${textoCargo}</small>
                        </div>
                    </div>
                    <button type="button" class="btn btn-link text-secondary p-1 text-decoration-none" onclick="abrirModalLogout()" title="Sair do Sistema" style="color: #9ca3af !important;">
                        <i class="bi bi-box-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>
        `;
        let modalContainer = document.getElementById("containerModalLogout");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.id = "containerModalLogout";
            document.body.appendChild(modalContainer);
        }

        modalContainer.innerHTML = `
            <div class="modal fade" id="modalLogout" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg" style="margin: 0 auto; width: 30%">
                    <div class="modal-content" style="border: none; border-top: 4px solid var(--taiko-gold);">
                        <div class="modal-header border-bottom-0 pb-0">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-taiko-red text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 45px; height: 45px;">
                                    <i class="bi bi-box-arrow-right fs-5"></i>
                                </div>
                                <div>
                                    <h5 class="modal-title font-display fw-bold text-dark">Sair do Sistema</h5>
                                    <span class="text-taiko-gold small fw-bold text-uppercase" style="letter-spacing: 0.1em;">Confirmação</span>
                                </div>
                            </div>
                            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4 pt-3">
                            <p class="modal-title font-display fw-bold text-dark fs-6" style="margin-bottom: 20px;">Deseja realmente encerrar sua sessão no ShokuinTaiko?</p>
                            <div class="modal-footer border-top-0 pt-0 pe-0 pb-0 d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-secondary px-4 fw-bold shadow-sm" data-bs-dismiss="modal">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-taiko px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onclick="confirmarSairDoSistema()">
                                    <i class="bi bi-check-circle"></i> Sim, Sair
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Aviso:", error);
    }
}

function abrirModalLogout() {
    const elementoModal = document.getElementById('modalLogout');
    if (elementoModal) {
        const meuModal = new bootstrap.Modal(elementoModal);
        meuModal.show();
    }
}

async function confirmarSairDoSistema() {
    try {
        await fetch("/apiautenticacao/logout", {
            method: "POST"
        });
        window.location.href = "/login.html";
    } catch (error) {
        console.error("Erro ao efetuar o logout no servidor:", error);
        window.location.href = "/login.html";
    }
}

function carregarIconesCargos() {
    const iconesElement = document.getElementById("icones");
    if (!iconesElement) return;
    iconesElement.innerHTML = `  <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
  </symbol>
  <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
  </symbol>
  <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </symbol>`;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.toggle('show');
    if (overlay) overlay.classList.toggle('show');
}

(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
})()

function injetarMenuEtapas(etapaAtual) {
    const idApre = localStorage.getItem('id');
    // Só renderiza se existir uma apresentação em andamento/edição
    if (!idApre) return;

    const container = document.getElementById("wizard-nav-container");
    if (!container) return;

    const etapas = [
        { id: 'nome', texto: '1. Nome da Apresentação', icon: 'bi-pencil', href: 'definirApresentacao.html' },
        { id: 'repertorio', texto: '2. Repertório', icon: 'bi-music-note-list', href: 'DefinirMusicasNaApresentacao.html' },
        { id: 'membros', texto: '3. Participantes', icon: 'bi-people-fill', href: 'DefinirMembrosApresentacao.html' },
        { id: 'agenda', texto: '4. Agendamento', icon: 'bi-calendar-event', href: 'cadAgenda.html' }
    ];

    let html = `
        <div class="card border-0 shadow-sm mb-4 position-relative" style="border-radius: 12px; background: rgba(255,255,255,0.95);">
            
            <div class="card-body p-2 p-md-3 d-flex flex-column flex-xl-row align-items-center gap-3">
                <a href="listarApresentacao.html" onclick="localStorage.clear()" class="btn btn-light rounded-pill shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center gap-2 px-3" style="border: 1px solid #e5e7eb; height: 45px;" title="Voltar para a lista">
                    <i class="bi bi-house-door-fill text-secondary fs-5"></i> <span class="text-secondary fw-semibold">Voltar para a lista</span>
                </a>
                
                <div class="w-100">
                    <ul class="nav nav-pills nav-fill gap-2 flex-column flex-md-row m-0">
    `;

    etapas.forEach(e => {
        const isAtiva = e.id === etapaAtual;
        const colorClass = isAtiva ? 'bg-taiko-red text-white shadow-sm' : 'text-secondary hover-bg-light';

        html += `
            <li class="nav-item">
                <a class="nav-link rounded-pill py-2 ${colorClass}" 
                   href="#" 
                   onclick="navegarEtapa('${e.href}')" 
                   style="${isAtiva ? 'font-weight: 600;' : 'transition: background 0.2s;'}">
                    <i class="bi ${e.icon} me-2"></i> ${e.texto}
                </a>
            </li>
        `;
    });

    html += `
                    </ul>
                </div>
            </div>
        </div>
        <style>
            .hover-bg-light:hover { background-color: #f8f9fa; color: #dc3545 !important; }
            .bg-taiko-red { background-color: var(--taiko-red, #dc3545) !important; }
        </style>
    `;

    container.innerHTML = html;
}

function navegarEtapa(href) {
    // Mantém o ID na memória e redireciona
    const idApre = localStorage.getItem('id');
    if (idApre) {
        localStorage.setItem('id', idApre);
        window.location.href = href;
    }
}

function mostrarModalAlerta(titulo, mensagem, tipo = 'erro', callback = null) {
    const iconClass = tipo === 'erro' ? 'bi-x-circle-fill text-danger' : 'bi-check-circle-fill text-success';

    let modalEl = document.getElementById('modalGenericoSistema');
    if (!modalEl) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="modal fade" id="modalGenericoSistema" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none; border-top: 4px solid var(--taiko-gold);">
                        <div class="modal-header border-bottom-0 pb-0">
                            <div class="d-flex align-items-center gap-3">
                                <div class="p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 45px; height: 45px;">
                                    <i id="modalGenericoIcon" class="bi" style="font-size: 40px;"></i>
                                </div>
                                <div>
                                    <h5 class="modal-title font-display fw-bold text-dark" id="modalGenericoTitulo"></h5>
                                    <span class="fst-italic small text-secondary" style="letter-spacing: 0.1em;">Aviso do Sistema</span>
                                </div>
                            </div>
                            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4 pt-3">
                            <p id="modalGenericoMensagem" class="mb-0 text-secondary"></p>
                        </div>
                        <div class="modal-footer border-top-0 pt-0 pe-2 pb-2">
                            <button type="button" class="btn w-100 fw-bold shadow-sm" data-bs-dismiss="modal" id="modalGenericoBtn">Entendido</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div.firstElementChild);
        modalEl = document.getElementById('modalGenericoSistema');

        // Add listener for callback
        modalEl.addEventListener('hidden.bs.modal', function () {
            const cb = modalEl.getAttribute('data-callback-pending');
            if (cb === 'true' && typeof window.modalGenericoCallback === 'function') {
                window.modalGenericoCallback();
                modalEl.setAttribute('data-callback-pending', 'false');
                window.modalGenericoCallback = null;
            }
        });
    }

    document.getElementById('modalGenericoTitulo').innerText = titulo;
    document.getElementById('modalGenericoMensagem').innerText = mensagem;

    const iconEl = document.getElementById('modalGenericoIcon');
    iconEl.className = `bi ${iconClass}`;

    const btnEl = document.getElementById('modalGenericoBtn');
    btnEl.className = tipo === 'erro' ? 'btn btn-danger w-100 fw-bold shadow-sm' : 'btn btn-success w-100 fw-bold shadow-sm';

    if (callback) {
        window.modalGenericoCallback = callback;
        modalEl.setAttribute('data-callback-pending', 'true');
    } else {
        modalEl.setAttribute('data-callback-pending', 'false');
    }

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarHome);
} else {
    carregarHome();
}
