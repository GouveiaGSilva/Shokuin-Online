let listaCargos = [];
function carregar() { fetch("./data/cargos.json").then(r => r.json()).then(data => { listaCargos = data; renderizar(listaCargos); }); }
function renderizar(lista) {
    const t = document.getElementById("tabelaBody"); t.innerHTML = "";
    lista.forEach(item => {
        t.innerHTML += '<tr><td>'+item.nomeCargo+'</td><td>'+item.funcao+'</td><td class="text-center"><div class="d-flex gap-2 justify-content-center"><button type="button" class="btn btn-alterar px-4 fw-bold">Alterar</button><button type="button" class="btn btn-excluir px-4 fw-bold" onclick="deletar('+item.id+')">Excluir</button></div></td></tr>';
    });
}
function filtrar() { const f = document.getElementById("busca").value.toLowerCase(); renderizar(listaCargos.filter(i => i.nomeCargo.toLowerCase().includes(f))); }
function deletar(id) { if (confirm("Deseja excluir?")) { listaCargos = listaCargos.filter(i => i.id !== id); renderizar(listaCargos); } }
window.onload = () => { carregarHome(); carregar(); };
