function atualizarListaFormacoes() {
    fetch('/formacao/listar-todas')
        .then(res => res.json())
        .then(lista => {
            listaFormacoes = lista;
            renderizar(listaFormacoes);
        })
        .catch(err => console.error("Erro ao listar:", err));
}

let listaFormacoes = [];

function renderizar(lista) {
    const container = document.getElementById("cardsContainer");
    if (!container) return; // Segurança

    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">Nenhuma formação encontrada.</div>`;
        return;
    }

    lista.forEach(item => {
        let statusBadge = '';

        let imgTop = `
        <div style="height: 160px; display: flex; justify-content: center; align-items: center; border-top-left-radius: 1rem; border-top-right-radius: 1rem; overflow: hidden; background: radial-gradient(circle, #ffffff 0%, #f0f0f0 100%); border-bottom: 1px solid #eee;">
            <img id="img-capa-${item.forma_id}" src="" style="width: 100%; height: 100%; object-fit: contain; padding: 15px; display: none;" alt="Preview da Formação">
            <div id="loader-capa-${item.forma_id}" class="spinner-border text-secondary" role="status" style="width: 2rem; height: 2rem;"></div>
        </div>`;

        const musicaNome = item.musi_id && item.musi_id.nome ? item.musi_id.nome : 'Sem Música';
        const tempoMusica = item.musi_id && item.musi_id.duracao ? `${item.musi_id.duracao} min` : '-';

        container.innerHTML += `
        <div class="col formacao-item" data-nome="${item.forma_nome.toLowerCase()}">
            <div class="formation-card h-100 shadow-sm position-relative overflow-hidden rounded-4 d-flex flex-column bg-white">
                
                <!-- Capa da Formação (Preview) -->
                ${imgTop}
                
                <div class="p-4 d-flex flex-column flex-grow-1 position-relative z-1">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div></div> <!-- Espaçador para o statusBadge se voltarem a usar -->
                        <div class="dropdown">
                            <button class="btn btn-link text-muted p-0 text-decoration-none" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical fs-5"></i></button>
                            <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="border-radius: 12px;">
                                <li><a class="dropdown-item fw-medium py-2" href="DefinirFormação.html?idFormacao=${item.forma_id}"><i class="bi bi-pencil me-2 text-warning"></i>Editar Infos</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item fw-medium text-danger py-2" href="#" onclick="deletarFormacao(${item.forma_id}, '${item.forma_nome}')"><i class="bi bi-trash me-2"></i>Excluir</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <h4 class="font-display fw-bold mb-1" style="color: var(--taiko-ink);">${item.forma_nome}</h4>
                    <p class="text-muted small mb-4 d-flex align-items-center fw-medium">
                        <i class="bi bi-music-note-beamed me-2 fs-6 text-taiko-red"></i> ${musicaNome}
                    </p>
                    
                    <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center" style="border-color: rgba(0,0,0,0.05) !important;">
                        <div class="small text-muted fw-bold d-flex align-items-center" title="Duração da Música">
                            <i class="bi bi-clock-history me-1"></i> ${tempoMusica}
                        </div>
                        <a href="DefinirFormação.html?idFormacao=${item.forma_id}" class="btn stage-btn text-white fw-bold d-flex align-items-center gap-2 shadow-sm rounded-pill px-3 py-2 text-decoration-none" style="font-size: 0.85rem;">
                            <i class="bi bi-grid-3x3"></i> Palco
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    });

    // Lazy load das capas
    lista.forEach(item => {
        fetch('/formacao/capa/' + item.forma_id)
            .then(res => res.text())
            .then(data => {
                const loader = document.getElementById('loader-capa-' + item.forma_id);
                const imgEl = document.getElementById('img-capa-' + item.forma_id);
                if (loader) loader.style.display = 'none';
                
                if (imgEl && data && data.length > 50) {
                    imgEl.src = data;
                    imgEl.style.display = 'block';
                } else if (imgEl) {
                    // Sem capa
                    imgEl.parentElement.innerHTML = `
                    <div style="height: 160px; display: flex; align-items: center; justify-content: center; border-top-left-radius: 1rem; border-top-right-radius: 1rem; background: linear-gradient(135deg, rgba(168,26,26,0.1) 0%, rgba(204,153,51,0.1) 100%); border-bottom: 1px solid #eee; width: 100%;">
                        <i class="bi bi-music-note-list fs-1 text-muted opacity-50"></i>
                    </div>`;
                }
            })
            .catch(e => {
                const loader = document.getElementById('loader-capa-' + item.forma_id);
                if (loader) loader.style.display = 'none';
            });
    });
}


function filtrar() {
    const f = document.getElementById("busca").value.toLowerCase();
    if (!listaFormacoes) return;

    const filtrada = listaFormacoes.filter(i => {
        const nomeMatch = i.forma_nome && i.forma_nome.toLowerCase().includes(f);
        const musicaMatch = i.musi_id && i.musi_id.nome && i.musi_id.nome.toLowerCase().includes(f);
        return nomeMatch || musicaMatch;
    });

    renderizar(filtrada);
}

function excluirFormacao(id) {
    const formacao = { forma_id: id };
    const data = {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formacao)
    };
    fetch("/formacao/excluir-id", data)
        .then(resp => {
            if (resp.ok) {
                atualizarListaFormacoes();
            } else {
                alert("Erro ao excluir Formação!");
            }
        })
        .catch(Error => alert("Erro ao Exlcuir Formacao!"))
}

function deletarFormacao(id, nome, img) {
    const botao = document.getElementById('btnConfirmAction');
    botao.setAttribute("onclick", "excluirFormacao('" + id + "')");

    const mensagem = document.getElementById("confirmMessage");
    let imgHtml = "";
    if (img) {
        imgHtml = `
        <div class="mt-3 text-center">
            <img src="${img}" class="img-fluid rounded border" style="max-height: 120px; object-fit: contain;">
        </div>`;
    }

    mensagem.innerHTML = `Tem certeza que deseja excluir a formação <strong>${nome}</strong>? Esta ação não poderá ser desfeita.${imgHtml}`;

    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

function abrirModalConfirmacao() {
    const titulo = document.getElementById('messageTitle');
    const subtitulo = document.getElementById('messageSubtitle');
    const corpo = document.getElementById('messageBody');

    if (titulo) titulo.innerHTML = "Sucesso!";
    if (subtitulo) subtitulo.innerHTML = "Exclusão";
    if (corpo) corpo.innerHTML = "A formação foi removida com sucesso.";

    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    modal.show();
}

window.onload = () => {
    carregarHome();
    atualizarListaFormacoes();
};


let catalogoInstrumentos = {};
let canvasOculto = null;

async function carregarCatalogoInstrumentos() {
    try {
        const resp = await fetch("/apiInstrumento/getAllInstrumentosIncludeInactive");
        if (!resp.ok) throw new Error("Erro ao buscar instrumentos");
        let data = await resp.json();

        if (data.length > 0 && data[0].instrumento) {
            data = data.map(est => est.instrumento);
        }

        catalogoInstrumentos = {};
        data.forEach(inst => {
            catalogoInstrumentos[inst.instru_id] = inst;
            catalogoInstrumentos[inst.instru_nome] = inst;
        });
    } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
    }
}

function processarInstrumentoOculto(dados, canvas) {
    return new Promise((resolve) => {
        if (dados.tipo && dados.tipo.toLowerCase() === "texto") {
            const options = {
                left: dados.left != null ? parseFloat(dados.left) : 150,
                top: dados.top != null ? parseFloat(dados.top) : 150,
                angle: dados.angle != null ? parseFloat(dados.angle) : 0,
                scaleX: dados.scaleX != null ? parseFloat(dados.scaleX) : 1,
                scaleY: dados.scaleY != null ? parseFloat(dados.scaleY) : 1,
                fontSize: dados.fontSize != null ? parseInt(dados.fontSize) : 20,
                fontFamily: dados.fontFamily || 'Arial',
                fill: dados.fill || '#000000',
                textBackgroundColor: dados.textBackgroundColor || '',
                backgroundColor: dados.backgroundColor || '',
                fontWeight: dados.fontWeight || 'normal',
                fontStyle: dados.fontStyle || 'normal',
                textAlign: dados.textAlign || 'left',
                stroke: dados.stroke || null,
                strokeWidth: dados.strokeWidth != null ? parseFloat(dados.strokeWidth) : 0
            };

            if (dados.shadow) {
                options.shadow = new fabric.Shadow({
                    color: dados.shadow.color || '#000000',
                    blur: dados.shadow.blur != null ? parseInt(dados.shadow.blur) : 5,
                    offsetX: dados.shadow.offsetX != null ? parseInt(dados.shadow.offsetX) : 3,
                    offsetY: dados.shadow.offsetY != null ? parseInt(dados.shadow.offsetY) : 3
                });
            }

            const textObj = new fabric.IText(dados.textoConteudo || "Novo Texto", options);
            canvas.add(textObj);
            resolve();
            return;
        }

        let infoBanco = null;
        if (dados.idBanco) {
            infoBanco = Object.values(catalogoInstrumentos).find(inst => inst.instru_id == dados.idBanco);
        }
        if (!infoBanco) {
            infoBanco = catalogoInstrumentos[dados.tipo];
        }
        if (!infoBanco && dados.tipo) {
            infoBanco = Object.values(catalogoInstrumentos).find(inst => {
                const nomeDb = inst.instru_nome.toLowerCase();
                const nomeJson = dados.tipo.toLowerCase();
                return nomeDb.includes(nomeJson) || nomeJson.includes(nomeDb);
            });
        }

        if (!infoBanco) {
            console.error("Instrumento não encontrado:", dados.tipo);
            resolve(); // Ignora
            return;
        }

        let dataUrlImg = infoBanco.instru_img;
        let isSvg = false;
        if (dataUrlImg && dataUrlImg.startsWith("data:image/svg+xml")) {
            isSvg = true;
        }

        const applyProperties = (obj) => {
            obj.set({
                left: dados.left,
                top: dados.top,
                angle: dados.angle,
                scaleX: dados.scaleX,
                scaleY: dados.scaleY
            });
            canvas.add(obj);

            if (dados.idTocador) {
                const nomeExibicao = (dados.apelidoTocador && dados.apelidoTocador.trim() !== "") ? dados.apelidoTocador : dados.nomeTocador;
                const label = new fabric.Text(nomeExibicao, {
                    left: dados.left + (dados.rotuloOffsetX !== undefined ? dados.rotuloOffsetX : 0),
                    top: dados.top + (dados.rotuloOffsetY !== undefined ? dados.rotuloOffsetY : -25),
                    fontSize: dados.rotuloFontSize !== undefined ? dados.rotuloFontSize : 20,
                    fontFamily: dados.rotuloFontFamily || 'Noto Sans',
                    fontWeight: dados.rotuloFontWeight || 'bold',
                    fontStyle: dados.rotuloFontStyle || 'normal',
                    fill: dados.rotuloFill || '#1e293b',
                    backgroundColor: dados.rotuloBackgroundColor || 'rgba(255, 255, 255, 0.8)',
                    textBackgroundColor: dados.rotuloTextBackgroundColor || ''
                });
                canvas.add(label);
            }
        };

        if (isSvg) {
            fabric.loadSVGFromURL(dataUrlImg, function (objects, options) {
                var svgData = fabric.util.groupSVGElements(objects, options);
                applyProperties(svgData);
                resolve();
            });
        } else {
            fabric.Image.fromURL(dataUrlImg, function (img) {
                applyProperties(img);
                resolve();
            });
        }
    });
}

async function renderizarFormacaoParaImagem(formacaoJson) {
    if (!canvasOculto) {
        canvasOculto = new fabric.StaticCanvas('hiddenCanvas');
    }

    const dadosFormacao = JSON.parse(formacaoJson);
    const largura = (dadosFormacao.largura || 14) * 80;
    const altura = (dadosFormacao.altura || 8) * 80;

    canvasOculto.setWidth(largura);
    canvasOculto.setHeight(altura);
    canvasOculto.clear();
    canvasOculto.backgroundColor = '#ffffff';

    const exibirGrade = dadosFormacao.exibirGrade !== undefined ? dadosFormacao.exibirGrade : true;
    const exibirCentro = dadosFormacao.exibirCentro !== undefined ? dadosFormacao.exibirCentro : true;

    if (exibirGrade) {
        const colunas = dadosFormacao.colunas || 14;
        const linhas = dadosFormacao.linhas || 8;
        const tamanhoColuna = largura / colunas;
        const tamanhoLinha = altura / linhas;
        for (let i = 0; i <= colunas; i++) {
            canvasOculto.add(new fabric.Line([i * tamanhoColuna, 0, i * tamanhoColuna, altura], { stroke: '#e5e7eb', strokeWidth: 1, selectable: false }));
        }
        for (let i = 0; i <= linhas; i++) {
            canvasOculto.add(new fabric.Line([0, i * tamanhoLinha, largura, i * tamanhoLinha], { stroke: '#e5e7eb', strokeWidth: 1, selectable: false }));
        }
    }

    if (exibirCentro) {
        const centroX = largura / 2;
        canvasOculto.add(new fabric.Line([centroX, 0, centroX, altura], { stroke: 'rgba(198, 40, 40, 0.4)', strokeDashArray: [5, 5], strokeWidth: 2, selectable: false }));
        canvasOculto.add(new fabric.Line([40, altura - 20, largura - 40, altura - 20], { stroke: 'rgba(198, 40, 40, 0.6)', strokeWidth: 4, selectable: false }));
        canvasOculto.add(new fabric.Text('Público / Visão', {
            left: centroX, top: altura - 10, originX: 'center', originY: 'center',
            fontSize: 12, fontFamily: 'Noto Sans', fill: 'rgba(198, 40, 40, 1)', selectable: false
        }));
    }

    if (dadosFormacao.instrumentos && dadosFormacao.instrumentos.length > 0) {
        const promessas = dadosFormacao.instrumentos.map(item => processarInstrumentoOculto(item, canvasOculto));
        await Promise.all(promessas);
    }

    canvasOculto.renderAll();
    return canvasOculto.toDataURL({
        format: 'jpeg',
        quality: 0.8
    });
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

async function atualizarTodasCapas() {
    if (!listaFormacoes || listaFormacoes.length === 0) {
        mostrarModalAlerta("Aviso", "Não há formações cadastradas.");
        return;
    }

    const modalProgresso = new bootstrap.Modal(document.getElementById('modalProgressoCapas'));
    modalProgresso.show();

    const barra = document.getElementById('barraProgressoCapas');
    const texto = document.getElementById('textoProgressoCapas');

    barra.classList.remove('bg-success');
    barra.classList.add('progress-bar-animated', 'bg-taiko-red');
    barra.style.width = '0%';

    await carregarCatalogoInstrumentos();

    const total = listaFormacoes.length;
    let atual = 0;

    for (const formacao of listaFormacoes) {
        atual++;
        texto.innerText = `Atualizando ${atual} de ${total}: ${formacao.forma_nome}`;
        barra.style.width = `${(atual / total) * 100}%`;

        try {
            // Busca a formação completa porque listarTodas não traz o JSON do palco
            const respCompleta = await fetch(`/formacao/buscar-formacao/${formacao.forma_id}`);
            if (!respCompleta.ok) {
                console.error("Falha ao buscar detalhes da formação", formacao.forma_nome);
                continue;
            }
            const formacaoCompleta = await respCompleta.json();

            if (formacaoCompleta.forma_instrumentos) {
                const dataUrl = await renderizarFormacaoParaImagem(formacaoCompleta.forma_instrumentos);

                formacaoCompleta.forma_img = dataUrl;

                const responseUpd = await fetch('/formacao/atualizar-formacao', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formacaoCompleta)
                });

                if (!responseUpd.ok) {
                    console.error("Falha ao atualizar DB para", formacao.forma_nome);
                }
            }
        } catch (err) {
            console.error("Erro ao atualizar a formação", formacao.forma_nome, err);
        }
    }

    texto.innerText = "Concluído!";
    barra.classList.remove('progress-bar-animated', 'bg-taiko-red');
    barra.classList.add('bg-success');

    setTimeout(() => {
        modalProgresso.hide();
        mostrarModalAlerta("Sucesso", "Todas as capas foram atualizadas com os novos modelos de instrumentos!", "sucesso");
        atualizarListaFormacoes();
    }, 1500);
}
