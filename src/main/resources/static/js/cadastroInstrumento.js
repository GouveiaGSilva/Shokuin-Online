

async function cadastrarInstrumento(event) {
    const formulario = document.getElementById("formInstrumento");
    if (formulario.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        const f = document.forms[0]
        let nomeImg = f.imagem.files[0].name;
        let extensao = nomeImg.split('.').pop();
        const fornecedor = {
            id: parseInt(f.fornecedor.value)
        }
        const instrumentos = {
            instru_nome: f.nomeInstrumento.value,
            instru_img: f.nomeInstrumento.value + "." + extensao,
            fornecedor: fornecedor,
        }
        const requestOptions = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(instrumentos) };
        let nome = document.getElementById("nomeInstrumento").value;
        let flag = await validaInstrumento(nome);
        if (flag) {
            await fetch("http://localhost:8080/apiInstrumento/cadastroInstrumento", requestOptions)
                .then(resp => {
                    if (resp.ok)
                        return resp.json()
                            .then(data => {
                                salvarImagem(instrumentos.instru_img, f.imagem.files[0]);
                                abrirModalConfirmacao(data.instru_nome);
                                document.getElementById("formInstrumento").reset();
                            })
                }).catch(Error => alert(Error + "Erro ao cadastrar o Instrumento!"))
        }
        else {
            abrirModalErro("Instrumento com nome já cadastrado", "cadastre o instrumento com um outro nome");
        }
    }
}

async function validaInstrumento(nome) {
    let validacao = true;
    await fetch("http://localhost:8080/apiInstrumento/getAllInstrumentos")
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        for (let item of data) {
                            if (item.instrumento && item.instrumento.instru_nome.trim().toLowerCase() === nome.trim().toLowerCase()) {
                                validacao = false;
                            }
                        }
                    })
        })
    return validacao;
}

async function getInstrumentoByNome(nome) {
    let instrumento
    await fetch("http://localhost:8080/apiInstrumento/getInstrumentosNome?nome=" + nome)
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        instrumento = data;
                    })
        }).catch(Error => { alert("Erro: Instrumento não encontrado") })
    return instrumento;
}

function procuraFornecedores() {
    fetch("http://localhost:8080/fornecedores/listar?keyword=")
        .then(response => {
            if (response.status === 200)
                return response.json()
                    .then(json => combox.innerHTML = alimentaCombox(json))
        })
}

async function salvarImagem(instrunome, img) {
    const formData = new FormData();
    formData.append('imagem', img);
    formData.append('instru_nome', instrunome);
    fetch("http://localhost:8080/apiInstrumento/salvarImg", { method: 'POST', body: formData, })
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        console.log(data);
                    })
        })
}

async function getNomeFornecedor(id) {
    await fetch("http://localhost:8080/fornecedor/get-id?id=" + id)
        .then(resp => {
            if (resp.ok)
                resp.json()
                    .then(data => {
                        return data.nome;
                    })
        })
}

//combox
let combox = document.getElementById("opFornecedores");

function alimentaCombox(json) {
    let linha = "<option value=\"\" hidden disabled selected>Selecione um fornecedor</option>";
    for (fornecedor of json)
        linha += `<option value="${fornecedor.id}" >${fornecedor.nome}</option>`;
    return linha
}

procuraFornecedores();

function abrirModalConfirmacao(instrumento) {
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    const mensagemSucesso = document.getElementById("mensagemSucesso");
    mensagemSucesso.innerHTML = `${instrumento} Cadastrado com sucesso!`;
    modal.show();
}

function abrirModalErro(mensagemErro, auxM) {
    const modal = new bootstrap.Modal(document.getElementById('messageError'));
    const mensagemSucesso = document.getElementById("mensagemErro");
    const mensagemAuxiliar = document.getElementById("mensagemAuxiliar");
    mensagemSucesso.innerHTML = `${mensagemErro}`;
    mensagemAuxiliar.innerHTML = `${auxM}`;
    modal.show();
}