const Size = Quill.import('attributors/style/size');
Size.whitelist = null;
Quill.register(Size, true);
const urlDoc = "/doc";
var idApre;

let conteudoInicial = "";
let tituloInicial = "";

const quill = new Quill('#editor', {
    modules: {
        toolbar: '#toolbar'
    },
    theme: 'snow'
});
quill.format('size', '11px');
quill.format('align', 'left');

const sizeInput = document.getElementById('font-size-input');

function mudarSize(tamanho) {
    let atual = parseInt(sizeInput.value) || 11;
    let novo = atual + tamanho;
    if (novo < 8) novo = 8;
    sizeInput.value = novo;
    quill.format('size', novo + 'px');
}

sizeInput.onchange = () => {
    quill.format('size', sizeInput.value + 'px');
};

quill.on('selection-change', (range) => {
    if (range) {
        let format = quill.getFormat(range);
        if (format.size) sizeInput.value = parseInt(format.size);
    }
});

const inputTitulo = document.getElementById('doc-titulo');
function ajustarLarguraTitulo() {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.font = window.getComputedStyle(inputTitulo).font;
    span.style.textTransform = 'uppercase';
    span.innerText = inputTitulo.value || inputTitulo.placeholder;
    document.body.appendChild(span);
    inputTitulo.style.width = (span.offsetWidth + 10) + 'px';
    document.body.removeChild(span);
}

window.addEventListener('load', ajustarLarguraTitulo);
inputTitulo.addEventListener('input', ajustarLarguraTitulo);

function salvar() {
    const nomeArquivo = document.getElementById('doc-titulo').value;
    document.getElementById('modal-nome-arquivo').innerText = nomeArquivo+".pdf";
    document.getElementById('modal-confirmacao').style.display = 'flex';
}

window.onload = () => {
    idApre = localStorage.getItem('id');
    if(idApre) {
        carregarDoc(idApre);
        carregarMembrosApresentacao(idApre);
    } else {
        conteudoInicial = quill.root.innerHTML;
        tituloInicial = document.getElementById('doc-titulo').value;
        document.getElementById('lista-membros-sidebar').innerHTML = '<div class="text-muted text-center p-4"><small>Apresentação não identificada.</small></div>';
    }
}

async function carregarDoc(id){
    try {
        const resp = await fetch(urlDoc+ "/get-byIdAprese?id="+id);
        if(resp.ok){
            const dados = await resp.json();
            const nome = document.getElementById('doc-titulo');
            nome.value = dados.nome;
            quill.root.innerHTML = dados.conteudo;
        }
        else {
            console.log("erro");
        }
    }catch (err) {
        console.error("Erro na requisição:", err);
    } finally {
        conteudoInicial = quill.root.innerHTML;
        tituloInicial = document.getElementById('doc-titulo').value;
        ajustarLarguraTitulo();
    }
}

async function confirmarSalvar() {
    fecharModal();
    const nomeArquivo = document.getElementById('doc-titulo').value;
    const Doc = {
        nome: nomeArquivo,
        conteudo: quill.root.innerHTML,
        apresentacao:{}
    };
    try {
        const response = await fetch(urlDoc + "/salvar?id="+idApre, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(Doc)
        });
        if (response.ok) {
            conteudoInicial = quill.root.innerHTML;
            tituloInicial = nomeArquivo;
            document.getElementById('modal-sucesso').style.display = 'flex';
        } else {
            exibirErro("Não foi possível salvar o documento!\nTente novamente mais tarde");
        }
    } catch (error) {
        exibirErro("Não realizar a requisição!\nTente novamente mais tarde");
    }
}

function fecharModal() {
    document.getElementById('modal-confirmacao').style.display = 'none';
}

function fecharModalSucesso() {
    document.getElementById('modal-sucesso').style.display = 'none';
    window.location.href = 'listarApresentacao.html';
}

function verificarSair() {
    const conteudoAtual = quill.root.innerHTML;
    const tituloAtual = document.getElementById('doc-titulo').value;
    if (conteudoAtual !== conteudoInicial || tituloAtual !== tituloInicial) {
        document.getElementById('modal-sair').style.display = 'flex';
    } else {
        window.location.href = 'listarApresentacao.html';
    }
}

function fecharModalSair() {
    document.getElementById('modal-sair').style.display = 'none';
}

function confirmarSair() {
    document.getElementById('modal-sair').style.display = 'none';
    window.location.href = 'listarApresentacao.html';
}

function fecharModalErro(){
    document.getElementById('modal-erro').style.display = 'none';
}

function exibirErro(mensagem) {
    document.getElementById('msmErro').innerHTML = mensagem;
    document.getElementById('modal-erro').style.display = 'flex';
}

async function carregarMembrosApresentacao(id) {
    if (!id) return;
    try {
        const respMembros = await fetch("/apimembro/get-membro");
        const respVinculados = await fetch(`/apresentacao/membros-vinculados?id=${id}`);
        
        if (respMembros.ok && respVinculados.ok) {
            const todosMembros = await respMembros.json();
            const vinculadosIds = await respVinculados.json();
            
            const membrosDaApresentacao = todosMembros.filter(m => vinculadosIds.includes(m.id));
            renderizarMembrosSidebar(membrosDaApresentacao);
        } else {
            document.getElementById('lista-membros-sidebar').innerHTML = '<div class="text-danger text-center p-3">Erro ao carregar membros.</div>';
        }
    } catch (error) {
        console.error("Erro ao carregar membros:", error);
        document.getElementById('lista-membros-sidebar').innerHTML = '<div class="text-danger text-center p-3">Falha de conexão.</div>';
    }
}

function renderizarMembrosSidebar(membros) {
    const container = document.getElementById('lista-membros-sidebar');
    container.innerHTML = '';
    
    if (membros.length === 0) {
        container.innerHTML = '<div class="text-muted text-center p-4"><small>Nenhum membro vinculado a esta apresentação.</small></div>';
        return;
    }
    
    membros.forEach(membro => {
        const html = `
        <div class="membro-item">
            <div class="membro-icon">
                <i class="bi bi-person-fill"></i>
            </div>
            <div class="membro-info">
                <p class="membro-nome" title="${membro.nome}">${membro.nome}</p>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}