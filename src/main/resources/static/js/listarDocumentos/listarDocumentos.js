const urlDoc = "http://localhost:8080/doc";
let listaDocs = [];

async function listarDocumentos() {
    const container = document.getElementById('lista-documentos');
    try {
        const resp = await fetch(urlDoc + "/get-all");

        if (resp.ok) {
            listaDocs = await resp.json();

            if (listaDocs.length > 0) {
                exibirDocs(listaDocs);
            } else {
                mostrarMensagemVazia(container, "Nenhum documento encontrado.");
            }
        } else {
            mostrarMensagemVazia(container, "Não foi possível carregar a lista de documentos.");
        }
    } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        mostrarMensagemVazia(container, "Erro de conexão com o servidor.");
    }
}

function exibirDocs(lista) {
    const container = document.getElementById('lista-documentos');
    container.innerHTML = '';

    lista.forEach(doc => {
        const nomeDocumento = doc.nome;
        const nomeApresentacao = doc.apresentacao.nome;

        const cardHTML = `
            <div class="event-item rounded-3 p-3 d-flex align-items-center justify-content-between border border-light shadow-sm flex-wrap gap-3" 
                 style="background-color: #fafafa; transition: transform 0.2s;"
                 onmouseover="this.style.transform='translateY(-2px)';" 
                 onmouseout="this.style.transform='translateY(0)';">
                 
                <div class="d-flex align-items-center gap-3 flex-grow-1">
                    <div class="event-date-box flex-shrink-0 shadow-sm d-flex flex-column align-items-center justify-content-center bg-light" style="width: 55px; height: 55px;">
                        <span class="text-taiko-red fw-bold text-uppercase d-block lh-1 mb-1" style="font-size: 0.7rem;">DOC</span>
                        <i class="bi bi-file-earmark-text text-dark fs-5"></i>
                    </div>
                    
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <h5 class="fw-bold text-dark mb-0 fs-6">${nomeDocumento}</h5>
                            
                            <span class="badge rounded-pill text-bg-dark fw-semibold px-2 py-1" style="font-size: 0.7rem; background-color: var(--taiko-red) !important;">
                                <i class="bi bi-journal-check me-1"></i> ${nomeApresentacao}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2 flex-shrink-0 align-items-center matching-actions">
                    <button class="btn btn-sm btn-outline-dark fw-semibold d-flex align-items-center gap-1 shadow-sm" 
                            onclick="verPrevia(${doc.id})">
                        <i class="bi bi-eye"></i> Prévia
                    </button>
                    <button class="btn btn-sm btn-taiko fw-bold d-flex align-items-center gap-1 shadow-sm" 
                            onclick="baixarDocumento(${doc.id})">
                        <i class="bi bi-download"></i> Baixar
                    </button>
                </div>
            </div>`;

        container.innerHTML += cardHTML;
    });
}

async function verPrevia(id) {
    const doc = listaDocs.find(d => String(d.id) === String(id));
    if (!doc) return;
    document.getElementById("previaTitulo").innerText = doc.nome;
    document.getElementById("previaSubtitulo").innerText = `Pertence à Apresentação: ${doc.apresentacao.nome}`;
    const conteudoRichText = doc.conteudo || "<p class='text-muted'>Este documento não possui nenhum conteúdo cadastrado.</p>";
    document.getElementById("previaConteudo").innerHTML = conteudoRichText;
    document.getElementById("btnBaixarDoModal").setAttribute("onclick", `baixarDocumento(${id})`);
    const elementoModal = document.getElementById('modalPrevia');
    const modal = new bootstrap.Modal(elementoModal);
    modal.show();
}


function carregarImagemLogo(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}

async function baixarDocumento(id) {
    const doc = listaDocs.find(d => String(d.id) === String(id));
    if (!doc) {
        alert("Documento não encontrado para download.");
        return;
    }

    const nomeArquivo = doc.titulo || doc.nome || "Documento";
    const conteudoHTML = doc.conteudo || doc.texto;
    const nomeApresentacao = doc.apresentacao ? (doc.apresentacao.nome || doc.apresentacao) : "Apresentação Não Informada";

    if (!conteudoHTML) {
        alert("Este documento está vazio e não pode ser exportado.");
        return;
    }

    const urlLogo = "img/dantaiFenix.png";

    let logoImg = null;
    try {
        logoImg = await carregarImagemLogo(urlLogo);
    } catch (error) {
        console.warn("Não foi possível carregar o logótipo dantaiFenix.png.", error);
    }

    const folhaVirtual = document.createElement('div');
    folhaVirtual.className = 'ql-editor';

    folhaVirtual.style.padding = '2.5cm 2cm 3.5cm 2cm';
    folhaVirtual.style.width = '21cm';
    folhaVirtual.style.fontFamily = "'Noto Sans', sans-serif";
    folhaVirtual.style.backgroundColor = '#ffffff';
    folhaVirtual.style.color = '#212529';
    folhaVirtual.style.fontSize = '12pt';
    folhaVirtual.style.lineHeight = '1.6';
    folhaVirtual.innerHTML = conteudoHTML;

    const configuracoes = {
        margin:       0,
        filename:     `${nomeArquivo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    try {
        console.log(`Gerando PDF de: ${nomeArquivo}...`);

        await html2pdf()
            .set(configuracoes)
            .from(folhaVirtual)
            .toPdf()
            .get('pdf')
            .then(function (pdf) {
                const totalPages = pdf.internal.getNumberOfPages();

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);

                    pdf.setFillColor(0, 0, 0);
                    pdf.rect(0, 27.5, 21, 2.2, 'F');

                    let margemTextoEsquerda = 2;

                    if (logoImg) {
                        pdf.addImage(logoImg, 'PNG', 2, 28.3, 2.2, 0.6);

                        margemTextoEsquerda = 4.7;
                    }
                    pdf.setFont("Helvetica", "normal");
                    pdf.setFontSize(9);
                    pdf.setTextColor(255, 255, 255);

                    pdf.text(`Apresentação: ${nomeApresentacao}`, margemTextoEsquerda, 28.7);
                    pdf.text(`Página ${i} de ${totalPages}`, 19, 28.7, { align: 'right' });
                }
            })
            .save();
        exibirSucesso(nomeArquivo+" baixado com sucesso!");

    } catch (error) {
        exibirErro("Não foi possivel baixar o documento!\nTente novamente mais tarde");
    }
}

function filtrarDocumentos() {
    const termo = document.getElementById("campoPesquisaDoc").value.toLowerCase().trim();
    const container = document.getElementById('lista-documentos');

    if (!termo) {
        exibirDocs(listaDocs);
        return;
    }

    const listaFiltrada = listaDocs.filter(doc => {
        const titulo = doc.nome.toLowerCase();
        const apresentacao = doc.apresentacao.nome.toLowerCase();

        return titulo.includes(termo) || apresentacao.includes(termo);
    });

    exibirDocs(listaFiltrada);

    if (listaFiltrada.length === 0) {
        mostrarMensagemVazia(container, `Nenhum documento encontrado para "${termo}".`);
    }
}

function mostrarMensagemVazia(container, mensagem) {
    container.innerHTML = `
        <div class="text-center p-5 text-muted">
            <i class="bi bi-file-earmark-x display-4 mb-3 d-block opacity-50"></i>
            <p class="mb-0">${mensagem}</p>
        </div>`;
}

function exibirErro(mensagem) {
    document.getElementById("textoErroGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalErroGenerico"));
    modal.show();
}

function exibirSucesso(mensagem) {
    document.getElementById("textoSucessoGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalSucessoGenerico"));
    modal.show();
}