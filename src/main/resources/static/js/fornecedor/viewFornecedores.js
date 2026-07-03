const url = "http://localhost:8080/";
const form = document.forms[0];
const pesquisa = document.getElementById("pesquisar");

if (pesquisa != null) {
    pesquisa.addEventListener("keyup", pesquisarFornecedores);
    constroiTabela("");
}

function pesquisarFornecedores(event) {
    constroiTabela(pesquisa.value);
}

async function constroiTabela(keyword) {
    const resp = await fetch(url + "fornecedores/listar?keyword=" + keyword);
    const tabela = document.getElementById("tabela");
    const tbody = document.getElementById("resultado");
    tbody.innerHTML = "";
    if (resp.ok) {
        const dados = await resp.json();
        for (const obj of dados) {
            const tr = document.createElement("tr");
            const partesEndereco = obj.endereco.split(',');
            const enderecoCurto = partesEndereco.slice(0, 3).join(',');
            tr.innerHTML = `
                <td>${obj.nome}</td>
                <td>${obj.cnpj}</td>
                <td>${enderecoCurto}</td>
                <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center"><button type="button" class="btn btn-alterar px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#alterar" onclick="exibeAlterar(${obj.id})">Alterar</button><button type="button" class="btn btn-excluir px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#excluir" onclick="exibeExcluir(${obj.id})">Excluir</button></div>
                </td>
            `;
            tbody.appendChild(tr);
            tabela.appendChild(tbody);
        }
    }
    else {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='3' style='text-align: center'>Sem resultados</td>"
        tbody.appendChild(tr);
        tabela.appendChild(tbody);
    }
}

function exibeExcluir(id) {
    document.getElementById("btConfirma").setAttribute("onclick", `excluirFornecedor(${id})`);
}

function excluirFornecedor(id) {
    const requestOptions = {
        method: "DELETE", headers: { "Content-Type": "application/json" }
    };
    fetch(url + "fornecedores/excluir?id=" + id, requestOptions)
        .then(resp => {
            if (resp.ok) {
                exibirSucesso("Fornecedor excluido com sucesso!");
            }
            else{
                exibirErro("Não foi possível excluir o fornecedor!\nTente Novamente mais tarde");
            }
        })
        .catch(err =>{
            exibirErro("Não foi possível realizar a requisição!\nTente Novamente mais tarde");
        });
}


if (form) {
    form.onsubmit = valida;
    if (form.id === 'formAtualizacao')
        document.forms[1].onsubmit = valida;
}

function valida(event, id) {
    let valido;
    let flag = false;
    event.preventDefault();
    let elementoID = event.target.id;
    if (elementoID === "formCadastro" && form.id === "formAtualizacao")
        valido = document.forms[1].checkValidity();
    else
        valido = form.checkValidity();
    adicionaValidacao(valido, event, flag);
    if (!flag) {
        if (elementoID === "formCadastro")
            cadastrarFornecedor();
    }
}

function adicionaValidacao(valido, event, flag) {
    var listaElementos = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(listaElementos)
        .forEach(function (form) {
            if (!valido) {
                flag = true;
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        })
}

function removeValidacao() {
    var listaElementos = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(listaElementos)
        .forEach(function (form) {
            form.classList.remove('was-validated')
        })
}

function buscarEndereco() {

    let cepInput = document.getElementById("cep").value;

    let cepLimpo = cepInput.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
        fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
            .then(response => response.json())
            .then(dados => {
                if (!dados.erro) {
                    document.getElementById('rua').value = dados.logradouro;
                    document.getElementById('bairro').value = dados.bairro;
                    document.getElementById('cidade').value = dados.localidade;
                    document.getElementById('estado').value = dados.uf;
                    document.getElementById('numero').focus();
                }
            })
            .catch(err => console.error("Erro na requisição Fetch:", err));
    } else {
        console.log("CEP inválido ou incompleto.");
    }
}

function mascaraCEP(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = valor;
}

function mascaraNumero(input) {
    input.value = input.value.replace(/\D/g, '');
}

function mascaraCNPJ(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    input.value = valor;
}

function cadastrarFornecedor() {
    let formCad = form;
    if (form.id === 'formAtualizacao')
        formCad = document.forms[1];
    const Endereco = {
        cep: formCad.cep.value,
        estado: formCad.estado.value,
        cidade: formCad.cidade.value,
        bairro: formCad.bairro.value,
        rua: formCad.rua.value,
        numero: formCad.numero.value,
        complemento: formCad.complemento.value
    };
    const fornecedor = {
        nome: formCad.nomeFornecedor.value,
        cnpj: formCad.cnpj.value,
        endereco: ""
    };
    const misto = {
        fornecedor: fornecedor,
        endereco: Endereco
    };
    const requestOptions = {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(misto)
    };
    let sucesso = false;
    removeMensagem();
    fetch(url + "fornecedores/cadastrar", requestOptions)
        .then(response => {
            if (response.ok) {
                sucesso = true;
                removeValidacao();
                setTimeout(() => {
                    if (typeof bootstrap !== 'undefined') {
                        const modalElemento = formCad.closest('.modal');
                        if (modalElemento) {
                            const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElemento);
                            modalBootstrap.hide();
                        }
                    } else {
                        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
                        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                    }
                    formCad.reset();
                }, 2500);
                if (form.id === 'formAtualizacao')
                    constroiTabela("");
            }
            return response.text();
        })
        .then(texto => {
            exibeMensagem(texto, sucesso, "cad");
        })
}

async function exibeAlterar(id) {
    const resp = await fetch(url + "fornecedores/get-id?id=" + id);
    if (resp.ok) {
        const fornecedor = await resp.json();
        document.getElementById("nomeFornecedorA").value = fornecedor.nome;
        document.getElementById("cnpjA").value = fornecedor.cnpj;
        document.getElementById("nomeFornecedorA").placeholder = fornecedor.nome;
        document.getElementById("cnpjA").placeholder = fornecedor.cnpj;
        const partes = fornecedor.endereco.split(',');
        const idsCampos = [
            "cepA", "estadoA", "cidadeA", "bairroA",
            "ruaA", "numeroA", "complementoA"
        ];
        idsCampos.forEach((idCampo, index) => {
            const elemento = document.getElementById(idCampo);
            if (elemento) {
                const valorLimpo = partes[index] ? partes[index].trim() : "";
                elemento.value = valorLimpo;
                elemento.placeholder = valorLimpo;
            }
        });
        document.getElementById("btConfirmaAlterar").onclick = () => atualizarFornecedor(id);
    }
}

function atualizarFornecedor(id) {
    const Endereco = {
        cep: document.getElementById("cepA").value,
        estado: document.getElementById("estadoA").value,
        cidade: document.getElementById("cidadeA").value,
        bairro: document.getElementById("bairroA").value,
        rua: document.getElementById("ruaA").value,
        numero: document.getElementById("numeroA").value,
        complemento: document.getElementById("complementoA").value
    };
    const fornecedor = {
        id: id,
        nome: document.getElementById("nomeFornecedorA").value,
        cnpj: document.getElementById("cnpjA").value,
        endereco: ""
    };
    const misto = {
        fornecedor: fornecedor,
        endereco: Endereco
    };
    const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(misto)
    };
    let sucesso = false;
    removeMensagem();
    fetch(url + "fornecedores/atualizar", requestOptions)
        .then(response => {
            if (response.ok) {
                sucesso = true;
                removeValidacao();
                setTimeout(() => {
                    if (typeof bootstrap !== 'undefined') {
                        const modalElemento = form.closest('.modal');
                        if (modalElemento) {
                            const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElemento);
                            modalBootstrap.hide();
                        }
                    } else {
                        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
                        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                    }
                    formCad.reset();
                }, 2500);
                constroiTabela("");
            }
            return response.text();
        })
        .then(texto => {
            exibeMensagem(texto, sucesso, "alt");
        })
}

function removeMensagem() {
    const result = document.getElementById("result");
    if (result != null)
        result.remove();
}

function exibeMensagem(texto, sucesso, tipo) {
    let auxForm;
    if (form.id === "formAtualizacao" && tipo === "cad")
        auxForm = document.forms[1];
    else
        auxForm = form;
    let tempo = 5000;
    let mensagem = texto;
    let div = document.createElement('div');
    let h4 = document.createElement('h4');
    let elemento;
    let br = document.createElement('br');
    br.id = 'br';
    div.role = "alert";
    div.id = "result";
    h4.className = "\\alert-heading\\";
    if (sucesso) {
        elemento = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>`;
        div.className = "alert alert-success d-flex align-items-center";
    }
    else {
        if (mensagem.includes("duplic"))
            mensagem = "Erro, fornecedor já cadastrado.";
        else if (mensagem.includes("sem cargos")) {
            mensagem = "Erro, nenhum fornecedor cadastrado.";
            tempo = 0;
        }
        else
            mensagem = "Ocorreu algum erro.";
        elemento = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>`;
        div.className = "alert alert-danger d-flex align-items-center";
    }
    h4.innerHTML = `${mensagem}`;
    div.appendChild(new DOMParser().parseFromString(elemento, 'text/html').body.firstChild);
    div.appendChild(h4);
    auxForm.appendChild(br);
    auxForm.appendChild(div);
    if (tempo > 0)
        setTimeout(() => {
            div.remove();
            br.remove();
        }, tempo);
}

window.onload = () => {
    carregarHome();
    carregar();
};

function exibirSucesso(mensagem) {
    document.getElementById("textoSucessoGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalSucessoGenerico"));
    modal.show();
}

function exibirErro(mensagem) {
    document.getElementById("textoErroGenerico").innerText = mensagem;
    const modal = new bootstrap.Modal(document.getElementById("modalErroGenerico"));
    modal.show();
}