

let listaAgendas = [];

async function carregarProximas() {
    try {
        const resposta = await fetch("http://localhost:8080/apiagenda/getproximasagendas");
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await resposta.json();
        listaAgendas = data;
        renderizarAgendas(listaAgendas);
    } catch(error){
        console.error("Erro:", error);
        document.getElementById('contador-eventos').innerText = "--";
    }
}

function renderizarAgendas(listaAgendas) {
    const container = document.getElementById('lista-eventos');
    const contadorSpan = document.getElementById('contador-eventos');

    container.innerHTML = '';

    if (!listaAgendas || listaAgendas.length === 0) {
        contadorSpan.innerText = "0";
        container.innerHTML = `
            <div class="text-center p-5 text-muted">
                <i class="bi bi-calendar-x display-4 mb-3 d-block opacity-50"></i>
                <p class="mb-0">Nenhuma apresentação encontrada para esta data.</p>
            </div>`;
        return;
    }

    const quantidade = listaAgendas.length;
    contadorSpan.innerText = quantidade < 10 ? `0${quantidade}` : quantidade;

    // Array de meses caso você não tenha declarado no escopo global
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    listaAgendas.forEach(agenda => {
        const [ano, mesStr, dia] = agenda.Data.split('-');
        const mesAbrev = meses[parseInt(mesStr) - 1].substring(0, 3);

        const horarioFormatado = agenda.Horario ? agenda.Horario.substring(0, 5) : '--:--';

        let status;
        let statusColorClass;

        if (agenda.status === 'A') {
            status = "Agendado";
            statusColorClass = 'bg-success bg-opacity-10 text-success';
        } else if (agenda.status === 'C') {
            status = "Cancelada";
            statusColorClass = 'bg-danger bg-opacity-10 text-danger';
        }
        const cardHTML = `
             <div class="rounded-3 p-3 d-flex align-items-center gap-3 bg-white shadow-sm position-relative overflow-hidden" 
                  style="border: 1px solid #eee; border-left: 4px solid var(--taiko-gold); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;"
                  onmouseover="this.style.transform='translateX(5px)'; this.classList.replace('shadow-sm', 'shadow');"
                  onmouseout="this.style.transform='translateX(0)'; this.classList.replace('shadow', 'shadow-sm');">
                 
                <div class="event-date-box flex-shrink-0 bg-light rounded-2 d-flex flex-column align-items-center justify-content-center border" style="width: 55px; height: 55px;">
                    <span class="text-taiko-red fw-bold text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">${mesAbrev}</span>
                    <span class="fs-5 fw-bold text-dark lh-1 mt-1">${dia}</span>
                </div>

                <div class="flex-grow-1 ms-2">
                    <h5 class="fw-bold text-dark mb-1 fs-6" style="line-height: 1.2;">${agenda.localidade}</h5>
                    <p class="text-muted small mb-0 d-flex align-items-center gap-2">
                        <i class="bi bi-geo-alt-fill text-taiko-gold"></i> <span class="text-truncate" style="max-width: 150px;">${agenda.local.rua}</span> &bull; <i class="bi bi-clock text-secondary"></i> ${horarioFormatado}
                    </p>
                </div>

                <div class="d-none d-sm-block">
                    <span class="badge ${statusColorClass} rounded-pill px-3 py-2 fw-semibold shadow-sm" style="font-size: 0.7rem; letter-spacing: 0.05em;">
                        ${status}
                    </span>
                </div>
            </div>
        `;

        // insertAdjacentHTML é muito mais rápido que innerHTML +=
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

async function carregarContadorMusica() {
    try {
        const response = await fetch("http://localhost:8080/apimusica/quantidademusicas");
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.text();
        const qtde = parseInt(data);

        const contadorSpan = document.getElementById('contadorMusicas');

        if (isNaN(qtde) || qtde === 0) {
            contadorSpan.innerText = "00";
        } else {
            contadorSpan.innerText = qtde < 10 ? `0${qtde}` : qtde;
        }
    } catch (error) {
        console.error("Erro ao carregar o contador de músicas:", error);
        document.getElementById('contadorMusicas').innerText = "--";
    }
}



async function carregarContadorMembro() {
    try {
        const response = await fetch("http://localhost:8080/apimembro/quantidademembros");
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.text();
        const qtde = parseInt(data);

        const contadorSpan = document.getElementById('contadorMembros');
        console.log(qtde)
        if (isNaN(qtde) || qtde === 0) {
            contadorSpan.innerText = "00";
        } else {
            contadorSpan.innerText = qtde < 10 ? `0${qtde}` : qtde;
        }
    } catch (error) {
        console.error("Erro ao carregar o contador de membros:", error);
        document.getElementById('contadorMembros').innerText = "--";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await carregarProximas();
    await carregarContadorMusica();
    await carregarContadorMembro();
});