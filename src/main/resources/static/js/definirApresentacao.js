const inputTitulo = document.getElementById('doc-titulo');
const url = "/apresentacao";
var idApresentacao = null;

function ajustarLarguraTitulo() {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.font = window.getComputedStyle(inputTitulo).font;
    span.innerText = inputTitulo.value || inputTitulo.placeholder;
    document.body.appendChild(span);
    inputTitulo.style.width = Math.min(span.offsetWidth + 20, window.innerWidth * 0.8) + 'px';
    document.body.removeChild(span);
}

window.addEventListener('load',  async function () {
    idApresentacao = localStorage.getItem('id');
    // localStorage.clear(); // Removido para permitir navegação livre no Wizard
    if(idApresentacao && idApresentacao !== "undefined" && idApresentacao !== "null"){
        const resp = await fetch(url+"/get-byId?id="+idApresentacao);
        if(resp.ok){
            const dados = await resp.json();
            inputTitulo.value = dados.nome;
        }
    }
});

inputTitulo.addEventListener('input', ajustarLarguraTitulo);
window.addEventListener('load', ajustarLarguraTitulo);

const btnProximo = document.getElementById('btn-proximo');
btnProximo.addEventListener('click', salvarApresentacao)

async function salvarApresentacao(){
    const apresentacao = {nome: inputTitulo.value}
    try{
        if(!idApresentacao || idApresentacao === "undefined" || idApresentacao === "null")
            idApresentacao = 0;
        const resp = await fetch(url+"/gravar?id="+idApresentacao, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(apresentacao)
        });
        if(resp.ok){
            try{
                const response = await fetch(url+"/get-byNome?nome="+apresentacao.nome);
                if(response.ok){
                    const dados = await response.json();
                    localStorage.setItem('id', dados.id);
                    localStorage.setItem('flag', 'D');
                    window.location.href = 'DefinirMusicasNaApresentacao.html';
                }
            }catch(error){
                console.error("Erro na requisição: ", error);
            }
        }
        else{
            const text = await resp.text();
            if (text.toLowerCase().includes("duplicate") || text.toLowerCase().includes("unique") || text.toLowerCase().includes("constraint") || text.toLowerCase().includes("já existe")) {
                document.getElementById('erro-titulo').style.display = 'block';
                inputTitulo.addEventListener('input', function() {
                    document.getElementById('erro-titulo').style.display = 'none';
                }, { once: true });
            } else {
                console.log("Erro ao salvar a apresentação:", text);
                window.location.href = 'listarApresentacao.html';
            }
        }
    }catch(error){
        console.error("Erro na requisição: ", error);
    }
}