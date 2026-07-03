let dataAtual = new Date();
let dataSelecionada = null;
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

let listaAgendas = [];
let listaAgendasCompleta = [];
let agendaEditada;

function mostrarAgenda(agendaStringCodificada, agendaStatus){
    const agenda = JSON.parse(decodeURIComponent(agendaStringCodificada));
    agendaEditada = agenda;
    if(agendaStatus === 'C'){
        document.getElementById("btSalvar").disabled = false;
        document.getElementById("btCancelar").disabled = true;
    }
    else if(agendaStatus === 'F'){
        document.getElementById("btCancelar").disabled = true;
        document.getElementById("btSalvar").disabled = true;
    }
    else{
        document.getElementById("btCancelar").disabled = false;
        document.getElementById("btSalvar").disabled = false;
    }
   document.getElementById('data-modal').value = agenda.Data;
   document.getElementById('horario-modal').value = agenda.Horario;
   document.getElementById('cep-modal').value = agenda.local.CEP;
   document.getElementById('estado-modal').value = agenda.local.estado;
   document.getElementById('cidade-modal').value = agenda.local.cidade;
   document.getElementById('rua-modal').value = agenda.local.rua;
   document.getElementById('bairro-modal').value = agenda.local.bairro;
   document.getElementById('numero-modal').value = agenda.local.numero;
   document.getElementById('complemento-modal').value = agenda.local.complemento;
}

async function carregarProximas() {
    // fetch("http://localhost:8080/apiagenda/getproximasagendas")
    //     .then(response => response.json())
    //     .then(data => {
    //         //console.log("Dados recebidos da API:", data);
    //         listaAgendasCompleta = data;
    //         renderizarCalendario();
    //         renderizarAgendas(listaAgendasCompleta);
    //     })
    //     .catch(error => console.error("Erro:", error));
    await fetch("http://localhost:8080/apiagenda/finalizar-agenda");
    const response = await fetch("http://localhost:8080/apiagenda/getproximasagendas");
    if(response.ok){
        dataSelecionada = 'P';
        listaAgendasCompleta = await response.json();
        renderizarCalendario();
        renderizarAgendas(listaAgendasCompleta);
    }
}

function mascaraCEP(event) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = valor;
}

function mascaraNumero(event) {
    let input = event.target;
    input.value = input.value.replace(/\D/g, '');
}

function cancelarAgenda(){
    let id_apresentacao = agendaEditada.apresentacao ? agendaEditada.apresentacao.id : agendaEditada.idApresentacao;
    fetch("http://localhost:8080/apiagenda/cancelaragenda?id=" + id_apresentacao, {
        method: "PUT",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then(async response => {
            const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
            const p = document.getElementById("msg");
            const span = document.getElementById("subtitulo");
            if (response.ok) {
                span.innerText = "Sucesso";
                p.innerText = "Agendamento cancelado";
                //alert("Agendamento cancelado!");
                //window.location.reload();
                if(dataSelecionada === 'P')
                    carregarProximas();
                else if(dataSelecionada == null)
                    carregarAgendas();
                else
                    carregarAgendasporData(dataSelecionada);
            } else {
                const erroObjeto = await response.json();
                let msg = erroObjeto.erro;

                if (msg.includes("Onde:")) {
                    msg = msg.split("Onde:")[0];
                }
                msg = msg.replace("ERROR:", "").trim();
                //alert("Alerta: "+ erroObjeto.mensagem+"\n"+ msg);
                span.innerText = "Erro";
                p.innerText = "Erro: "+ erroObjeto.mensagem + msg;
            }
            modal.show();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro de conexão.");
        });
}

function excluirAgenda(){
    let id = agendaEditada.id;
    fetch("http://localhost:8080/apiagenda/deletaragenda?id="+id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then(response => {
            const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
            const p = document.getElementById("msg");
            const span = document.getElementById("subtitulo");
            if (response.ok) {
                //alert("Agenda deletada com sucesso!");
                span.innerText = "Sucesso";
                p.innerText = "Agenda deletada com sucesso!";
                //window.location.reload();
                if(dataSelecionada === 'P')
                    carregarProximas();
                else if(dataSelecionada == null)
                    carregarAgendas();
                else
                    carregarAgendasporData(dataSelecionada);
            } else {
                p.innerText = "Erro ao deletar";
                //alert("Erro ao deletar");
            }
            modal.show();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro de conexão.");
        });
}

async function atualizarAgenda(){
    const idAgenda = agendaEditada.id;
    const data = document.getElementById('data-modal').value;
    let horario = document.getElementById('horario-modal').value;
    const cep = document.getElementById('cep-modal').value;
    const bairro = document.getElementById('bairro-modal').value;
    const numero = document.getElementById('numero-modal').value;
    const complemento = document.getElementById('complemento-modal').value;
    const estado = document.getElementById('estado-modal').value;
    const cidade = document.getElementById('cidade-modal').value;
    const rua = document.getElementById('rua-modal').value;
    const idApresentacao = agendaEditada.apresentacao ? agendaEditada.apresentacao.id : agendaEditada.idApresentacao;
    const hoje = new Date();

    const modal = new bootstrap.Modal(document.getElementById('modalSave'));
    const p = document.getElementById("save");
    const span = document.getElementById("subtitulo");

    if (!data || !horario || !cep || !estado || !numero || !cidade || !bairro) {
        p.innerText = "Preencha todos os campos";
        span.innerText = "Erro";
        modal.show();
        //alert("Preencha todos os campos!");
        return;
    }
    else if(new Date(data + " "+ horario) < hoje){
        p.innerText = "Escolha uma data no futuro";
        span.innerText = "Erro";
        modal.show();
        return;
    }

    if (horario.length === 5) { // HH:MM
        horario += ":00";
    }
    const params = new URLSearchParams();

    params.append('id', idAgenda);
    params.append('data', data);
    params.append('horario',horario);
    params.append('cep', cep);
    params.append('estado', estado);
    params.append('cidade', cidade);
    params.append('rua', rua);
    params.append('numero', numero);
    params.append('bairro', bairro);
    params.append('complemento', complemento);
    params.append('idApresentacao', idApresentacao);

    fetch("http://localhost:8080/apiagenda/atualizaagenda", {
        method: "PUT",
        body: params
    })
        .then(async response => {
            const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
            const p = document.getElementById("msg");
            const span = document.getElementById("subtitulo");
            if (response.ok) {
                //alert("Agenda atualizada com sucesso!");
                //window.location.reload();
                span.innerText = "Sucesso";
                p.innerText = "Agenda atualizada com sucesso";
                if(dataSelecionada === 'P')
                    carregarProximas();
                else if(dataSelecionada == null)
                    carregarAgendas();
                else
                    carregarAgendasporData(dataSelecionada);
            }
            else{
                let erro = await response.json();
                span.innerText = "Erro";
                p.innerText = erro.mensagem + "\n"+ erro.erro;
            }
            modal.show();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro de conexão.");
        });
}

async function carregarAgendasporData(dataSelecionada) {
    // fetch(`http://localhost:8080/apiagenda/getagendapordia?dia=${dataSelecionada}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         //console.log("Dados recebidos da API:", data);
    //         listaAgendas = data;
    //         renderizarCalendario();
    //         renderizarAgendas(listaAgendas);
    //     })
    //     .catch(error => console.error("Erro:", error));
    const response = await fetch(`http://localhost:8080/apiagenda/getagendapordia?dia=${dataSelecionada}`);
    if(response.ok){
        listaAgendas = await response.json();
        renderizarCalendario();
        renderizarAgendas(listaAgendas);
    }
}

async function carregarAgendas() {
    const response = await fetch("http://localhost:8080/apiagenda/getagenda")
    if(response.ok){
        const data = await response.json();
        listaAgendasCompleta = data;
        await renderizarCalendario();
        renderizarAgendas(listaAgendasCompleta);
    }
}

function renderizarAgendas(listaAgendas) {
    const container = document.getElementById('lista-agendas');
    container.innerHTML = '';

    if (!listaAgendas || listaAgendas.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5 text-muted">
                <i class="bi bi-calendar-x display-4 mb-3 d-block opacity-50"></i>
                <p class="mb-0">Nenhuma apresentação encontrada.</p>
            </div>`;
        return;
    }

    listaAgendas.forEach(agenda => {
        const [ano, mesStr, dia] = agenda.Data.split('-');
        const mesAbrev = meses[parseInt(mesStr) - 1].substring(0, 3);

        const agendaStringCodificada = encodeURIComponent(JSON.stringify(agenda));

        const horarioFormatado = agenda.Horario ? agenda.Horario.substring(0, 5) : '--:--';
        let status; let statusColorClass;
        if(agenda.status==='A') {
            status = "Agendado";
            statusColorClass = 'text-bg-success';
        }else if(agenda.status==='C') {
            status = "Cancelada";
            statusColorClass = 'text-bg-danger';
        }
        else if(agenda.status==='F'){
            status = "Finalizado";
            statusColorClass = 'text-bg-primary';
        }
        const cardHTML = `
             <div class="event-item rounded-3 p-3 d-flex align-items-center gap-3 border border-light shadow-sm position-relative" 
                 style="background-color: #fafafa; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
                 onmouseover="this.style.transform='translateY(-2px)'; this.classList.add('shadow');" 
                 onmouseout="this.style.transform='translateY(0)'; this.classList.remove('shadow');"
                 data-bs-toggle="modal" 
                 data-bs-target="#modalDetalhesAgenda" 
                 role="button"
                 aria-label="Ver detalhes da agenda"
                 onclick="mostrarAgenda('${agendaStringCodificada}', '${agenda.status}')"
                 >
                 
                <div class="event-date-box flex-shrink-0 shadow-sm">
                    <span class="text-taiko-red fw-bold text-uppercase d-block lh-1 mb-1" style="font-size: 0.75rem;">${mesAbrev}</span>
                    <span class="fs-4 fw-bold text-dark lh-1 d-block">${dia}</span>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h5 class="fw-bold text-dark mb-0 fs-6">${agenda.localidade}</h5>
                        <span class="badge rounded-pill ${statusColorClass} fw-semibold px-2 py-1" style="font-size: 0.7rem; letter-spacing: 0.05em;">
                            ${status}
                        </span>
                    </div>
                    
                    <p class="text-muted small mb-0 d-flex align-items-center gap-2">
                        <i class="bi bi-geo-alt-fill text-secondary"></i> ${agenda.local.rua} &bull; ${horarioFormatado}
                    </p>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

async function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    document.getElementById('mes-ano-texto').innerText = `${meses[mes]} ${ano}`;
    const grid = document.getElementById('calendario');
    let htmlString = '';

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        htmlString += `<div class="calendar-day-header text-muted fw-bold small text-center pb-3">${dia}</div>`;
    });

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDia; i++) {
        htmlString += `<div class="calendar-day empty"></div>`;
    }

    var cont = 0;
    for (let i = 1; i <= diasNoMes; i++) {
        const mesF = String(mes + 1).padStart(2, '0');
        const diaF = String(i).padStart(2, '0');
        const dataStr = `${ano}-${mesF}-${diaF}`;
        var temEvento;
//        if(listaAgendasCompleta)
//            listaAgendasCompleta.some(a => {
//                if(a.Data === dataStr && a.status == "A"){
//                    temEvento = true;
//                    console.log("Agenda: "+a.Data +' true '+"DataStr: "+dataStr);
//                }
//                else{
//                    temEvento = false;
//                    console.log("Agenda: "+a.Data +' false '+"DataStr: "+dataStr);
//                }
//            });
//        else
//            temEvento = false;
        cont = 0;
        while(listaAgendasCompleta && cont < listaAgendasCompleta.length && listaAgendasCompleta[cont].Data !== dataStr)
            cont++;
        if(listaAgendasCompleta && cont < listaAgendasCompleta.length){
            if(listaAgendasCompleta[cont].Data === dataStr){
                if(listaAgendasCompleta[cont].status == "A"){
                    cont++;
                    temEvento=true;
                }
                else{
                    cont++;
                    temEvento=false;
                }
            }
            else
                temEvento = false;
        }
        else
            temEvento = false;
        const estaSelecionado = dataSelecionada === dataStr;

        let bgStyle = estaSelecionado ? 'background-color: var(--taiko-red); color: white;' : 'background-color: transparent;';
        let borderStyle = temEvento && !estaSelecionado ? 'border: 1px solid rgba(230, 57, 70, 0.2);' : 'border: 1px solid transparent;';
        let fontWeight = (temEvento || estaSelecionado) ? 'fw-bold' : 'fw-normal';
        let dotColor = estaSelecionado ? 'bg-white' : 'bg-taiko-red';

        htmlString += `
            <div class="calendar-day position-relative d-flex align-items-center justify-content-center rounded-circle" 
                 style="cursor: pointer; width: 40px; height: 40px; margin: auto; transition: all 0.2s ease; ${bgStyle} ${borderStyle}"
                 onclick="selecionarData('${dataStr}')"
                 onmouseover="if(!${estaSelecionado}) this.style.backgroundColor='#f1f1f1'"
                 onmouseout="if(!${estaSelecionado}) this.style.backgroundColor='transparent'">
                
                <span class="${fontWeight}" style="font-size: 0.9rem; z-index: 2;">${i}</span>
                
                ${temEvento ? `<span class="${dotColor} rounded-circle position-absolute" style="width: 4px; height: 4px; bottom: 6px; z-index: 3;"></span>` : ''}
            </div>
        `;
    }
    grid.innerHTML = htmlString;
}

function mudarMes(direcao) {
    dataAtual.setMonth(dataAtual.getMonth() + direcao);
    renderizarCalendario();
}

function selecionarData(data) {
    if (dataSelecionada === data) {
        limparFiltro();
    } else {
        dataSelecionada = data;
        carregarAgendasporData(dataSelecionada);
    }
}

function limparFiltro() {
    dataSelecionada = null;
    carregarAgendas();
}

document.addEventListener('DOMContentLoaded', () => {
    carregarProximas();
});