
function listarInstrumentos() {
    fetch("/apiInstrumento/getAllInstrumentos")
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        construirTabela(data);
                    })
        })
}

async function construirTabela(lista) {
    let tabela = "";
    if (lista != null && lista.length > 0) {
        for (let estoque of lista) {
            let imgSrc = estoque.instrumento.instru_img ? `${estoque.instrumento.instru_img}` : 'https://fjsp.org.br/wp-content/uploads/2020/10/taiko-c.jpg';
            tabela += `
            <div class="card shadow-sm border-0 w-100" style="border-left: 4px solid var(--taiko-gold); border-radius: 0.5rem; overflow: hidden; background-color: #ffffff;">
                <div class="row g-0 align-items-center">
                    <div class="col-md-3" style="background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 150px; border-right: 1px solid #e5e7eb;">
                        <img src="${imgSrc}" class="img-fluid rounded-start" alt="${estoque.instrumento.instru_nome}" style="max-height: 150px; object-fit: contain; padding: 1rem;">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between p-4">
                            <div class="flex-grow-1">
                                <h5 class="card-title font-display fw-bold text-dark mb-3 fs-4">${estoque.instrumento.instru_nome}</h5>
                                <div class="d-flex flex-column flex-md-row gap-md-4 text-secondary">
                                    <p class="card-text mb-2 mb-md-0 d-flex align-items-center"><i class="bi bi-truck text-taiko-red me-2 fs-5"></i><span><strong class="text-dark me-1">Fornecedor:</strong>${estoque.instrumento.fornecedor.nome}</span></p>
                                    <p class="card-text mb-0 d-flex align-items-center"><i class="bi bi-layers-fill text-taiko-gold me-2 fs-5"></i><span><strong class="text-dark me-1">Estoque:</strong>${estoque.quantidade} unidades</span></p>
                                </div>
                            </div>
                            <div class="d-flex flex-column gap-2 mt-3 mt-md-0 ms-md-4" style="min-width: 150px;">
                                <button type="button" class="btn btn-alterar w-100 fw-bold shadow-sm" onclick="abrirModalAtualizar(${estoque.instrumento.instru_id})"><i class="bi bi-pencil-square me-2"></i> Alterar</button>
                                <button type="button" class="btn btn-excluir w-100 fw-bold shadow-sm" onclick='abrirModalExclusao(${estoque.instrumento.instru_id}, ${JSON.stringify(estoque.instrumento.instru_nome)}, ${JSON.stringify(estoque.instrumento.instru_img)})'><i class="bi bi-trash me-2"></i> Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }
    else {
        tabela = `
        <div class="col-12 text-center text-muted py-5 w-100">
            <div class="bg-light rounded-4 p-5 shadow-sm mx-auto" style="max-width: 400px; border: 1px dashed #dee2e6;">
                <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
                <h5 class="fw-bold text-dark">Nenhum Instrumento Encontrado</h5>
                <p class="mb-0">Tente buscar por outro termo.</p>
            </div>
        </div>`;
    }
    document.getElementById("resultado").innerHTML = tabela;
    return true;
}

let combox = document.getElementById("mFornecedores");

function alimentaCombox(listaFornecedores) {
    let linha = "<option value disabled hidden selected>Selecione um fornecedor</option>";
    for (fornecedor of listaFornecedores)
        linha += `<option id="fornecedor${fornecedor.id}" value="${fornecedor.id}" >${fornecedor.nome}</option>`;
    return linha
}


function buscarInstrumentos() {
    let chave = document.getElementById("busca").value;
    fetch("/apiInstrumento/listarInstrumentos?chave=" + chave)
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        construirTabela(data);
                    })
        })
        .catch(Error => construirTabela(null))
}

function abrirModalCadastrar() {
    fetch("/fornecedores/listar?keyword=")
        .then(response => {
            if (response.status === 200)
                return response.json()
                    .then(data => {
                        document.getElementById("opFornecedoresCad").innerHTML = alimentaCombox(data);
                    });
        });

    document.getElementById('formInstrumentoCad').reset();
    
    let imagePreviewContainer = document.getElementById('imagePreviewContainer');
    if (imagePreviewContainer) {
        imagePreviewContainer.classList.add('d-none');
        document.getElementById('imagePreview').src = '';
    }

    const modal = new bootstrap.Modal(document.getElementById('modalcadastrar'));
    modal.show();
}
async function cadastrarInstrumento(event) {
    const formulario = document.getElementById("formInstrumentoCad");
    if (formulario.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        const f = document.forms["formInstrumentoCad"];
        let base64Img = document.getElementById('imagePreview').src || null;
        if (base64Img && base64Img.startsWith("data:")) {
            // É base64 válido
        } else {
            base64Img = null;
        }

        const fornecedor = {
            id: parseInt(f.fornecedor.value)
        }
        const instrumentos = {
            instru_nome: f.instrumentos.value,
            instru_img: base64Img,
            fornecedor: fornecedor,
        }
        const requestOptions = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(instrumentos) };
        let nome = f.instrumentos.value;
        let flag = await validaInstrumento(nome);
        if (flag) {
            await fetch("/apiInstrumento/cadastroInstrumento", requestOptions)
                .then(resp => {
                    if (resp.ok)
                        return resp.json()
                            .then(data => {
                                abrirModalConfirmacaoCad(data.instru_nome);
                                document.getElementById("formInstrumentoCad").reset();
                            })
                }).catch(Error => abrirModalErro("Não foi possivel cadastrar o instrumento", "verifique a conexão com banco de dados: " + Error))
        }
        else {
            abrirModalErro("Instrumento com nome já cadastrado", "cadastre o instrumento com um outro nome");
        }
    }
}
async function validaInstrumento(nome) {
    let validacao = true;
    await fetch("/apiInstrumento/getAllInstrumentos")
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        for (let item of data) {
                            if (item.instrumento && item.instrumento.instru_nome && item.instrumento.instru_nome.trim().toLowerCase() === nome.trim().toLowerCase()) {
                                validacao = false;
                            }
                        }
                    })
        })
    return validacao;
}

async function validaInstrumentoAtualizar(nome, id) {
    let validacao = true;
    await fetch("/apiInstrumento/getAllInstrumentos")
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        for (let item of data) {
                            if (item.instrumento && item.instrumento.instru_nome && item.instrumento.instru_nome.trim().toLowerCase() === nome.trim().toLowerCase() && item.instrumento.instru_id !== id) {
                                validacao = false;
                            }
                        }
                    })
        })
    return validacao;
}

function abrirModalConfirmacaoCad(instrumento) {
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    const mensagemSucesso = document.getElementById("mensagemSucesso");
    mensagemSucesso.innerHTML=`${instrumento} Cadastrado com sucesso!`;
    modal.show();
    const modalcad = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalcadastrar')
    );
    modalcad.hide();
    listarInstrumentos();
}

function abrirModalErro(mensagemErro, auxM) {
    const modal = new bootstrap.Modal(document.getElementById('messageError'));
    const mensagemSucesso = document.getElementById("mensagemErro");
    const mensagemAuxiliar = document.getElementById("mensagemAuxiliar");
    mensagemSucesso.innerHTML=`${mensagemErro}`;
    mensagemAuxiliar.innerHTML=`${auxM}`;
    modal.show();
}

async function atualizarInstrumento(event, id, img) {
    const formulario = document.getElementById("formInstrumentoAt");
    if (!formulario.checkValidity()) {
        formulario.classList.add('was-validated');
        return;
    }
    event.preventDefault();
    event.stopPropagation();

    let nome = document.getElementById('nomeInstrumentoAt').value;

    let flagValida = await validaInstrumentoAtualizar(nome, id);
    if (!flagValida) {
        abrirModalErro("Instrumento com nome já cadastrado", "cadastre o instrumento com um outro nome");
        return;
    }

    let flag = false;
    let idf = document.getElementById('opFornecedoresAt').value;

    let base64Img = document.getElementById('imagePreviewAt').src || null;
    if (base64Img && base64Img.startsWith("data:")) {
        // Já está base64
    } else {
        base64Img = img; // Mantém a antiga
    }

    const fornecedor = {
        id: parseInt(idf)
    }

    const instrumento = {
        instru_id: id,
        instru_nome: nome,
        instru_img: base64Img,
        fornecedor: fornecedor,
    };

    await fetch(`/apiInstrumento/atualizaInstrumento`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(instrumento)
    })
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => flag = true)
        }).catch(error => flag = false)

    if (flag) {
        const modalElement = document.getElementById('modalAtualizar');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        
        listarInstrumentos();
        abrirModalSucessoAt("Instrumento atualizado", "O instrumento irá aparecer com as novas mudanças realizadas");
    }
    else {
        alert("Erro ao atualizar o instrumento.");
    }
}
async function abrirModalAtualizar(id) {
    await fetch("/fornecedores/listar?keyword=")
        .then(response => {
            if (response.status === 200)
                return response.json()
                    .then(data => {
                        document.getElementById("opFornecedoresAt").innerHTML = alimentaCombox(data);
                    });
        });
    fetch("/apiInstrumento/getInstrumentos?id=" + id)
        .then(resp => {
            if (resp.ok)
                return resp.json()
                    .then(data => {
                        document.getElementById("nomeInstrumentoAt").value = data.instru_nome;
                        let opFornecedor = document.getElementById("fornecedor" + data.fornecedor.id);
                        if (opFornecedor)
                            opFornecedor.selected = true;

                        let imagePreviewContainerAt = document.getElementById('imagePreviewContainerAt');
                        let imagePreviewAt = document.getElementById('imagePreviewAt');

                        if (data.instru_img && data.instru_img.trim() !== '') {
                            imagePreviewAt.src = `${data.instru_img}`;
                            imagePreviewContainerAt.classList.remove('d-none');
                        }
                        else {
                            imagePreviewAt.src = '';
                            imagePreviewContainerAt.classList.add('d-none');
                        }

                        let btnAtualizar = document.getElementById("btnAtualizar");
                        btnAtualizar.setAttribute("onclick", `atualizarInstrumento(event,  ${id} , '${data.instru_img}' )`);

                        const modal = new bootstrap.Modal(document.getElementById('modalAtualizar'));
                        modal.show();
                    })
        })
        .catch(Error => {
            console.error(Error);
            alert("Erro ao buscar dados do instrumento");
        });
}
function abrirModalSucessoAt(msgS,msgB) {
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    const mensagemSucesso = document.getElementById("mensagemSucesso");
    const messageBody = document.getElementById('messageBody');
    const botoesSucesso = document.getElementById("botoesSucesso");
    mensagemSucesso.innerHTML=`${msgS}`;
    messageBody.innerHTML=`${msgB}`
    botoesSucesso.innerHTML=`<button type="button" class="btn btn-alterar w-100 fw-bold shadow-sm" data-bs-dismiss="modal"
                            >Voltar para Lista de Instrumentos
                        </button>`
    modal.show();
    const modalcad = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalcadastrar')
    );
    modalcad.hide();
    listarInstrumentos();
}

function abrirModalExclusao(id,instrumento,img){
    const botao = document.getElementById('confirmarExclusao');
    botao.setAttribute("onclick", "excluirInstrumento('"+id+"')");
    const mensagem = document.getElementById("mensagemExclusao");
    mensagem.innerHTML = `Deseja Excluir ${instrumento} ?
        <div style="background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 150px; border-right: 1px solid #e5e7eb;">
            <img src="${img}" class="img-fluid rounded-start" alt="${instrumento}" style="max-height: 150px; object-fit: contain; padding: 1rem;">
        </div>
    `
    const modal = new bootstrap.Modal(document.getElementById('modalExcluir'));
    modal.show();
}
function excluirInstrumento(id) {
    fetch("/apiInstrumento/excluir-id?id=" + id, {
        method: "DELETE"
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Erro ao excluir");
            }
            abrirModalSucessoExclusao("Exclusao realizada","o instrumento foi retirado da lista");
            listarInstrumentos();
        })
        .catch(error => {
            console.error(error);
            alert("Erro ao excluir instrumento!");
        });
}
function abrirModalSucessoExclusao(msgS,msgB) {
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    const mensagemSucesso = document.getElementById("mensagemSucesso");
    const messageBody = document.getElementById('messageBody');
    const botoesSucesso = document.getElementById("botoesSucesso");
    mensagemSucesso.innerHTML=`${msgS}`;
    messageBody.innerHTML=`${msgB}`
    botoesSucesso.innerHTML=`<button type="button" class="btn btn-alterar w-100 fw-bold shadow-sm" data-bs-dismiss="modal"
                            >Voltar para Lista de Instrumentos
                        </button>`
    modal.show();
    const modalcad = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalcadastrar')
    );
    modalcad.hide();
    listarInstrumentos();
}

document.addEventListener("DOMContentLoaded", function() {
    const imagemCad = document.getElementById('imagemCad');
    if (imagemCad) {
        imagemCad.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const imagePreviewContainer = document.getElementById('imagePreviewContainer');
            const imagePreview = document.getElementById('imagePreview');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('d-none');
                }
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '';
                imagePreviewContainer.classList.add('d-none');
            }
        });
    }
    
    const imagemAt = document.getElementById('imagemAt');
    if (imagemAt) {
        imagemAt.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const imagePreviewContainerAt = document.getElementById('imagePreviewContainerAt');
            const imagePreviewAt = document.getElementById('imagePreviewAt');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreviewAt.src = e.target.result;
                    imagePreviewContainerAt.classList.remove('d-none');
                }
                reader.readAsDataURL(file);
            } else {
                imagePreviewAt.src = '';
                imagePreviewContainerAt.classList.add('d-none');
            }
        });
    }
});
