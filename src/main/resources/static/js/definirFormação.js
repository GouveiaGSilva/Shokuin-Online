const PIXELS_POR_METRO = 80;
const PIXELS_INSTRUMENTO = 50;
let palco;
let linhasGrade = [];
let idFormacaoAtual = null;
let catalogoInstrumentos = {};
let listaMembrosGlobal = [];
let listaMembrosFormacao = [];
let modoListaTocadores = 'geral'; // 'geral' ou 'formacao'
let formacaoFoiModificada = false;

window.addEventListener('beforeunload', function (e) {
    if (formacaoFoiModificada) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja sair sem salvar?';
        return e.returnValue;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function (e) {
            const destino = this.getAttribute('href');
            if (destino && destino !== '#' && !destino.startsWith('javascript:') && formacaoFoiModificada) {
                e.preventDefault();

                const btnConfirm = document.getElementById('btnConfirmAction');
                if (btnConfirm) {
                    btnConfirm.onclick = () => {
                        formacaoFoiModificada = false; // Desativa a proteção para poder navegar
                        window.location.href = destino;
                    };
                }

                const btnSaveAndLeave = document.getElementById('btnSaveAndLeave');
                if (btnSaveAndLeave) {
                    btnSaveAndLeave.onclick = () => {
                        window.destinoAposSalvar = destino;
                        salvarFormacao();
                    };
                }

                const modalEl = document.getElementById('confirmModal');
                if (modalEl) {
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
            }
        });
    });
});

function mostrarMensagemSucesso(titulo, msg) {
    const titleEl = document.getElementById('messageTitle');
    const bodyEl = document.getElementById('messageBody');
    const iconContainer = document.getElementById('messageIconContainer');
    const iconEl = document.getElementById('messageIcon');
    const modalEl = document.getElementById('messageModal');

    if (titleEl) titleEl.innerText = titulo;
    if (bodyEl) bodyEl.innerHTML = msg;
    if (iconContainer) iconContainer.className = 'text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm bg-success';
    if (iconEl) iconEl.className = 'bi bi-check-lg fs-5';

    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        alert(titulo + ": " + msg);
    }
}

function mostrarMensagemErro(titulo, msg) {
    const titleEl = document.getElementById('messageTitle');
    const bodyEl = document.getElementById('messageBody');
    const iconContainer = document.getElementById('messageIconContainer');
    const iconEl = document.getElementById('messageIcon');
    const modalEl = document.getElementById('messageModal');

    if (titleEl) titleEl.innerText = titulo;
    if (bodyEl) bodyEl.innerHTML = msg;
    if (iconContainer) iconContainer.className = 'text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm bg-danger';
    if (iconEl) iconEl.className = 'bi bi-x-circle fs-5';

    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        alert(titulo + ": " + msg);
    }
}


const containerPalco = document.getElementById('stageBoundary');
const exibirGradeToggle = document.getElementById('showGrid');
const colunasGradeInput = document.getElementById('gridCols');
const linhasGradeInput = document.getElementById('gridRows');
const larguraPalcoInput = document.getElementById('stageWidth');
const profundidadePalcoInput = document.getElementById('stageHeight');
const exibirCentroToggle = document.getElementById('showCenterGuides');

function editarTitulo() {
    let titulo = document.getElementById("tituloFormacao")
    titulo.focus();
}

function iniciarPalco() {
    palco = new fabric.Canvas('Canvas', {
        selection: true,
        selectionColor: 'rgba(100, 100, 255, 0.3)', // Cor do retângulo de seleção
        selectionBorderColor: 'blue',
        selectionLineWidth: 1,
        preserveObjectStacking: true,
        backgroundColor: '#ffffff'
    });
    atualizarDimensoesPalco();

    palco.on('object:modified', () => { salvarEstado(); atualizarPainelParticipantes(); });
    palco.on('object:added', () => { salvarEstado(); atualizarPainelParticipantes(); });
    palco.on('object:removed', () => { salvarEstado(); atualizarPainelParticipantes(); });
    palco.on('mouse:dblclick', manipularDuploClique);

    palco.on('selection:created', atualizarToolbarTexto);
    palco.on('selection:updated', atualizarToolbarTexto);
    palco.on('selection:cleared', atualizarToolbarTexto);

    function atualizarOffsetRotulo(instrumento, rotulo) {
        instrumento.rotuloOffsetX = rotulo.left - instrumento.left;
        instrumento.rotuloOffsetY = rotulo.top - instrumento.top;
    }

    palco.on('object:modified', function (e) {
        const obj = e.target;
        if (obj && obj.tipoInstrumento === "RotuloTocador" && obj.instrumentoPai) {
            atualizarOffsetRotulo(obj.instrumentoPai, obj);
        }
        salvarEstado();
        atualizarPainelParticipantes();
    });

    palco.on('object:moving', function (e) {
        const obj = e.target;
        if (obj && obj.labelTocador) {
            obj.labelTocador.set({
                left: obj.left + (obj.rotuloOffsetX || 0),
                top: obj.top + (obj.rotuloOffsetY || 40)
            });
            obj.labelTocador.setCoords();
        }
    });

    salvarEstado();
    configurarEventosToolbarTexto();
    atualizarToolbarTexto();

    colunasGradeInput.addEventListener('change', () => { desenharGrade(); formacaoFoiModificada = true; });
    linhasGradeInput.addEventListener('change', () => { desenharGrade(); formacaoFoiModificada = true; });
    exibirGradeToggle.addEventListener('change', () => { desenharGrade(); formacaoFoiModificada = true; });

    larguraPalcoInput.addEventListener('change', () => { atualizarDimensoesPalco(); formacaoFoiModificada = true; });
    profundidadePalcoInput.addEventListener('change', () => { atualizarDimensoesPalco(); formacaoFoiModificada = true; });
    exibirCentroToggle.addEventListener('change', () => { desenharGrade(); formacaoFoiModificada = true; });

    document.getElementById("tituloFormacao").addEventListener('input', () => formacaoFoiModificada = true);

    const selectMusica = document.getElementById("listaMusicas");
    if (selectMusica) {
        selectMusica.addEventListener('change', () => formacaoFoiModificada = true);
    }

    setTimeout(() => { formacaoFoiModificada = false; }, 100);
}

function atualizarDimensoesPalco() {
    const metrosLargura = parseInt(larguraPalcoInput.value) || 14;
    const metrosProfundidade = parseInt(profundidadePalcoInput.value) || 8;

    const larguraPx = metrosLargura * PIXELS_POR_METRO;
    const alturaPx = metrosProfundidade * PIXELS_POR_METRO;

    palco.setWidth(larguraPx);
    palco.setHeight(alturaPx);

    containerPalco.style.width = larguraPx + 'px';
    containerPalco.style.height = alturaPx + 'px';

    desenharGrade();
}

function desenharGrade() {
    linhasGrade.forEach(linha => palco.remove(linha));
    linhasGrade = [];

    const largura = Math.max(palco.width, 100);
    const altura = Math.max(palco.height, 100);

    if (exibirGradeToggle.checked) {
        const colunas = parseInt(colunasGradeInput.value) || 10;
        const linhas = parseInt(linhasGradeInput.value) || 8;

        const tamanhoColuna = largura / colunas;
        const tamanhoLinha = altura / linhas;

        for (let i = 0; i <= colunas; i++) {
            const linhaVertical = new fabric.Line([i * tamanhoColuna, 0, i * tamanhoColuna, altura], {
                stroke: '#e5e7eb',
                strokeWidth: 1,
                selectable: false,
                evented: false
            });
            linhasGrade.push(linhaVertical);
            palco.add(linhaVertical);
        }
        for (let i = 0; i <= linhas; i++) {
            const linhaHorizontal = new fabric.Line([0, i * tamanhoLinha, largura, i * tamanhoLinha], {
                stroke: '#e5e7eb', strokeWidth: 1,
                selectable: false,
                evented: false
            });
            linhasGrade.push(linhaHorizontal);
            palco.add(linhaHorizontal);
        }
    }

    if (exibirCentroToggle.checked) {
        const centroX = largura / 2;
        const linhaCentral = new fabric.Line([centroX, 0, centroX, altura], {
            stroke: 'rgba(198, 40, 40, 0.4)',
            strokeDashArray: [5, 5],
            strokeWidth: 2,
            selectable: false,
            evented: false
        });
        linhasGrade.push(linhaCentral);
        palco.add(linhaCentral);

        const linhaFrente = new fabric.Line([40, altura - 20, largura - 40, altura - 20], {
            stroke: 'rgba(198, 40, 40, 0.6)',
            strokeWidth: 4,
            selectable: false,
            evented: false
        });
        linhasGrade.push(linhaFrente);
        palco.add(linhaFrente);

        const textoVisao = new fabric.Text('Público / Visão', {
            left: centroX, top: altura - 10, originX: 'center', originY: 'center',
            fontSize: 12, fontFamily: 'Noto Sans',
            fill: 'rgba(198, 40, 40, 1)',
            selectable: false,
            evented: false
        });
        linhasGrade.push(textoVisao);
        palco.add(textoVisao);
    }

    linhasGrade.forEach(l => palco.sendToBack(l));
    palco.requestRenderAll();
}

function insereTexto() {
    const conteudo = "Novo Texto";
    const options = {
        left: 150,
        top: 150,
        fontSize: parseInt(document.getElementById('textFontSize').value) || 20,
        fontFamily: document.getElementById('textFontFamily').value || 'Arial',
        fill: document.getElementById('textFill').value || '#000000',
        fontWeight: document.getElementById('btnTextBold').classList.contains('active') ? 'bold' : 'normal',
        fontStyle: document.getElementById('btnTextItalic').classList.contains('active') ? 'italic' : 'normal',
        tipoInstrumento: "Texto"
    };



    // Marcador (textBackgroundColor)
    if (document.getElementById('textHasHighlight').checked) {
        options.textBackgroundColor = document.getElementById('textHighlightColor').value;
    }

    // Fundo da Caixa (backgroundColor)
    if (document.getElementById('textHasBg').checked) {
        options.backgroundColor = document.getElementById('textBgColor').value;
    }

    // Borda (stroke / strokeWidth)
    if (document.getElementById('textHasStroke').checked) {
        options.stroke = document.getElementById('textStrokeColor').value;
        options.strokeWidth = parseFloat(document.getElementById('textStrokeWidth').value) || 1;
    }

    // Sombra (shadow)
    if (document.getElementById('textHasShadow').checked) {
        options.shadow = new fabric.Shadow({
            color: document.getElementById('textShadowColor').value,
            blur: parseInt(document.getElementById('textShadowBlur').value) || 5,
            offsetX: parseInt(document.getElementById('textShadowOffsetX').value) || 3,
            offsetY: parseInt(document.getElementById('textShadowOffsetY').value) || 3
        });
    }

    const texto = new fabric.IText(conteudo, options);
    palco.add(texto);
    palco.setActiveObject(texto);
    palco.renderAll();
}

function inserirInstrumento(id) {
    fetch("/apiInstrumento/getInstrumentos?id=" + id)
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {

                        let nomeArquivo = data.instru_img;
                        let extensao = nomeArquivo.substring(nomeArquivo.lastIndexOf('.') + 1);
                        if (extensao === "svg")
                            insereSvg(data)
                        else
                            insereImagem(data)
                    })
        })
        .catch(Error => {
            console.error(Error)
        })
}
function insereSvg(instrumento) {
    const path = "/uploads/" + instrumento.instru_img + "?v=" + Date.now();

    fabric.loadSVGFromURL(path, function (objects, options) {
        var svgData = fabric.util.groupSVGElements(objects, options);
        const inputZoom = document.getElementById('inputFatorZoom');
        const fatorZoom = inputZoom ? parseFloat(inputZoom.value) : 0.2;
        svgData.set({
            scaleX: fatorZoom,
            scaleY: fatorZoom
        });
        svgData.set({
            left: 150,
            top: 150,
            idBanco: instrumento.instru_id,
            tipoInstrumento: instrumento.instru_nome
        });

        palco.add(svgData);
        palco.renderAll();
    });
}

function insereImagem(instrumento) {
    const path = "/uploads/" + instrumento.instru_img + "?v=" + Date.now();

    fabric.Image.fromURL(path, function (img) {
        const inputZoom = document.getElementById('inputFatorZoom');
        const fatorZoom = inputZoom ? parseFloat(inputZoom.value) : 0.3;
        img.set({
            scaleX: fatorZoom,
            scaleY: fatorZoom,
            left: 150,
            top: 150,
            idBanco: instrumento.instru_id,
            tipoInstrumento: instrumento.instru_nome
        });

        palco.add(img);
        palco.renderAll();
    });
}

async function montarAuxiliares() {
    await listarInstrumentos();
    await listarMusicas();
    await listarParticipantes();
}

async function listarInstrumentos() {
    try {
        // Busca TODOS (incluindo inativos) para popular o catálogo e não quebrar formações antigas
        const respTodos = await fetch("/apiInstrumento/getAllInstrumentosIncludeInactive");
        if (!respTodos.ok) throw new Error("Erro ao buscar todos instrumentos");
        let dataTodos = await respTodos.json();
        
        if (dataTodos.length > 0 && dataTodos[0].instrumento) {
            dataTodos = dataTodos.map(est => est.instrumento);
        }

        catalogoInstrumentos = {};
        dataTodos.forEach(inst => {
            catalogoInstrumentos[inst.instru_id] = inst;
            catalogoInstrumentos[inst.instru_nome] = inst;
        });

        // Busca APENAS OS ATIVOS para renderizar a barra de ferramentas
        const respAtivos = await fetch("/apiInstrumento/getAllInstrumentos");
        if (!respAtivos.ok) throw new Error("Erro ao buscar instrumentos ativos");
        let dataAtivos = await respAtivos.json();
        
        if (dataAtivos.length > 0 && dataAtivos[0].instrumento) {
            dataAtivos = dataAtivos.map(est => est.instrumento);
        }

        window.instrumentosAtivosCache = dataAtivos;

        construirBarraFerramentas(dataAtivos);
        return dataAtivos;
    } catch (error) {
        console.error(error);
    }
};

async function listarParticipantes() {
    try {
        const resp = await fetch("/apimembro/get-membro");
        if (!resp.ok)
            throw new Error("Erro ao buscar participantes");
        listaMembrosGlobal = await resp.json();
        atualizarPainelParticipantes();
        return listaMembrosGlobal;
    } catch (error) {
        console.error(error);
    }
}

function atualizarPainelParticipantes() {
    const containerTodos = document.getElementById("listaMembros");
    const containerFormacao = document.getElementById("listaMembrosFormacaoPanel");
    
    let atribuicoes = {};
    if (palco) {
        palco.getObjects().forEach(obj => {
            if (obj.idTocador) {
                if (!atribuicoes[obj.idTocador]) atribuicoes[obj.idTocador] = [];
                atribuicoes[obj.idTocador].push(obj.tipoInstrumento);
            }
        });
    }

    const termoBusca = document.getElementById("buscaMembroPainel") ? document.getElementById("buscaMembroPainel").value.toLowerCase() : "";

    function gerarHtmlMembro(membro) {
        if (termoBusca && !membro.nome.toLowerCase().includes(termoBusca)) return "";
        const nomePartes = membro.nome.split(' ');
        let iniciais = "";
        if (nomePartes.length > 1) {
            iniciais = (nomePartes[0][0] + nomePartes[1][0]).toUpperCase();
        } else if (nomePartes[0].length >= 2) {
            iniciais = nomePartes[0].substring(0, 2).toUpperCase();
        } else {
            iniciais = nomePartes[0].toUpperCase();
        }
        const instrumentosAtribuidos = atribuicoes[membro.id];
        const status = instrumentosAtribuidos ? instrumentosAtribuidos.join(', ') : 'Não Atribuído';
        const opacityClass = instrumentosAtribuidos ? 'text-primary fw-medium' : 'text-muted';

        return `
        <div class="participant-item">
            <div class="avatar-circle shadow-sm" style="${instrumentosAtribuidos ? 'background-color: var(--taiko-red); color: white;' : ''}">${iniciais}</div>
            <div class="flex-grow-1">
                <div class="fw-bold text-dark" style="font-size: 0.85rem;">${membro.nome}</div>
                <div class="${opacityClass}" style="font-size: 0.75rem;">${status}</div>
            </div>
        </div>
        `;
    }

    if (containerTodos) {
        let htmlMembro = ``;
        for (let membro of listaMembrosGlobal) {
            htmlMembro += gerarHtmlMembro(membro);
        }
        containerTodos.innerHTML = htmlMembro;
    }

    if (containerFormacao) {
        let htmlMembro = ``;
        for (let membro of listaMembrosFormacao) {
            htmlMembro += gerarHtmlMembro(membro);
        }
        if (listaMembrosFormacao.length === 0) {
            htmlMembro = `<div class="text-muted text-center small p-3">Nenhum tocador adicionado à formação.</div>`;
        }
        containerFormacao.innerHTML = htmlMembro;
    }
}
let listaMusicasGlobal = [];

async function listarMusicas() {
    try {
        const resp = await fetch("/apimusica/pesquisarmusica?nome= ");
        if (!resp.ok)
            throw new Error("Erro ao buscar músicas");
        const data = await resp.json();
        listaMusicasGlobal = data;
        construirTabelaMusicas(data);
        return data;
    } catch (error) {
        console.error(error);
    }
}

function filtrarMusicas() {
    const termo = document.getElementById("buscaMusica") ? document.getElementById("buscaMusica").value.toLowerCase() : "";
    const filtradas = listaMusicasGlobal.filter(m => m.nome.toLowerCase().includes(termo));
    construirTabelaMusicas(filtradas);
}

function construirTabelaMusicas(musicas) {
    let selectMusica = document.getElementById("listaMusicas")
    let valorSelecionado = selectMusica.value;
    let lista = `<option value="0" disabled ${!valorSelecionado || valorSelecionado == 0 ? 'selected' : ''}>Selecione uma música...</option>`;
    
    // Se o valor selecionado não estiver na lista filtrada, adicione-o provisoriamente
    if (valorSelecionado && valorSelecionado != "0" && musicas && !musicas.find(m => m.id == valorSelecionado)) {
        const musicaSelecionada = listaMusicasGlobal.find(m => m.id == valorSelecionado);
        if (musicaSelecionada) {
            lista += `<option value="${musicaSelecionada.id}" selected>${musicaSelecionada.nome}</option>`;
        }
    }
    
    if (musicas != null && musicas.length > 0) {
        for (let musica of musicas) {
            let selecionado = (valorSelecionado == musica.id) ? 'selected' : '';
            // Para não duplicar a opção caso já tenhamos adicionado
            if (!(valorSelecionado && valorSelecionado != "0" && !musicas.find(m => m.id == valorSelecionado) && musica.id == valorSelecionado)) {
                lista += `<option value="${musica.id}" ${selecionado}>${musica.nome}</option>`
            }
        }
    }
    selectMusica.innerHTML = lista;
    if (!selectMusica.value && selectMusica.options.length > 0) {
        selectMusica.value = "0";
    }
}

async function construirBarraFerramentas(instrumentos) {
    let barra = ``;

    if (instrumentos != null && instrumentos.length > 0) {
        for (let instrumento of instrumentos) {
            barra += `
            <div class="d-flex flex-column align-items-center mb-1" style="width: 85px;">

                <button class="btn p-2 shadow-sm mb-1"
                        onclick="inserirInstrumento(${instrumento.instru_id})"
                        style="border: 1px solid #d4af37; border-radius: 8px; background-color: #fff; transition: transform 0.2s;">
                    <img src="uploads/${instrumento.instru_img}?v=${Date.now()}"
                         class="instrument-img"
                         alt="${instrumento.instru_nome}"
                         style="filter: hue-rotate(340deg); max-height: 45px; max-width: 45px; object-fit: contain;">
                </button>

                <span class="text-secondary fw-bold text-center text-wrap"
                      style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.1; word-break: break-word;">
                    ${instrumento.instru_nome}
                </span>

            </div>`;
        }
    } else {
        barra = `<div class="text-muted text-center p-3 small">Nenhum Instrumento Encontrado</div>`;
    }

    document.getElementById("barraFerramentas").innerHTML = barra;
}

function filtrarInstrumentos() {
    const termoBusca = document.getElementById("buscaInstrumento") ? document.getElementById("buscaInstrumento").value.toLowerCase() : "";
    let listaParaFiltrar = window.instrumentosAtivosCache || Array.from(new Set(Object.values(catalogoInstrumentos)));
    const instrumentosFiltrados = listaParaFiltrar.filter(inst =>
        inst.instru_nome.toLowerCase().includes(termoBusca)
    );
    construirBarraFerramentas(instrumentosFiltrados);
}

function gerarJson() {
    const objetos = palco.getObjects();
    const colunas = document.getElementById('gridCols').value;
    const linhas = document.getElementById('gridRows').value;
    const largura = document.getElementById('stageWidth').value;
    const altura = document.getElementById('stageHeight').value;
    const formacao = {
        colunas: colunas,
        linhas: linhas,
        largura: largura,
        altura: altura,
        exibirGrade: document.getElementById('showGrid') ? document.getElementById('showGrid').checked : true,
        exibirCentro: document.getElementById('showCenterGuides') ? document.getElementById('showCenterGuides').checked : true,
        instrumentos: []
    };
    objetos.forEach(obj => {
        if (obj.tipoInstrumento && obj.tipoInstrumento !== "RotuloTocador") {
            const dadosInst = {
                id: obj.idInstrumento || obj.idPalco,
                tipo: obj.tipoInstrumento,
                left: obj.left,
                top: obj.top,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
                angle: obj.angle || 0,
                idTocador: obj.idTocador || null,
                nomeTocador: obj.nomeTocador || null,
                apelidoTocador: obj.apelidoTocador || null,
                rotuloOffsetX: obj.rotuloOffsetX !== undefined ? obj.rotuloOffsetX : 0,
                rotuloOffsetY: obj.rotuloOffsetY !== undefined ? obj.rotuloOffsetY : -25,
                rotuloFontSize: obj.labelTocador ? obj.labelTocador.fontSize : (obj.rotuloFontSize !== undefined ? obj.rotuloFontSize : 20),
                rotuloFontFamily: obj.labelTocador ? obj.labelTocador.fontFamily : (obj.rotuloFontFamily || 'Noto Sans'),
                rotuloFontWeight: obj.labelTocador ? obj.labelTocador.fontWeight : (obj.rotuloFontWeight || 'bold'),
                rotuloFontStyle: obj.labelTocador ? obj.labelTocador.fontStyle : (obj.rotuloFontStyle || 'normal'),
                rotuloFill: obj.labelTocador ? obj.labelTocador.fill : (obj.rotuloFill || '#1e293b'),
                rotuloBackgroundColor: obj.labelTocador ? obj.labelTocador.backgroundColor : (obj.rotuloBackgroundColor || 'rgba(255, 255, 255, 0.8)'),
                rotuloTextBackgroundColor: obj.labelTocador ? obj.labelTocador.textBackgroundColor : (obj.rotuloTextBackgroundColor || ''),
                idBanco: obj.idBanco || null
            };
            if (obj.tipoInstrumento === "Texto") {
                dadosInst.textoConteudo = obj.text || "";
                dadosInst.fontSize = obj.fontSize;
                dadosInst.fontFamily = obj.fontFamily;
                dadosInst.fill = obj.fill;
                dadosInst.textBackgroundColor = obj.textBackgroundColor || null;
                dadosInst.backgroundColor = obj.backgroundColor || null;
                dadosInst.fontWeight = obj.fontWeight;
                dadosInst.fontStyle = obj.fontStyle;
                dadosInst.textAlign = obj.textAlign;
                dadosInst.stroke = obj.stroke || null;
                dadosInst.strokeWidth = obj.strokeWidth || 0;
                if (obj.shadow) {
                    dadosInst.shadow = {
                        color: obj.shadow.color,
                        blur: obj.shadow.blur,
                        offsetX: obj.shadow.offsetX,
                        offsetY: obj.shadow.offsetY
                    };
                } else {
                    dadosInst.shadow = null;
                }
            }
            formacao.instrumentos.push(dadosInst);
        }
    });

    return JSON.stringify(formacao);
}

function ocultarAvisoTituloFormacao() {
    let div = document.getElementById("tituloFormacao");
    let msg = document.getElementById("msgtitulo");
    if (div && msg) {
        div.classList.remove("border-danger");
        div.classList.add("border-secondary");
        msg.style.display = "none";
    }
}

async function salvarFormacao() {
    let titulo = document.getElementById("tituloFormacao").value;
    let div = document.getElementById("tituloFormacao")
    let msg = document.getElementById("msgtitulo")
    if (titulo !== "") {
        const instrumentosSalvar = palco.getObjects().filter(obj => obj.idBanco !== undefined);
        if (instrumentosSalvar.length === 0) {
            mostrarMensagemErro("Atenção", "Não é possível cadastrar uma formação sem nenhum instrumento no palco.");
            return;
        }

        const selectMusica = document.getElementById("listaMusicas");
        const musicaId = selectMusica ? parseInt(selectMusica.value) || 0 : 0;

        const dataURL = palco.toDataURL({
            format: 'jpeg',
            quality: 1,
            multiplier: 1
        });

        // Converter DataURL para Blob
        const resData = await fetch(dataURL);
        const blob = await resData.blob();
        const nomeArquivo = `forma_${Date.now()}.jpeg`;

        const formData = new FormData();
        formData.append("forma_img", nomeArquivo);
        formData.append("imagem", blob, nomeArquivo);

        try {
            const uploadResp = await fetch('/formacao/salvarImg', {
                method: 'POST',
                body: formData
            });
            if (!uploadResp.ok) {
                console.error("Erro ao fazer upload da imagem.");
            }
        } catch (e) {
            console.error("Exceção ao fazer upload da imagem:", e);
        }

        const dadosFormacao = {
            forma_nome: titulo,
            forma_instrumentos: gerarJson(),
            forma_img: nomeArquivo,
            musi_id: musicaId > 0 ? { id: musicaId } : null,
            listaInstrumentos: await gerarListaInstrumentosFormacao(),
        };
        let url = '/formacao/salvar-formacao';
        let metodo = 'POST';
        if (idFormacaoAtual) {
            dadosFormacao.forma_id = idFormacaoAtual;
            url = '/formacao/atualizar-formacao';
            metodo = 'PUT';
        }
        fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosFormacao) })
            .then(resposta => {
                if (!resposta.ok) {
                    return resposta.json().then(err => {
                        throw err;
                    });
                }
                return resposta.json();
            })
            .then(async resultado => {
                if (!idFormacaoAtual) {
                    try {
                        const nomeCodificado = encodeURIComponent(titulo);
                        const resp = await fetch(`/formacao/buscar-formacao-nome?nome=${nomeCodificado}`);
                        if (resp.ok) {
                            const data = await resp.json();
                            idFormacaoAtual = data.forma_id;
                        }
                    } catch (e) {
                        console.error("Erro ao buscar id da formacao:", e);
                    }
                }
                formacaoFoiModificada = false;
                const modalTexto = idFormacaoAtual ? "A Formação foi atualizada." : "Sua nova formação está pronta para brilhar no palco.";
                mostrarMensagemSucesso("Tudo Certo!", modalTexto);
                await salvarInstrumentosFormacao();
                await salvarSelecaoMembrosNoBanco();
                await atualizarListaFormacoes();
                div.classList.add("border-secondary");
                div.classList.remove("border-danger");
                msg.style.display = "none";

                if (window.destinoAposSalvar) {
                    setTimeout(() => {
                        window.location.href = window.destinoAposSalvar;
                    }, 1000); // Aguarda 1s para o usuario ver o modal de sucesso antes de sair
                }
            })
            .catch(erro => {
                console.error("Erro:", erro);
                let msgErro = "";
                if (typeof erro === "string") msgErro = erro;
                else if (erro && erro.message) msgErro = erro.message;
                else if (erro && erro.mensagem) msgErro = erro.mensagem;
                else msgErro = JSON.stringify(erro);

                if (msgErro.toLowerCase().includes("duplicate") || msgErro.toLowerCase().includes("unique") || msgErro.toLowerCase().includes("constraint") || msgErro.toLowerCase().includes("já existe")) {
                    msg.innerHTML = '<i class="bi bi-exclamation-circle me-1" style="font-size: 0.65rem;"></i>O título deve ser único no banco.';
                    div.classList.remove("border-secondary");
                    div.classList.add("border-danger");
                    msg.style.display = "block";
                } else {
                    msg.innerHTML = '<i class="bi bi-exclamation-circle me-1" style="font-size: 0.65rem;"></i>Este nome já está atribuido a outra formação.';
                    div.classList.remove("border-secondary");
                    div.classList.add("border-danger");
                    msg.style.display = "block";
                }
            });
    } else {
        msg.innerHTML = '<i class="bi bi-exclamation-circle me-1" style="font-size: 0.65rem;"></i>Título obrigatório.';
        div.classList.remove("border-secondary")
        div.classList.add("border-danger")
        msg.style.display = "block"
    }
}

async function salvarInstrumentosFormacao() {
    if (idFormacaoAtual) {
        const lista = await gerarListaInstrumentosFormacao();
        const formacao = {
            forma_id: idFormacaoAtual,
            listaInstrumentos: lista
        };

        try {
            const resp = await fetch('/formacao/salvar-instrumentos-formacao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formacao)
            });
            if (!resp.ok) {
                throw new Error("Erro ao salvar instrumentos no banco.");
            }
            const data = await resp.json();
            console.log("Instrumentos salvos com sucesso", data);
        } catch (error) {
            console.error("Erro:", error);
            mostrarMensagemErro("Atenção", "Erro ao salvar instrumentos da formação.");
        }
    }
}

async function gerarListaInstrumentosFormacao() {
    const objetos = palco.getObjects();
    let contagem = {};

    objetos.forEach(obj => {
        if (obj.tipoInstrumento && obj.tipoInstrumento !== "Texto") {
            let idBanco = obj.idBanco;
            if (idBanco) {
                if (contagem[idBanco]) {
                    contagem[idBanco]++;
                } else {
                    contagem[idBanco] = 1;
                }
            }
        }
    });

    let lista = [];
    for (const [id, qtd] of Object.entries(contagem)) {
        lista.push({
            id: parseInt(id),
            quantidade: qtd
        });
    }

    return lista;
}

function baixarPrint() {
    // 1. Gera a imagem do palco
    const dataURL = palco.toDataURL({
        format: 'png',
        quality: 1,
        // Se quiser exportar em uma resolução maior que a da tela:
        multiplier: 2
    });

    // 2. Cria um link temporário para o download
    const link = document.createElement('a');
    let nome = "";
    nome = document.getElementById("tituloFormacao").value;
    if (nome !== "")
        link.download = nome;
    else
        link.download = "Formação_Generica"
    link.href = dataURL;

    // 3. Simula o clique para baixar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.addEventListener('keydown', (e) => {
    // Ignorar tecla se estiver num input ou textarea (como os campos de busca)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
        const objetosAtivos = palco.getActiveObjects();

        if (objetosAtivos.length > 0) {
            objetosAtivos.forEach(obj => {
                if (obj.labelTocador) palco.remove(obj.labelTocador);
                if (obj.instrumentoPai) {
                    obj.instrumentoPai.labelTocador = null;
                    obj.instrumentoPai.set({ idTocador: null, nomeTocador: null, apelidoTocador: null });
                }
                palco.remove(obj);
            });
            palco.discardActiveObject();
            palco.requestRenderAll();
        }
    }

    // Copiar (Ctrl+C)
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        const activeObject = palco.getActiveObject();
        if (activeObject) {
            activeObject.clone(function (cloned) {
                _clipboard = cloned;
            }, [
                'tipoInstrumento', 'idBanco', 'rotuloOffsetX', 'rotuloOffsetY',
                'rotuloFontSize', 'rotuloFontFamily', 'rotuloFontWeight',
                'rotuloFontStyle', 'rotuloFill', 'rotuloBackgroundColor',
                'rotuloTextBackgroundColor'
            ]);
        }
    }

    // Colar (Ctrl+V)
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        if (!_clipboard) return;

        _clipboard.clone(function (clonedObj) {
            palco.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top + 20,
                evented: true,
            });

            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = palco;
                clonedObj.forEachObject(function (obj) {
                    if (obj.tipoInstrumento === 'RotuloTocador') return;
                    obj.set({ idTocador: null, nomeTocador: null, apelidoTocador: null, labelTocador: null });
                    palco.add(obj);
                });
                clonedObj.setCoords();
            } else {
                if (clonedObj.tipoInstrumento === 'RotuloTocador') return;
                clonedObj.set({ idTocador: null, nomeTocador: null, apelidoTocador: null, labelTocador: null });
                palco.add(clonedObj);
            }

            _clipboard.top += 20;
            _clipboard.left += 20;
            palco.setActiveObject(clonedObj);
            palco.requestRenderAll();
            salvarEstado();
            atualizarPainelParticipantes();
        }, [
            'tipoInstrumento', 'idBanco', 'rotuloOffsetX', 'rotuloOffsetY',
            'rotuloFontSize', 'rotuloFontFamily', 'rotuloFontWeight',
            'rotuloFontStyle', 'rotuloFill', 'rotuloBackgroundColor',
            'rotuloTextBackgroundColor'
        ]);
    }
});

let _clipboard = null;
let historico = [];
let historicoRedo = [];
let bloqueiaSalvamento = false;

function salvarEstado() {
    if (!palco || bloqueiaSalvamento) return;

    const json = palco.toJSON([
        'id',
        'selectable',
        'podeDeletar',
        'tipoInstrumento',
        'idBanco',
        'idInstrumento',
        'idPalco',
        'idTocador',
        'nomeTocador',
        'rotuloOffsetX',
        'rotuloOffsetY',
        'evented',
        'text',
        'fontSize',
        'fontFamily',
        'fill',
        'textBackgroundColor',
        'backgroundColor',
        'fontWeight',
        'fontStyle',
        'textAlign',
        'stroke',
        'strokeWidth',
        'shadow'
    ]);

    historico.push(JSON.stringify(json));
    historicoRedo = [];
    if (historico.length > 20) historico.shift();
    formacaoFoiModificada = true;
}

function desfazer() {
    if (historico.length <= 1) return;

    bloqueiaSalvamento = true;
    historicoRedo.push(historico.pop());
    const estadoAnterior = historico[historico.length - 1];

    palco.loadFromJSON(estadoAnterior, function () {
        atualizarDimensoesPalco();
        desenharGrade();
        palco.renderAll();
        atualizarPainelParticipantes();
        bloqueiaSalvamento = false;
    });
}

function refazer() {
    if (historicoRedo.length === 0) return;

    bloqueiaSalvamento = true;
    const proximoEstado = historicoRedo.pop();
    historico.push(proximoEstado);

    palco.loadFromJSON(proximoEstado, function () {
        palco.renderAll();
        atualizarPainelParticipantes();
        bloqueiaSalvamento = false;
    });
}

// Atalhos de teclado
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        desfazer();
    }
    if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        refazer();
    }
});

document.addEventListener('DOMContentLoaded', iniciarPalco);



function reconstruirInstrumento(dados) {
    if (dados.tipo && dados.tipo.toLowerCase() === "texto") {
        console.log("Reconstruindo texto carregado:", dados.textoConteudo || "Novo Texto");
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
            strokeWidth: dados.strokeWidth != null ? parseFloat(dados.strokeWidth) : 0,
            tipoInstrumento: "Texto",
            idPalco: dados.id,
            idTocador: dados.idTocador || null,
            nomeTocador: dados.nomeTocador || null
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
        palco.add(textObj);
        textObj.setCoords();
        palco.renderAll();
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
        console.error("Instrumento não encontrado no banco:", dados.tipo, dados.idBanco);
        return;
    }

    const path = "/uploads/" + infoBanco.instru_img + "?v=" + Date.now();
    let nomeArquivo = infoBanco.instru_img;
    let extensao = nomeArquivo.substring(nomeArquivo.lastIndexOf('.') + 1);
    if (extensao === "svg") {
        fabric.loadSVGFromURL(path, function (objects, options) {
            var svgData = fabric.util.groupSVGElements(objects, options);
            svgData.set({
                left: dados.left,
                top: dados.top,
                angle: dados.angle,
                scaleX: dados.scaleX,
                scaleY: dados.scaleY,
                idPalco: dados.id,
                tipoInstrumento: infoBanco.instru_nome,
                idBanco: infoBanco.instru_id,
                idTocador: dados.idTocador || null,
                nomeTocador: dados.nomeTocador || null,
                apelidoTocador: dados.apelidoTocador || null,
                rotuloOffsetX: dados.rotuloOffsetX !== undefined ? dados.rotuloOffsetX : 0,
                rotuloOffsetY: dados.rotuloOffsetY !== undefined ? dados.rotuloOffsetY : -25,
                idBanco: dados.idBanco || null
            });

            palco.add(svgData);

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
                    textBackgroundColor: dados.rotuloTextBackgroundColor || '',
                    selectable: true,
                    hasControls: false,
                    hasBorders: true,
                    borderColor: 'blue',
                    tipoInstrumento: "RotuloTocador",
                    idReferencia: dados.id
                });
                palco.add(label);
                svgData.labelTocador = label;
                label.instrumentoPai = svgData;
            }

            palco.renderAll();
        });
    }
    else {
        fabric.Image.fromURL(path, function (img) {
            img.set({
                left: dados.left,
                top: dados.top,
                angle: dados.angle,
                scaleX: dados.scaleX,
                scaleY: dados.scaleY,
                idPalco: dados.id,
                tipoInstrumento: infoBanco.instru_nome,
                idBanco: infoBanco.instru_id,
                idTocador: dados.idTocador || null,
                nomeTocador: dados.nomeTocador || null,
                apelidoTocador: dados.apelidoTocador || null,
                rotuloOffsetX: dados.rotuloOffsetX !== undefined ? dados.rotuloOffsetX : 0,
                rotuloOffsetY: dados.rotuloOffsetY !== undefined ? dados.rotuloOffsetY : -25,
                idBanco: dados.idBanco || null
            });

            palco.add(img);

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
                    textBackgroundColor: dados.rotuloTextBackgroundColor || '',
                    selectable: true,
                    hasControls: false,
                    hasBorders: true,
                    borderColor: 'blue',
                    tipoInstrumento: "RotuloTocador",
                    idReferencia: dados.id
                });
                palco.add(label);
                img.labelTocador = label;
                label.instrumentoPai = img;
            }

            palco.renderAll();
        });
    }
}

function limpar() {
    idFormacaoAtual = null;
    contadorId = 0;
    listaMembrosFormacao = [];
    const inputTitulo = document.getElementById("tituloFormacao");
    if (inputTitulo) inputTitulo.value = "";
    const selectMusica = document.getElementById("listaMusicas");
    if (selectMusica) selectMusica.value = "0";
    larguraPalcoInput.value = 14;
    profundidadePalcoInput.value = 8;
    colunasGradeInput.value = 10;
    linhasGradeInput.value = 8;
    const objremover = palco.getObjects().filter(obj => obj.tipoInstrumento);
    objremover.forEach(obj => palco.remove(obj));
    atualizarDimensoesPalco();
    salvarEstado();
    atualizarPainelParticipantes();
    palco.requestRenderAll();
}

function carregarJson(jsonString) {
    if (!jsonString) return;

    const dadosFormacao = JSON.parse(jsonString);
    if (document.getElementById('gridCols')) document.getElementById('gridCols').value = dadosFormacao.colunas || 14;
    if (document.getElementById('gridRows')) document.getElementById('gridRows').value = dadosFormacao.linhas || 8;
    if (document.getElementById('stageWidth')) document.getElementById('stageWidth').value = dadosFormacao.largura || 10;
    if (document.getElementById('stageHeight')) document.getElementById('stageHeight').value = dadosFormacao.altura || 8;
    if (document.getElementById('showGrid')) document.getElementById('showGrid').checked = dadosFormacao.exibirGrade !== undefined ? dadosFormacao.exibirGrade : true;
    if (document.getElementById('showCenterGuides')) document.getElementById('showCenterGuides').checked = dadosFormacao.exibirCentro !== undefined ? dadosFormacao.exibirCentro : true;
    atualizarDimensoesPalco();
    const objremover = palco.getObjects().filter(obj => obj.tipoInstrumento);
    objremover.forEach(obj => palco.remove(obj));

    if (dadosFormacao.instrumentos && dadosFormacao.instrumentos.length > 0) {
        const ids = dadosFormacao.instrumentos.map(item => {
            if (item.id) {
                const partes = item.id.split('_');
                return partes.length > 1 ? parseInt(partes[1]) : 0;
            }
        });
        contadorId = Math.max(...ids);
    }

    if (dadosFormacao.instrumentos) {
        dadosFormacao.instrumentos.forEach(item => {
            reconstruirInstrumento(item);
        });
    }

    setTimeout(atualizarPainelParticipantes, 500);
}


////////////////////////////////edicao aqui temporaria

let listaFormacoesCache = [];

function atualizarListaFormacoes() {
    return fetch('/formacao/listar-todas')
        .then(res => res.json())
        .then(lista => {
            listaFormacoesCache = lista;
            renderizarListaFormacoesMenu(lista);
        })
        .catch(err => console.error("Erro ao listar:", err));
}

function renderizarListaFormacoesMenu(lista) {
    const container = document.getElementById("listaFormacoesContainer");
    if (!container) return;

    let html = "";
    if (lista.length === 0) {
        html = `<div class="text-muted text-center small p-2">Nenhuma formação encontrada.</div>`;
    } else {
        for (let form of lista) {
            html += `<button type="button" class="list-group-item list-group-item-action py-2" style="font-size: 0.85rem;" onclick="buscarFormacaoPorId(${form.forma_id})">
                        <i class="bi bi-file-earmark-music me-2"></i> ${form.forma_nome}
                     </button>`;
        }
    }
    container.innerHTML = html;
}

function filtrarFormacoesMenu() {
    const input = document.getElementById("buscaFormacaoMenu");
    if (!input) return;
    const termo = input.value.toLowerCase();
    const listaFiltrada = listaFormacoesCache.filter(form => form.forma_nome.toLowerCase().includes(termo));
    renderizarListaFormacoesMenu(listaFiltrada);
}

function buscarFormacaoPorId(idSelecionado) {
    let id = idSelecionado;
    if (!id) {
        const selectFormacoes = document.getElementById("formacoes");
        if (selectFormacoes) id = selectFormacoes.value;
    }
    if (id) {
        fetch(`/formacao/buscar-formacao/${id}`)
            .then(res => res.json())
            .then(dados => {
                idFormacaoAtual = dados.forma_id;
                document.getElementById("tituloFormacao").value = dados.forma_nome;

                const selectMusica = document.getElementById("listaMusicas");
                if (selectMusica && dados.musi_id && dados.musi_id.id) {
                    selectMusica.value = dados.musi_id.id;
                } else if (selectMusica) {
                    selectMusica.value = "0";
                }

                carregarJson(dados.forma_instrumentos);
                carregarMembrosDaFormacao();
                setTimeout(() => { formacaoFoiModificada = false; }, 500);
            })
            .catch(err => {
                console.error("erro", err);
                mostrarMensagemErro("Erro", "Erro ao carregar os dados! Aperte F12 e olhe o Console.");
            });
    }
}

async function buscarFormacaoPorParametroId(id) {
    try {
        const res = await fetch(`/formacao/buscar-formacao/${id}`);
        if (!res.ok) {
            throw new Error(`Erro na requisição: Status ${res.status}`);
        }
        const dados = await res.json();
        idFormacaoAtual = dados.forma_id;
        document.getElementById("tituloFormacao").value = dados.forma_nome;

        const selectMusica = document.getElementById("listaMusicas");
        if (selectMusica && dados.musi_id && dados.musi_id.id) {
            selectMusica.value = dados.musi_id.id;
        } else if (selectMusica) {
            selectMusica.value = "0";
        }

        carregarJson(dados.forma_instrumentos);
        carregarMembrosDaFormacao();
        setTimeout(() => { formacaoFoiModificada = false; }, 500);

    } catch (err) {
        console.error("erro", err);
        mostrarMensagemErro("Erro", "Não foi possível carregar o modelo de formação.");
    }
}

function pegarIdDaUrl() {
    let parametros = new URLSearchParams(window.location.search);
    let id = parametros.get('idFormacao');
    id = parseInt(id);
    return id;
}

window.addEventListener('DOMContentLoaded', async () => {
    await montarAuxiliares();
    const idRecebido = pegarIdDaUrl();
    if (idRecebido) {
        await buscarFormacaoPorParametroId(idRecebido);
    }
    await atualizarListaFormacoes();
});


// Variável global para saber qual instrumento foi clicado
let instrumentoAlvoSelecionado = null;

function manipularDuploClique(options) {
    const objetoClicado = options.target;

    // Verifica se clicou em um objeto e se ele é um instrumento válido (e não um texto)
    if (objetoClicado && objetoClicado.tipoInstrumento && objetoClicado.tipoInstrumento !== "Texto") {
        instrumentoAlvoSelecionado = objetoClicado;
        abrirPainelTocador(options.e);
    }
}

async function abrirPainelTocador(e) {
    const painel = document.getElementById('painelTocador');

    // Mostra o painel com estilo absoluto
    painel.style.display = 'block';

    if (e) {
        const larguraPainel = 320;
        const alturaPainel = 420; // Altura aproximada do painel vertical

        const limiteLargura = window.innerWidth;
        const limiteAltura = window.innerHeight;

        // Posicionar à direita do cursor
        let posX = e.clientX + 15;

        // Alinhar o final (base) do painel com o meio do instrumento (posição do mouse)
        let posY = e.clientY - alturaPainel + 30;

        // Se passar da borda direita, posicionar à esquerda do cursor
        if (posX + larguraPainel > limiteLargura - 10) {
            posX = e.clientX - larguraPainel - 15;
        }

        // Garantir limites da tela (Viewport)
        if (posX < 10) posX = 10;
        if (posY < 10) posY = 10;
        if (posY + alturaPainel > limiteAltura - 10) {
            posY = limiteAltura - alturaPainel - 10;
        }

        painel.style.left = posX + 'px';
        painel.style.top = posY + 'px';
        painel.style.transform = 'none';
    } else {
        // Fallback centralizado se disparado sem evento de mouse
        painel.style.left = '50%';
        painel.style.top = '50%';
        painel.style.transform = 'translate(-50%, -50%)';
    }

    // Busca os membros da API e renderiza no list-group
    try {
        let dados;
        if (modoListaTocadores === 'formacao' && listaMembrosFormacao.length > 0) {
            dados = listaMembrosFormacao;
        } else {
            dados = listaMembrosGlobal;
        }
        window.listaMembrosModalCache = dados;

        const inputBusca = document.getElementById("buscaMembroModal");
        if (inputBusca) {
            inputBusca.value = "";
        }

        renderizarListaMembrosModal(dados, instrumentoAlvoSelecionado.idTocador);

        setTimeout(() => {
            if (inputBusca) inputBusca.focus();
        }, 100);
    } catch (error) {
        console.error("Erro ao configurar músicos para a lista:", error);
    }
}

function renderizarListaMembrosModal(membros, idSelecionado) {
    const listaContainer = document.getElementById('listaMembrosModal');
    let html = '';

    // Opção vazia (Remover Associação)
    const activeVazio = (!idSelecionado) ? 'active bg-taiko text-white border-taiko-red' : '';
    html += `<button type="button" class="list-group-item list-group-item-action py-2 ${activeVazio}" onclick="selecionarMembroModal('', 'Selecione um músico...')">
                <i class="bi bi-x-circle me-2"></i> Selecione um músico...
             </button>`;

    membros.forEach(membro => {
        const isActive = (idSelecionado && idSelecionado == membro.id) ? 'active bg-taiko text-white border-taiko-red' : '';
        html += `<button type="button" class="list-group-item list-group-item-action py-2 ${isActive}" onclick="selecionarMembroModal('${membro.id}', '${membro.nome.replace(/'/g, "\\'")}')">
                    <i class="bi bi-person me-2"></i> ${membro.nome}
                 </button>`;
    });

    listaContainer.innerHTML = html;

    // Sincronizar input hidden
    if (idSelecionado) {
        document.getElementById('tocadorSelecionadoId').value = idSelecionado;
    } else {
        document.getElementById('tocadorSelecionadoId').value = "";
    }
}

function filtrarMembrosModal() {
    const termo = document.getElementById("buscaMembroModal").value.toLowerCase();
    const dados = window.listaMembrosModalCache || [];

    const dadosFiltrados = dados.filter(membro => membro.nome.toLowerCase().includes(termo));
    const idAtual = document.getElementById('tocadorSelecionadoId').value;

    renderizarListaMembrosModal(dadosFiltrados, idAtual);
}

function selecionarMembroModal(id, nome) {
    document.getElementById('tocadorSelecionadoId').value = id;
    document.getElementById('tocadorSelecionadoNome').value = nome;

    // Atualiza visual da lista
    const itens = document.getElementById('listaMembrosModal').querySelectorAll('.list-group-item');
    itens.forEach(item => {
        item.classList.remove('active', 'bg-taiko', 'text-white', 'border-taiko-red');
    });

    // Procura o item clicado e bota active
    event.currentTarget.classList.add('active', 'bg-taiko', 'text-white', 'border-taiko-red');
}

function fecharPainelTocador() {
    document.getElementById('painelTocador').style.display = 'none';
    document.getElementById('tocadorSelecionadoId').value = "";
    document.getElementById('tocadorSelecionadoNome').value = "";
    const apelidoInput = document.getElementById('apelidoTocador');
    if (apelidoInput) apelidoInput.value = "";
    instrumentoAlvoSelecionado = null;
}

function salvarTocador() {
    const idSelecionado = document.getElementById('tocadorSelecionadoId').value;
    const nomeSelecionado = document.getElementById('tocadorSelecionadoNome').value;
    const apelidoInput = document.getElementById('apelidoTocador');
    const apelido = apelidoInput ? apelidoInput.value.trim() : "";
    const nomeExibicao = apelido !== "" ? apelido : nomeSelecionado;

    if (instrumentoAlvoSelecionado) {
        instrumentoAlvoSelecionado.set({
            idTocador: idSelecionado,
            nomeTocador: idSelecionado ? nomeSelecionado : null,
            apelidoTocador: apelido !== "" ? apelido : null
        });

        if (idSelecionado) {
            if (!instrumentoAlvoSelecionado.labelTocador) {
                const label = new fabric.Text(nomeExibicao, {
                    left: instrumentoAlvoSelecionado.left,
                    top: instrumentoAlvoSelecionado.top - 25,
                    fontSize: instrumentoAlvoSelecionado.rotuloFontSize !== undefined ? instrumentoAlvoSelecionado.rotuloFontSize : 20,
                    fontFamily: instrumentoAlvoSelecionado.rotuloFontFamily || 'Noto Sans',
                    fontWeight: instrumentoAlvoSelecionado.rotuloFontWeight || 'bold',
                    fontStyle: instrumentoAlvoSelecionado.rotuloFontStyle || 'normal',
                    fill: instrumentoAlvoSelecionado.rotuloFill || '#1e293b',
                    backgroundColor: instrumentoAlvoSelecionado.rotuloBackgroundColor || 'rgba(255, 255, 255, 0.8)',
                    textBackgroundColor: instrumentoAlvoSelecionado.rotuloTextBackgroundColor || '',
                    selectable: true,
                    hasControls: false,
                    hasBorders: true,
                    borderColor: 'blue',
                    tipoInstrumento: "RotuloTocador",
                    idReferencia: instrumentoAlvoSelecionado.id
                });
                palco.add(label);
                instrumentoAlvoSelecionado.labelTocador = label;
                label.instrumentoPai = instrumentoAlvoSelecionado;
            } else {
                instrumentoAlvoSelecionado.labelTocador.set({ text: nomeExibicao });
            }
        } else {
            if (instrumentoAlvoSelecionado.labelTocador) {
                palco.remove(instrumentoAlvoSelecionado.labelTocador);
                instrumentoAlvoSelecionado.labelTocador = null;
            }
        }

        salvarEstado();
        atualizarPainelParticipantes();
        palco.requestRenderAll();
    }

    document.getElementById('buscaMembroModal').value = ""; // Resetar a busca para default
    fecharPainelTocador();
}

// ==========================================================================
// CUSTOM CONTROLS FOR SELECTION (FABRIC.JS)
// ==========================================================================

function renderIcon(iconChar, bgColor, fgColor) {
    return function (ctx, left, top, styleOverride, fabricObject) {
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = bgColor || '#c62828';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.font = '10px "Segoe UI Symbol", Arial';
        ctx.fillStyle = fgColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconChar, 0, 0);

        ctx.restore();
    };
}

function renderGroupIcon() {
    return function (ctx, left, top, styleOverride, fabricObject) {
        let iconChar = '🔗';
        let bgColor = '#1e88e5'; // Blue
        if (fabricObject.type === 'group') {
            iconChar = '🔓';
            bgColor = '#f4511e'; // Orange-red
        }

        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.font = '10px "Segoe UI Symbol", Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconChar, 0, 0);

        ctx.restore();
    };
}

function deleteObject(eventData, transform) {
    const target = transform.target;
    const canvas = target.canvas;

    bloqueiaSalvamento = true;
    if (target.type === 'activeSelection') {
        target.forEachObject(function (obj) {
            canvas.remove(obj);
        });
        canvas.discardActiveObject();
    } else {
        canvas.remove(target);
    }
    bloqueiaSalvamento = false;

    canvas.requestRenderAll();
    salvarEstado();
    return true;
}



async function carregarMembrosDaFormacao() {
    if (!idFormacaoAtual) {
        listaMembrosFormacao = [];
        atualizarPainelParticipantes();
        return;
    }
    try {
        const resp = await fetch(`/api/membros-formacao/${idFormacaoAtual}`);
        if (resp.ok) {
            listaMembrosFormacao = await resp.json();
            atualizarPainelParticipantes();
        }
    } catch (error) {
        console.error("Erro ao buscar membros da formação:", error);
    }
}

function abrirModalAdicionarTocadorFormacao() {
    const container = document.getElementById("listaCheckboxMembros");
    const termoBusca = document.getElementById("buscaMembrosParaAdicionar") ? document.getElementById("buscaMembrosParaAdicionar").value.toLowerCase() : "";
    
    let html = "";
    listaMembrosGlobal.forEach(membro => {
        if (termoBusca && !membro.nome.toLowerCase().includes(termoBusca)) return;
        
        const isChecked = listaMembrosFormacao.some(m => m.id === membro.id) ? "checked" : "";
        html += `
        <label class="list-group-item d-flex gap-2 align-items-center">
            <input class="form-check-input flex-shrink-0 checkbox-membro-formacao" type="checkbox" value="${membro.id}" ${isChecked}>
            <span>
                ${membro.nome}
            </span>
        </label>`;
    });
    
    container.innerHTML = html;
    
    const modalEl = document.getElementById("modalMembrosFormacao");
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function filtrarMembrosParaAdicionar() {
    const container = document.getElementById("listaCheckboxMembros");
    const termoBusca = document.getElementById("buscaMembrosParaAdicionar") ? document.getElementById("buscaMembrosParaAdicionar").value.toLowerCase() : "";
    
    let html = "";
    listaMembrosGlobal.forEach(membro => {
        if (termoBusca && !membro.nome.toLowerCase().includes(termoBusca)) return;
        
        const isChecked = listaMembrosFormacao.some(m => m.id === membro.id) ? "checked" : "";
        html += `
        <label class="list-group-item d-flex gap-2 align-items-center">
            <input class="form-check-input flex-shrink-0 checkbox-membro-formacao" type="checkbox" value="${membro.id}" ${isChecked}>
            <span>
                ${membro.nome}
            </span>
        </label>`;
    });
    
    container.innerHTML = html;
}

async function salvarSelecaoMembrosFormacao() {
    const checkboxes = document.querySelectorAll(".checkbox-membro-formacao:checked");
    const idsSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    listaMembrosFormacao = listaMembrosGlobal.filter(m => idsSelecionados.includes(m.id));
    formacaoFoiModificada = true;
    
    const modalEl = document.getElementById("modalMembrosFormacao");
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    
    atualizarPainelParticipantes();
}

async function salvarSelecaoMembrosNoBanco() {
    if (!idFormacaoAtual) return;
    const idsSelecionados = listaMembrosFormacao.map(m => m.id);
    try {
        await fetch(`/api/membros-formacao/salvar?idFormacao=${idFormacaoAtual}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(idsSelecionados)
        });
    } catch (error) {
        console.error("Erro ao salvar membros da formação no banco:", error);
    }
}
function cloneObject(eventData, transform) {
    const target = transform.target;
    const canvas = target.canvas;
    target.clone(function (cloned) {
        cloned.set({
            left: target.left + 20,
            top: target.top + 20,
            evented: true,
        });

        bloqueiaSalvamento = true;
        if (cloned.type === 'activeSelection') {
            cloned.canvas = canvas;
            cloned.forEachObject(function (obj) {
                canvas.add(obj);
            });
            cloned.setCoords();
        } else {
            canvas.add(cloned);
        }
        bloqueiaSalvamento = false;

        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        salvarEstado();
    }, ['tipoInstrumento', 'idBanco', 'idTocador', 'nomeTocador', 'idInstrumento', 'idPalco']);
    return true;
}

function assignPlayerControl(eventData, transform) {
    const target = transform.target;
    if (target.tipoInstrumento && target.tipoInstrumento !== "Texto") {
        instrumentoAlvoSelecionado = target;
        // Simular um evento para posicionar o painel
        const clientX = eventData.clientX || eventData.e?.clientX;
        const clientY = eventData.clientY || eventData.e?.clientY;
        abrirPainelTocador({ clientX, clientY });
    }
    return true;
}

function openRotateControl(eventData, transform) {
    const target = transform.target;
    if (target) {
        instrumentoAlvoSelecionado = target;

        let currentAngle = target.angle || 0;
        currentAngle = currentAngle % 360;
        if (currentAngle < 0) currentAngle += 360;

        document.getElementById('rangeRotacao').value = Math.round(currentAngle);
        document.getElementById('inputRotacao').value = Math.round(currentAngle);

        const clientX = eventData.clientX || eventData.e?.clientX;
        const clientY = eventData.clientY || eventData.e?.clientY;
        abrirPainelRotacao({ clientX, clientY });
    }
    return true;
}

function abrirPainelRotacao(e) {
    const painel = document.getElementById('painelRotacao');
    painel.style.display = 'block';

    if (e) {
        const larguraPainel = 320;
        const alturaPainel = 200;
        const limiteLargura = window.innerWidth;
        const limiteAltura = window.innerHeight;

        let posX = e.clientX + 15;
        let posY = e.clientY - (alturaPainel / 2);

        if (posX + larguraPainel > limiteLargura - 10) {
            posX = e.clientX - larguraPainel - 15;
        }

        if (posX < 10) posX = 10;
        if (posY < 10) posY = 10;
        if (posY + alturaPainel > limiteAltura - 10) {
            posY = limiteAltura - alturaPainel - 10;
        }

        painel.style.left = posX + 'px';
        painel.style.top = posY + 'px';
        painel.style.transform = 'none';
    } else {
        painel.style.left = '50%';
        painel.style.top = '50%';
        painel.style.transform = 'translate(-50%, -50%)';
    }
}

function fecharPainelRotacao() {
    document.getElementById('painelRotacao').style.display = 'none';
    instrumentoAlvoSelecionado = null;
    salvarEstado();
}

function atualizarRotacaoObjeto(valor) {
    if (instrumentoAlvoSelecionado) {
        const angulo = parseFloat(valor) || 0;
        instrumentoAlvoSelecionado.set('angle', angulo);
        instrumentoAlvoSelecionado.setCoords();
        palco.requestRenderAll();
    }
}

function groupSelection(eventData, transform) {
    const target = transform.target;
    const canvas = target.canvas;
    if (target.type === 'activeSelection') {
        const objects = target.getObjects();

        bloqueiaSalvamento = true;
        objects.forEach(obj => canvas.remove(obj));
        const group = new fabric.Group(objects, {
            tipoInstrumento: "Grupo",
            idBanco: objects[0].idBanco
        });
        canvas.add(group);
        bloqueiaSalvamento = false;

        canvas.setActiveObject(group);
        canvas.requestRenderAll();
        salvarEstado();
    } else if (target.type === 'group') {
        const objects = target.getObjects();
        target.destroy();

        bloqueiaSalvamento = true;
        canvas.remove(target);
        objects.forEach(obj => {
            canvas.add(obj);
        });
        const selection = new fabric.ActiveSelection(objects, {
            canvas: canvas
        });
        bloqueiaSalvamento = false;

        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
        salvarEstado();
    }
    return true;
}

// Configurando os Controles Customizados no protótipo de fabric.Object
fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetX: 16,
    offsetY: -16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon('❌', '#c62828', '#ffffff'),
    cornerSize: 20
});

fabric.Object.prototype.controls.cloneControl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    offsetX: -16,
    offsetY: -16,
    cursorStyle: 'pointer',
    mouseUpHandler: cloneObject,
    render: renderIcon('⧉', '#2e7d32', '#ffffff'),
    cornerSize: 20
});

fabric.Object.prototype.controls.playerControl = new fabric.Control({
    x: 0.5,
    y: 0,
    offsetX: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: assignPlayerControl,
    render: renderIcon('👤', '#D4AF37', '#ffffff'),
    cornerSize: 20,
    visibilityHandler: function (obj, control) {
        return obj.tipoInstrumento && obj.tipoInstrumento !== 'Texto' && obj.type !== 'group' && obj.type !== 'activeSelection';
    }
});

fabric.Object.prototype.controls.groupControl = new fabric.Control({
    x: -0.5,
    y: 0,
    offsetX: -16,
    cursorStyle: 'pointer',
    mouseUpHandler: groupSelection,
    render: renderGroupIcon(),
    cornerSize: 20,
    visibilityHandler: function (obj, control) {
        return obj.type === 'activeSelection' || obj.type === 'group';
    }
});

fabric.Object.prototype.controls.rotateCustomControl = new fabric.Control({
    x: 0,
    y: 0.5,
    offsetY: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: openRotateControl,
    render: renderIcon('↻', '#8e24aa', '#ffffff'),
    cornerSize: 20,
    visibilityHandler: function (obj, control) {
        return obj.tipoInstrumento && obj.tipoInstrumento !== 'Texto';
    }
});

function atualizarToolbarTexto() {
    const painelRotacao = document.getElementById('painelRotacao');
    if (painelRotacao) painelRotacao.style.display = 'none';

    const activeObject = palco.getActiveObject();

    if (activeObject && (activeObject.tipoInstrumento === "Texto" || activeObject.tipoInstrumento === "RotuloTocador") && palco.getActiveObjects().length === 1) {
        // Preenche com os dados do objeto selecionado
        document.getElementById('textFontFamily').value = activeObject.fontFamily || 'Arial';
        document.getElementById('textFontSize').value = activeObject.fontSize || 20;

        // Negrito e Itálico
        const btnBold = document.getElementById('btnTextBold');
        if (activeObject.fontWeight === 'bold') {
            btnBold.classList.add('active');
        } else {
            btnBold.classList.remove('active');
        }

        const btnItalic = document.getElementById('btnTextItalic');
        if (activeObject.fontStyle === 'italic') {
            btnItalic.classList.add('active');
        } else {
            btnItalic.classList.remove('active');
        }



        // Cores
        document.getElementById('textFill').value = activeObject.fill || '#000000';

        // Marcador (textBackgroundColor)
        const textBackgroundColor = activeObject.textBackgroundColor;
        if (textBackgroundColor) {
            document.getElementById('textHasHighlight').checked = true;
            document.getElementById('textHighlightColor').value = textBackgroundColor;
        } else {
            document.getElementById('textHasHighlight').checked = false;
        }

        // Fundo da Caixa (backgroundColor)
        const backgroundColor = activeObject.backgroundColor;
        if (backgroundColor) {
            document.getElementById('textHasBg').checked = true;
            document.getElementById('textBgColor').value = backgroundColor;
        } else {
            document.getElementById('textHasBg').checked = false;
        }

        // Borda (stroke / strokeWidth)
        const stroke = activeObject.stroke;
        if (stroke && activeObject.strokeWidth > 0) {
            document.getElementById('textHasStroke').checked = true;
            document.getElementById('textStrokeColor').value = stroke;
            document.getElementById('textStrokeWidth').value = activeObject.strokeWidth;
            document.getElementById('valStrokeWidth').innerText = activeObject.strokeWidth;
        } else {
            document.getElementById('textHasStroke').checked = false;
            document.getElementById('textStrokeWidth').value = 1;
            document.getElementById('valStrokeWidth').innerText = '1';
        }

        // Sombra (shadow)
        const shadow = activeObject.shadow;
        if (shadow) {
            document.getElementById('textHasShadow').checked = true;
            document.getElementById('textShadowColor').value = shadow.color || '#000000';
            document.getElementById('textShadowBlur').value = shadow.blur || 5;
            document.getElementById('valShadowBlur').innerText = shadow.blur || 5;
            document.getElementById('textShadowOffsetX').value = shadow.offsetX || 3;
            document.getElementById('valShadowOffsetX').innerText = shadow.offsetX || 3;
            document.getElementById('textShadowOffsetY').value = shadow.offsetY || 3;
            document.getElementById('valShadowOffsetY').innerText = shadow.offsetY || 3;
        } else {
            document.getElementById('textHasShadow').checked = false;
            document.getElementById('textShadowBlur').value = 5;
            document.getElementById('valShadowBlur').innerText = '5';
            document.getElementById('textShadowOffsetX').value = 3;
            document.getElementById('valShadowOffsetX').innerText = '3';
            document.getElementById('textShadowOffsetY').value = 3;
            document.getElementById('valShadowOffsetY').innerText = '3';
        }
    } else {
        // Reseta para os valores padrões
        document.getElementById('textFontFamily').value = 'Arial';
        document.getElementById('textFontSize').value = 20;

        document.getElementById('btnTextBold').classList.remove('active');
        document.getElementById('btnTextItalic').classList.remove('active');



        document.getElementById('textFill').value = '#000000';

        document.getElementById('textHasHighlight').checked = false;
        document.getElementById('textHighlightColor').value = '#ffff00';

        document.getElementById('textHasBg').checked = false;
        document.getElementById('textBgColor').value = '#ffffff';

        document.getElementById('textHasStroke').checked = false;
        document.getElementById('textStrokeColor').value = '#ff0000';
        document.getElementById('textStrokeWidth').value = 1;
        document.getElementById('valStrokeWidth').innerText = '1';

        document.getElementById('textHasShadow').checked = false;
        document.getElementById('textShadowColor').value = '#000000';
        document.getElementById('textShadowBlur').value = 5;
        document.getElementById('valShadowBlur').innerText = '5';
        document.getElementById('textShadowOffsetX').value = 3;
        document.getElementById('valShadowOffsetX').innerText = '3';
        document.getElementById('textShadowOffsetY').value = 3;
        document.getElementById('valShadowOffsetY').innerText = '3';
    }
}

function configurarEventosToolbarTexto() {
    // Função auxiliar para obter o texto ativo
    const obterTextoAtivo = () => {
        const activeObject = palco.getActiveObject();
        if (activeObject && (activeObject.tipoInstrumento === "Texto" || activeObject.tipoInstrumento === "RotuloTocador")) {
            return activeObject;
        }
        return null;
    };

    // Função para aplicar alteração e salvar estado
    const aplicarPropriedade = (prop, valor) => {
        const textObj = obterTextoAtivo();
        if (textObj) {
            textObj.set(prop, valor);
            palco.renderAll();
            salvarEstado();
        }
    };

    // Ouvinte para Família da Fonte
    document.getElementById('textFontFamily').addEventListener('change', function () {
        aplicarPropriedade('fontFamily', this.value);
    });

    // Ouvinte para Tamanho da Fonte
    document.getElementById('textFontSize').addEventListener('input', function () {
        aplicarPropriedade('fontSize', parseInt(this.value) || 20);
    });

    // Ouvinte para Negrito
    document.getElementById('btnTextBold').addEventListener('click', function () {
        const textObj = obterTextoAtivo();
        if (textObj) {
            const isBold = textObj.fontWeight === 'bold';
            textObj.set('fontWeight', isBold ? 'normal' : 'bold');
            this.classList.toggle('active', !isBold);
            palco.renderAll();
            salvarEstado();
        }
    });

    // Ouvinte para Itálico
    document.getElementById('btnTextItalic').addEventListener('click', function () {
        const textObj = obterTextoAtivo();
        if (textObj) {
            const isItalic = textObj.fontStyle === 'italic';
            textObj.set('fontStyle', isItalic ? 'normal' : 'italic');
            this.classList.toggle('active', !isItalic);
            palco.renderAll();
            salvarEstado();
        }
    });



    // Ouvinte para Cor da Letra
    document.getElementById('textFill').addEventListener('input', function () {
        aplicarPropriedade('fill', this.value);
    });

    // Função auxiliar para atualizar Marcador (textBackgroundColor)
    const atualizarMarcador = () => {
        const textObj = obterTextoAtivo();
        if (textObj) {
            const hasHighlight = document.getElementById('textHasHighlight').checked;
            const highlightColor = document.getElementById('textHighlightColor').value;
            textObj.set('textBackgroundColor', hasHighlight ? highlightColor : '');
            palco.renderAll();
            salvarEstado();
        }
    };
    document.getElementById('textHasHighlight').addEventListener('change', atualizarMarcador);
    document.getElementById('textHighlightColor').addEventListener('input', atualizarMarcador);

    // Função auxiliar para atualizar Fundo da Caixa (backgroundColor)
    const atualizarFundoCaixa = () => {
        const textObj = obterTextoAtivo();
        if (textObj) {
            const hasBg = document.getElementById('textHasBg').checked;
            const bgColor = document.getElementById('textBgColor').value;
            textObj.set('backgroundColor', hasBg ? bgColor : '');
            palco.renderAll();
            salvarEstado();
        }
    };
    document.getElementById('textHasBg').addEventListener('change', atualizarFundoCaixa);
    document.getElementById('textBgColor').addEventListener('input', atualizarFundoCaixa);

    // Função auxiliar para atualizar Borda/Contorno
    const atualizarBorda = () => {
        const textObj = obterTextoAtivo();
        if (textObj) {
            const hasStroke = document.getElementById('textHasStroke').checked;
            const strokeColor = document.getElementById('textStrokeColor').value;
            const strokeWidth = parseFloat(document.getElementById('textStrokeWidth').value) || 1;

            document.getElementById('valStrokeWidth').innerText = strokeWidth;

            textObj.set({
                stroke: hasStroke ? strokeColor : null,
                strokeWidth: hasStroke ? strokeWidth : 0
            });
            palco.renderAll();
            salvarEstado();
        }
    };
    document.getElementById('textHasStroke').addEventListener('change', atualizarBorda);
    document.getElementById('textStrokeColor').addEventListener('input', atualizarBorda);
    document.getElementById('textStrokeWidth').addEventListener('input', atualizarBorda);

    // Função auxiliar para atualizar Sombra
    const atualizarSombra = () => {
        const textObj = obterTextoAtivo();
        if (textObj) {
            const hasShadow = document.getElementById('textHasShadow').checked;
            const shadowColor = document.getElementById('textShadowColor').value;
            const blur = parseInt(document.getElementById('textShadowBlur').value) || 5;
            const offsetX = parseInt(document.getElementById('textShadowOffsetX').value) || 3;
            const offsetY = parseInt(document.getElementById('textShadowOffsetY').value) || 3;

            document.getElementById('valShadowBlur').innerText = blur;
            document.getElementById('valShadowOffsetX').innerText = offsetX;
            document.getElementById('valShadowOffsetY').innerText = offsetY;

            if (hasShadow) {
                textObj.set('shadow', new fabric.Shadow({
                    color: shadowColor,
                    blur: blur,
                    offsetX: offsetX,
                    offsetY: offsetY
                }));
            } else {
                textObj.set('shadow', null);
            }
            palco.renderAll();
            salvarEstado();
        }
    };
    document.getElementById('textHasShadow').addEventListener('change', atualizarSombra);
    document.getElementById('textShadowColor').addEventListener('input', atualizarSombra);
    document.getElementById('textShadowBlur').addEventListener('input', atualizarSombra);
    document.getElementById('textShadowOffsetX').addEventListener('input', atualizarSombra);
    document.getElementById('textShadowOffsetY').addEventListener('input', atualizarSombra);
}

// ============================================
// Funções para Salvar como Nova Formação
// ============================================

async function abrirModalNovaFormacao() {
    await atualizarListaFormacoes();
    const input = document.getElementById('inputNovaFormacaoNome');
    input.value = '';
    input.classList.remove('is-invalid');
    const modal = new bootstrap.Modal(document.getElementById('modalSalvarNovaFormacao'));
    modal.show();
}

function confirmarSalvarNovaFormacao() {
    const input = document.getElementById('inputNovaFormacaoNome');
    const nome = input.value.trim();
    const feedback = document.getElementById('feedbackNovaFormacaoNome');

    if (!nome) {
        input.classList.add('is-invalid');
        feedback.textContent = "por favor insira um nome na formação";
        return;
    }

    const nomeExiste = listaFormacoesCache.some(f => f.forma_nome.toLowerCase() === nome.toLowerCase());
    if (nomeExiste) {
        input.classList.add('is-invalid');
        feedback.textContent = "Nome de formação ja existente";
        return;
    }

    input.classList.remove('is-invalid');

    idFormacaoAtual = null;
    document.getElementById("tituloFormacao").value = nome;

    // Atualiza título visualmente se tiver lógica associada (opcional)
    ocultarAvisoTituloFormacao();

    const modalEl = document.getElementById('modalSalvarNovaFormacao');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    salvarFormacao();
}