const mesesAbrev = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const urlAgendas = "http://localhost:8080/apiagenda/getagenda";
const urlRepertorio = "http://localhost:8080/apirepertorio/get";
const urlIntegrantes = "http://localhost:8080/apresentacao/membro-vinculados";
const SRC_LOGO_SHOKUIN = "img/dantaiFenix.png";

let todasAgendas = [];


async function listarApresentacoesPDF() {
    const container = document.getElementById('lista-pdf-agendas');
    try {
        const resp = await fetch(urlAgendas);
        if (resp.ok) {
            const dados = await resp.json();


            todasAgendas = dados.filter(agenda => {
                const statusAp = agenda.apresentacao.status;

                return agenda.id !== null;
            });

            renderizarCards(todasAgendas);
        } else {
            container.innerHTML = `<p class="text-muted text-center p-4">Erro ao carregar dados do servidor.</p>`;
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        container.innerHTML = `<p class="text-muted text-center p-4">Erro de conexão.</p>`;
    }
}


function renderizarCards(lista) {
    const container = document.getElementById('lista-pdf-agendas');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5 text-muted">
                <i class="bi bi-calendar-check display-4 mb-3 d-block opacity-50"></i>
                <p class="mb-0">Nenhum relatório disponível. (As apresentações precisam estar agendadas e com status 'Completa').</p>
            </div>`;
        return;
    }

    lista.forEach(agenda => {
        const [ano, mesStr, dia] = agenda.Data.split('-');
        const mesAbrev = mesesAbrev[parseInt(mesStr) - 1];
        const horarioFormatado = agenda.Horario ? agenda.Horario.substring(0, 5) : '--:--';
        const nomeApresentacao = agenda.localidade || "Apresentação sem Nome";
        const idAgenda = agenda.id;
        const idApresentacao = agenda.apresentacao.id;

        const cardHTML = `
         <div class="event-item rounded-3 p-3 d-flex align-items-center gap-3 border border-light shadow-sm bg-white">
            <div class="event-date-box flex-shrink-0 shadow-sm">
                <span class="text-taiko-red fw-bold text-uppercase d-block lh-1 mb-1" style="font-size: 0.75rem;">${mesAbrev}</span>
                <span class="fs-4 fw-bold text-dark lh-1 d-block">${dia}</span>
            </div>
            <div class="flex-grow-1">
                <h5 class="fw-bold text-dark mb-1 fs-6">${nomeApresentacao}</h5>
                <p class="text-muted small mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-geo-alt-fill text-secondary"></i> ${agenda.local ? agenda.local.rua : '-'} &bull; ${horarioFormatado}
                </p>
            </div>
            <div class="d-flex gap-2 flex-shrink-0">
                <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-medium d-flex align-items-center gap-1 shadow-sm"
                        onclick="abrirPrevia(${idAgenda}, ${idApresentacao})">
                    <i class="bi bi-eye"></i> Prévia
                </button>
                <button class="btn btn-taiko btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                        onclick="baixarPDF(${idAgenda}, ${idApresentacao})">
                    <i class="bi bi-download"></i> Baixar
                </button>
            </div>
        </div>`;

        container.innerHTML += cardHTML;
    });
}


function filtrarApresentacoes() {
    const termo = document.getElementById('inputPesquisa').value.toLowerCase();
    const filtradas = todasAgendas.filter(agenda => {
        const nome = agenda.localidade || '';
        const rua = agenda.local ? agenda.local.rua : '';
        return nome.toLowerCase().includes(termo) || rua.toLowerCase().includes(termo);
    });
    renderizarCards(filtradas);
}

function somarDuracoes(listaMusica) {
    let totalSegundos = 0;

    listaMusica.forEach(musica => {
        const duracaoStr = musica.duracao || "";
        if (duracaoStr.includes(":")) {
            const partes = duracaoStr.split(":");

            if (partes.length === 3) {

                const horas = parseInt(partes[0], 10) || 0;
                const minutos = parseInt(partes[1], 10) || 0;
                const segundos = parseInt(partes[2], 10) || 0;
                totalSegundos += (horas * 3600) + (minutos * 60) + segundos;
            } else if (partes.length === 2) {

                const minutos = parseInt(partes[0], 10) || 0;
                const segundos = parseInt(partes[1], 10) || 0;
                totalSegundos += (minutos * 60) + segundos;
            }
        } else if (duracaoStr) {

            totalSegundos += (parseInt(duracaoStr, 10) * 60);
        }
    });

    if (totalSegundos === 0) return "Não especificado";

    const h = Math.floor(totalSegundos / 3600);
    const min = Math.floor((totalSegundos % 3600) / 60);
    const seg = totalSegundos % 60;

    let resultado = "";
    if (h > 0) resultado += `${h} h `;
    if (min > 0 || h > 0) resultado += `${min} min `;
    if (seg > 0) resultado += `${seg} seg`;

    return resultado.trim();
}


async function abrirPrevia(idAgenda, idApresentacao) {
    const conteudoPrevia = document.getElementById('conteudoPrevia');
    if (!conteudoPrevia) return;

    conteudoPrevia.innerHTML = `
        <div class="text-center my-5 text-muted">
            <div class="spinner-border text-danger mb-2" role="status"></div>
            <p>A mapear cronograma e a calcular tempos estimados...</p>
        </div>`;

    const modal = new bootstrap.Modal(document.getElementById('modalPreviaPDF'));
    modal.show();

    try {

        const agenda = todasAgendas.find(a => a.id === idAgenda);
        const nomeApresentacao = agenda && agenda.apresentacao ? agenda.apresentacao.nome : (agenda ? agenda.localidade : "Apresentação");
        const dataAp = agenda ? agenda.Data.split('-').reverse().join('/') : "--/--/----";
        const horaAp = agenda && agenda.Horario ? agenda.Horario.substring(0, 5) : "--:--";
        const ruaAp = agenda && agenda.local ? `${agenda.local.rua || ''}` : "Não definido";


        document.getElementById('btnBaixarDoModal').onclick = function() {
            baixarPDF(idAgenda, idApresentacao);
        };

        const respRepertorio = await fetch(urlRepertorio+"?idApresentacao="+idApresentacao);
        let musicas = [];
        let formacoes = [];
        if (respRepertorio.ok) {
            const repertorioCompleto = await respRepertorio.json();

            musicas = repertorioCompleto.listaMusica || [];
            formacoes = repertorioCompleto.listaFormacao || [];
        }
        const tempoTotal = somarDuracoes(musicas);
        const respMembrosGeral = await fetch(urlIntegrantes+"?id="+idApresentacao);
        let todosMembrosGeral = [];
        if (respMembrosGeral.ok) {
            todosMembrosGeral = await respMembrosGeral.json();
        }

        let htmlPDF = `
            <div class="pdf-document-preview p-4 bg-white text-dark mx-auto" style="font-family: 'Noto Sans', sans-serif; border: 1px solid #ddd; font-size: 13px;">
            <div style="height: 4px; background: linear-gradient(90deg, #dc3545 0%, #ffc107 100%); margin: -24px -24px 20px -24px;"></div>
    
            <div class="text-center mb-3" style="background-color: #111111; margin: -20px -24px 15px -24px; padding: 15px; border-bottom: 3px solid #ffc107;">
                <img src="${SRC_LOGO_SHOKUIN}" alt="Shokuin Dantai Fênix" style="max-height: 40px; object-fit: contain; width: auto; margin-bottom: 5px;">
                <div class="text-white text-uppercase small fw-semibold" style="letter-spacing: 2px; color: #ccc !important;">Relatório Técnico Operacional de Palco</div>
            </div>
    
            <div class="text-center mb-4 mt-2">
                <h2 class="fw-extrabold text-uppercase text-dark m-0" style="font-weight: 900; letter-spacing: 1px; font-size: 26px; line-height: 1.1;">
                    ${nomeApresentacao}
                </h2>
            </div>
    
            <div class="mb-4 bg-light p-3 rounded border">
                <h6 class="fw-bold border-bottom pb-1 mb-2 text-secondary" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px;"><i class="bi bi-info-circle-fill me-1"></i> Dados do Evento</h6>
                <table class="table table-sm table-borderless m-0 small" style="vertical-align: middle;">
                    <tr>
                        <td class="fw-bold text-muted" style="width: 120px; padding-top: 4px;">Data / Horário:</td>
                        <td class="text-secondary fw-semibold" style="padding-top: 4px;">${dataAp} às ${horaAp}</td>
                    </tr>
                    <tr>
                        <td class="fw-bold text-muted">Localidade:</td>
                        <td class="text-secondary fw-semibold">${ruaAp}</td>
                    </tr>
                    <tr>
                        <td class="fw-bold text-muted" style="padding-bottom: 4px;">Tempo Estimado:</td>
                        <td style="padding-bottom: 4px;">
                            <span class="badge bg-danger text-white fw-bold px-2 py-1" style="font-size: 11px;">${tempoTotal}</span>
                        </td>
                    </tr>
                </table>
            </div>
    
            <div class="mb-4">
                <h6 class="fw-bold border-bottom pb-1 mb-3 text-dark" style="font-size: 12px; text-transform: uppercase;"><i class="bi bi-music-note-beamed text-danger me-1"></i> Cronograma Progressivo de Palco</h6>
        `;


        if (musicas.length > 0) {
            for (let i = 0; i < musicas.length; i++) {
                const m = musicas[i];
                const f = formacoes[i];

                const nomeMusica = m.nome || "Música sem Nome";
                const duracaoIndiv = m.duracao ? `(${m.duracao})` : "";

                const nomeFormacao = f ? f.forma_nome : "Geral";
                const base64Img = f ? f.forma_img : "";
                const idFormacao = f ? f.forma_id : null;

                let tocadoresFormacao = [];
                if(idFormacao){
                    try{
                        const respTocadores = await fetch("http://localhost:8080/formacao/get-tocadores?idFormacao="+idFormacao);
                        if(respTocadores.ok){
                            tocadoresFormacao = await respTocadores.json();
                        }
                    }catch(e){console.error(e)}
                }

                const srcImagem = base64Img ? `http://localhost:8080/uploads/formacoes/${base64Img}` : "/img/Formação_Generica.png";
                htmlPDF += `
                    <div class="mb-4 p-3 bg-white rounded border" style="border-color: #dee2e6 !important;">
                        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                            <span class="fw-bold text-dark">#${i + 1} - ${nomeMusica} <small class="text-muted fw-normal">${duracaoIndiv}</small></span>
                            <span class="badge bg-light text-dark border fw-medium">Palco: ${nomeFormacao}</span>
                        </div>
                        
                        <div class="text-center p-2 border rounded bg-light position-relative" style="max-height: 200px;">
                            <img src="${srcImagem}" alt="Mapa de Palco" class="img-fluid" style="max-height: 180px; object-fit: contain;">
                            <small class="position-absolute bottom-0 end-0 bg-dark text-white opacity-75 px-2 py-0.5" style="font-size: 8px;">Vista do Público</small>
                        </div>

                        <div>
                            <strong class="text-secondary d-block mb-1" style="font-size: 11px; text-transform: uppercase;">Tocadores Escalados na Música:</strong>
                            <div class="d-flex flex-wrap gap-1">
                                ${tocadoresFormacao.length > 0
                                    ? tocadoresFormacao.map(t => `<span class="badge bg-light text-dark border px-2 py-1" style="font-weight: 500;"><i class="bi bi-person text-muted me-1"></i>${t.nome || t}</span>`).join('')
                                    : `<span class="text-muted small italic">Nenhum tocador escalado para esta formação.</span>`
                                }
                            </div>
                        </div>
                    </div>`;
            }
        } else {
            htmlPDF += `<p class="text-muted text-center py-3">Nenhuma música vinculada no cronograma.</p>`;
        }

        htmlPDF += `
                </div>

                <div class="mt-4">
                    <h6 class="fw-bold border-bottom pb-1 mb-2 text-dark" style="font-size: 12px; text-transform: uppercase;"><i class="bi bi-people-fill text-secondary me-1"></i> Lista Geral de Convocados</h6>
                    <div class="p-3 bg-light rounded border">
                        <div class="row row-cols-2 row-cols-sm-3 g-2 small">
                            ${todosMembrosGeral.length > 0
            ? todosMembrosGeral.map(m => `<div class="col d-flex align-items-center gap-1 text-dark fw-medium"><i class="bi bi-check2-circle text-success fw-bold"></i> ${m.nome || m}</div>`).join('')
            : `<span class="text-muted p-2 italic">Nenhum membro listado na convocação geral de encerramento.</span>`
        }
                        </div>
                    </div>
                </div>
            </div>`;

        conteudoPrevia.innerHTML = htmlPDF;

    } catch (error) {
        console.error("Erro ao estruturar a prévia com imagem:", error);
        conteudoPrevia.innerHTML = `<p class="text-danger text-center my-4">Erro ao processar a prévia com os mapas de palco.</p>`;
    }
}

async function baixarPDF(idAgenda, idApresentacao) {
    if (typeof html2pdf === 'undefined') {
        alert("Erro: A biblioteca 'html2pdf' não foi carregada no seu HTML.");
        return;
    }

    const agenda = todasAgendas.find(a => a.id === idAgenda);
    const nomeApresentacao = agenda && agenda.apresentacao ? agenda.apresentacao.nome : (agenda ? agenda.localidade : "Relatorio_De_Palco");
    const nomeArquivo = `Detalhes da Apresentacao ${nomeApresentacao.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    let elementoParaConverter;
    let divTemporaria = null;

    const conteudoPrevia = document.getElementById('conteudoPrevia');
    const estaNaPreviaCorreta = conteudoPrevia &&
        conteudoPrevia.innerHTML.includes(nomeApresentacao) &&
        !conteudoPrevia.innerHTML.includes("spinner-border");

    if (estaNaPreviaCorreta) {

        elementoParaConverter = conteudoPrevia.querySelector('.pdf-document-preview');
    } else {

        console.log("Montando estrutura gráfica para download direto...");

        try {
            const dataAp = agenda ? agenda.Data.split('-').reverse().join('/') : "--/--/----";
            const horaAp = agenda && agenda.Horario ? agenda.Horario.substring(0, 5) : "--:--";
            const ruaAp = agenda && agenda.local ? `${agenda.local.rua || ''}` : "Não definido";


            const respRepertorio = await fetch(urlRepertorio + "?idApresentacao=" + idApresentacao);
            let musicas = [], formacoes = [];
            if (respRepertorio.ok) {
                const repertorioCompleto = await respRepertorio.json();
                musicas = repertorioCompleto.listaMusica || [];
                formacoes = repertorioCompleto.listaFormacao || [];
            }
            const tempoTotal = somarDuracoes(musicas);


            const respMembrosGeral = await fetch(urlIntegrantes + "?id=" + idApresentacao);
            let todosMembrosGeral = [];
            if (respMembrosGeral.ok) {
                todosMembrosGeral = await respMembrosGeral.json();
            }


            divTemporaria = document.createElement('div');
            divTemporaria.style.position = 'fixed';
            divTemporaria.style.top = '0';
            divTemporaria.style.left = '0';
            divTemporaria.style.width = '800px';
            divTemporaria.style.zIndex = '-9999';
            divTemporaria.style.opacity = '1';
            divTemporaria.style.pointerEvents = 'none';


            let htmlPDF = `
                <div class="pdf-document-preview p-4 bg-white text-dark mx-auto" style="font-family: 'Noto Sans', sans-serif; border: 1px solid #ddd; font-size: 13px; background-color: #ffffff !important;">
                    <div style="height: 4px; background: linear-gradient(90deg, #dc3545 0%, #ffc107 100%); margin: -24px -24px 20px -24px;"></div>
            
                    <div class="text-center mb-3" style="background-color: #111111; margin: -20px -24px 15px -24px; padding: 15px; border-bottom: 3px solid #ffc107;">
                        <img src="${SRC_LOGO_SHOKUIN}" alt="Shokuin Dantai Fênix" style="max-height: 40px; object-fit: contain; width: auto; margin-bottom: 5px;">
                        <div class="text-white text-uppercase small fw-semibold" style="letter-spacing: 2px; color: #ccc !important;">Relatório Técnico Operacional de Palco</div>
                    </div>
            
                    <div class="text-center mb-4 mt-2">
                        <h2 class="fw-extrabold text-uppercase text-dark m-0" style="font-weight: 900; letter-spacing: 1px; font-size: 26px; line-height: 1.1;">
                            ${nomeApresentacao}
                        </h2>
                    </div>
            
                    <div class="mb-4 bg-light p-3 rounded border" style="background-color: #f8f9fa !important; border: 1px solid #dee2e6 !important;">
                        <h6 class="fw-bold border-bottom pb-1 mb-2 text-secondary" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px;"><i class="bi bi-info-circle-fill me-1"></i> Dados do Evento</h6>
                        <table class="table table-sm table-borderless m-0 small" style="vertical-align: middle;">
                            <tr>
                                <td class="fw-bold text-muted" style="width: 120px; padding-top: 4px;">Data / Horário:</td>
                                <td class="text-secondary fw-semibold" style="padding-top: 4px;">${dataAp} às ${horaAp}</td>
                            </tr>
                            <tr>
                                <td class="fw-bold text-muted">Localidade:</td>
                                <td class="text-secondary fw-semibold">${ruaAp}</td>
                            </tr>
                            <tr>
                                <td class="fw-bold text-muted" style="padding-bottom: 4px;">Tempo Estimado:</td>
                                <td style="padding-bottom: 4px;">
                                    <span class="badge bg-danger text-white fw-bold px-2 py-1" style="font-size: 11px; background-color: #dc3545 !important;">${tempoTotal}</span>
                                </td>
                            </tr>
                        </table>
                    </div>
            
                    <div class="mb-4">
                        <h6 class="fw-bold border-bottom pb-1 mb-3 text-dark" style="font-size: 12px; text-transform: uppercase;"><i class="bi bi-music-note-beamed text-danger me-1"></i> Cronograma Progressivo de Palco</h6>
            `;

            if (musicas.length > 0) {
                for (let i = 0; i < musicas.length; i++) {
                    const m = musicas[i];
                    const f = formacoes[i];
                    const nomeMusica = m.nome || "Música sem Nome";
                    const duracaoIndiv = m.duracao ? `(${m.duracao})` : "";
                    const nomeFormacao = f ? f.forma_nome : "Geral";
                    const base64Img = f ? f.forma_img : "";
                    const idFormacao = f ? f.forma_id : null;
                    let tocadoresFormacao = [];
                    if(idFormacao){
                        try{
                            const respTocadores = await fetch("http://localhost:8080/formacao/get-tocadores?idFormacao="+idFormacao);
                            if(respTocadores.ok){
                                tocadoresFormacao = await respTocadores.json();
                            }
                        }catch(e){console.error(e)}
                    }
                    const srcImagem = base64Img ? `http://localhost:8080/uploads/formacoes/${base64Img}` : "/img/Formação_Generica.png";

                    htmlPDF += `
                        <div class="mb-4 p-3 bg-white rounded border" style="border-color: #dee2e6 !important; background-color: #ffffff !important; page-break-inside: avoid;">
                            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                                <span class="fw-bold text-dark">#${i + 1} - ${nomeMusica} <small class="text-muted fw-normal">${duracaoIndiv}</small></span>
                                <span class="badge bg-light text-dark border fw-medium" style="background-color: #f8f9fa !important; border: 1px solid #dee2e6 !important;">Palco: ${nomeFormacao}</span>
                            </div>
                            <div class="text-center p-2 border rounded" style="max-height: 200px; background-color: #f8f9fa !important;">
                                <img src="${srcImagem}" alt="Mapa de Palco" class="img-fluid" style="max-height: 180px; object-fit: contain;">
                            </div>

                            <div>
                                <strong class="text-secondary d-block mb-1" style="font-size: 11px; text-transform: uppercase;">Tocadores Escalados na Música:</strong>
                                <div class="d-flex flex-wrap gap-1">
                                    ${tocadoresFormacao.length > 0
                                        ? tocadoresFormacao.map(t => `<span class="badge bg-light text-dark border px-2 py-1" style="font-weight: 500;"><i class="bi bi-person text-muted me-1"></i>${t.nome || t}</span>`).join('')
                                        : `<span class="text-muted small italic">Nenhum tocador escalado para esta formação.</span>`
                                    }
                                </div>
                            </div>

                        </div>`;
                }
            } else {
                htmlPDF += `<p class="text-muted text-center py-3">Nenhuma música vinculada no cronograma.</p>`;
            }

            htmlPDF += `
                    </div>
            
                    <div class="mt-4" style="page-break-inside: avoid;">
                        <h6 class="fw-bold border-bottom pb-1 mb-2 text-dark" style="font-size: 12px; text-transform: uppercase;"><i class="bi bi-people-fill text-secondary me-1"></i> Lista Geral de Convocados</h6>
                        <div class="p-3 bg-light rounded border" style="background-color: #f8f9fa !important;">
                            <div class="row row-cols-3 g-2 small">
                                ${todosMembrosGeral.length > 0
                ? todosMembrosGeral.map(m => `<div class="col d-flex align-items-center gap-1 text-dark fw-medium" style="color: #212529 !important;">&bull; ${m.nome || m}</div>`).join('')
                : `<span class="text-muted p-2 italic">Nenhum membro listado na convocação geral de encerramento.</span>`
                }
                            </div>
                        </div>
                    </div>
                </div>`;

            divTemporaria.innerHTML = htmlPDF;
            document.body.appendChild(divTemporaria);
            elementoParaConverter = divTemporaria.querySelector('.pdf-document-preview');

        } catch (erro) {
            console.error("Erro ao processar download direto:", erro);
            alert("Erro ao tentar compilar os dados para o PDF.");
            return;
        }
    }

    const opt = {
        margin:       [12, 12, 12, 12],
        filename:     nomeArquivo,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(elementoParaConverter).save().then(() => {
        if (divTemporaria) {
            document.body.removeChild(divTemporaria);
        }
    });
    exibirSucesso(nomeArquivo+" baixado com sucesso!");
}

function exibirSucesso(mensagem) {
    document.getElementById("textoSucessoGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalSucessoGenerico"));
    modal.show();
}