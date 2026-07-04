// Variáveis Globais
let listaMembros = [];
let nomeAntigoMemoria = "";

// 1. Carregar Membros
function carregarMembros() {
    fetch("/apimembro/get-membro?keyword=")
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar membros");
            return response.json();
        })
        .then(data => {
            listaMembros = data;
            renderizarTabela(listaMembros);
        })
        .catch(error => {
            console.error("Erro:", error);
            renderizarTabela([]);
        });
}

// --- Função Auxiliar: Calcular Idade ---
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "N/A";

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diferencaMeses = hoje.getMonth() - nascimento.getMonth();

    if (diferencaMeses < 0 || (diferencaMeses === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return idade;
}

// 2. Renderizar Tabela
function renderizarTabela(lista) {
    const tabela = document.getElementById("tabelaMembros");
    tabela.innerHTML = "";
    let conteudo = "";

    // Mensagem amigável se a lista estiver vazia
    if (!lista || lista.length === 0) {
        tabela.innerHTML = "<tr><td colspan='8' class='text-center text-muted py-4'>Nenhum membro encontrado.</td></tr>";
        return;
    }

    for (let membro of lista) {
        let idadeCalculada = calcularIdade(membro.dtNascimento);
        let sexoFormatado = membro.sexo === 'M' ? 'Masculino' : (membro.sexo === 'F' ? 'Feminino' : membro.sexo);

        // A ordem aqui bate com os <th> do seu HTML
        conteudo += `
        <tr>
            <td class="fw-medium">${membro.nome}</td>
            <td>${membro.cpf}</td>
            <td>${sexoFormatado}</td>
            <td>${membro.cargo}</td>
            <td>${idadeCalculada} anos</td>
            <td>${membro.endereco}</td>
            <td>${membro.experiencia} anos</td>
            <td class="text-center">
                <div class="d-flex gap-2 justify-content-center">
                    <button type="button" class="btn btn-alterar px-3 fw-bold flex-shrink-0" onclick="carregaAtualiza(${membro.id})" data-bs-toggle="modal" data-bs-target="#editModal" title="Editar">Alterar</button>
                    <button type="button" class="btn btn-excluir px-3 fw-bold flex-shrink-0" onclick="deletarMembro(${membro.id})" title="Excluir">Excluir</button>
                </div>
            </td>
        </tr>
        `;
    }
    tabela.innerHTML = conteudo;
}

// 3. Filtro de busca
function filtrarMembros() {
    const termo = document.getElementById("busca").value.trim();

    if (termo !== "") {
        fetch(`/apimembro/get-membro?keyword=${encodeURIComponent(termo)}`, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Erro na busca");
                return response.json();
            })
            .then(data => renderizarTabela(data))
            .catch(error => {
                console.error(error);
            });
    } else {
        renderizarTabela(listaMembros);
    }
}

// 4. Deletar Membro
function deletarMembro(id) {
    if (confirm("Tem certeza que deseja excluir este membro?")) {
        fetch(`/apimembro/excluirMembro/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) throw new Error("Erro ao deletar");
                mostrarModalAlerta("Sucesso", "Membro deletado com sucesso!", "sucesso", function() {
                    carregarMembros();
                });
            })
            .catch(error => {
                console.error(error);
                mostrarModalAlerta("Erro", "Membro associado à uma formação.", "erro");
            });
    }
}

// ==========================================
// 6. CARREGAR E ATUALIZAR EDIÇÃO (PUT)
// ==========================================
function carregaAtualiza(id) {
    fetch(`/apimembro/get-membro/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar membro por ID");
            return response.json();
        })
        .then(membro => {
            if (membro) {
                document.getElementById("editNome").value = membro.nome || "";
                document.getElementById("editCpf").value = membro.cpf || "";
                document.getElementById("editDtNascimento").value = membro.dtNascimento || "";
                document.getElementById("editSexo").value = membro.sexo || "M";
                document.getElementById("editExperiencia").value = membro.experiencia || 0;

                const selectCargoEdit = document.getElementById("editCargoId");
                if (selectCargoEdit) {
                    selectCargoEdit.value = membro.cargo || "";
                }

                const enderecoFull = membro.endereco || "";

                try {
                    const lastDash = enderecoFull.lastIndexOf(" - ");
                    if (lastDash !== -1) {
                        const cep = enderecoFull.substring(lastDash + 3).trim();
                        const resto1 = enderecoFull.substring(0, lastDash).trim();

                        const secondToLastDash = resto1.lastIndexOf(" - ");
                        if (secondToLastDash !== -1) {
                            const cidadeEstado = resto1.substring(secondToLastDash + 3).trim();
                            const resto2 = resto1.substring(0, secondToLastDash).trim();

                            if (document.getElementById("editCep")) document.getElementById("editCep").value = cep;

                            const partesBarra = cidadeEstado.split("/");
                            if (document.getElementById("editCidade")) document.getElementById("editCidade").value = partesBarra[0] ? partesBarra[0].trim() : "";
                            if (document.getElementById("editEstado")) document.getElementById("editEstado").value = partesBarra[1] ? partesBarra[1].trim() : "";

                            const partesComp = resto2.split(/\s*\|\s*/);
                            if (document.getElementById("editComplemento")) {
                                document.getElementById("editComplemento").value = partesComp.length > 1 ? partesComp[1].trim() : "";
                            }

                            const lastComma = partesComp[0].lastIndexOf(",");
                            if (lastComma !== -1) {
                                const bairro = partesComp[0].substring(lastComma + 1).trim();
                                const resto3 = partesComp[0].substring(0, lastComma).trim();

                                const secondToLastComma = resto3.lastIndexOf(",");
                                if (secondToLastComma !== -1) {
                                    const numero = resto3.substring(secondToLastComma + 1).trim();
                                    const rua = resto3.substring(0, secondToLastComma).trim();

                                    if (document.getElementById("editRua")) document.getElementById("editRua").value = rua;
                                    if (document.getElementById("editNumero")) document.getElementById("editNumero").value = numero;
                                    if (document.getElementById("editBairro")) document.getElementById("editBairro").value = bairro;
                                } else {
                                    if (document.getElementById("editRua")) document.getElementById("editRua").value = resto3;
                                    if (document.getElementById("editBairro")) document.getElementById("editBairro").value = bairro;
                                }
                            } else {
                                if (document.getElementById("editRua")) document.getElementById("editRua").value = partesComp[0].trim();
                            }
                        } else {
                            if (document.getElementById("editRua")) document.getElementById("editRua").value = enderecoFull;
                        }
                    } else {
                        if (document.getElementById("editRua")) document.getElementById("editRua").value = enderecoFull;
                    }
                } catch (e) {
                    console.error("Erro ao fatiar o endereço:", e);
                    if (document.getElementById("editRua")) document.getElementById("editRua").value = enderecoFull;
                }

                localStorage.setItem("membroEditar", JSON.stringify(membro));
            }
        })
        .catch(error => {
            console.error("Erro ao carregar os dados do membro:", error);
            mostrarModalAlerta("Erro", "Não foi possível carregar os dados do membro para edição.", "erro");
        });
}

function atualizarMembro() {
    const dataNascimentoStr = document.getElementById("editDtNascimento").value;

    if (!verificarIdadeMinima(dataNascimentoStr)) {
        mostrarModalAlerta("Aviso", "Atenção: O membro precisa ter no mínimo 5 anos de idade!", "erro");
        document.getElementById("editDtNascimento").classList.add("is-invalid");
        return;
    } else {
        document.getElementById("editDtNascimento").classList.remove("is-invalid");
    }

    const membroOriginal = JSON.parse(localStorage.getItem("membroEditar"));

    // Junta o endereço formatado novamente usando os novos campos do modal de edição
    let compEdit = document.getElementById("editComplemento") ? document.getElementById("editComplemento").value.trim() : "";
    let compTextoEdit = compEdit ? " | " + compEdit : "";

    let enderecoMontado = `${document.getElementById("editRua").value.trim()}, ${document.getElementById("editNumero").value.trim()}, ${document.getElementById("editBairro").value.trim()}${compTextoEdit} - ${document.getElementById("editCidade").value.trim()}/${document.getElementById("editEstado").value} - ${document.getElementById("editCep").value.trim()}`;

    const selectCargoEdit = document.getElementById("editCargoId");

    const membroAtualizado = {
        id: membroOriginal.id,
        nome: document.getElementById("editNome").value.trim(),
        cpf: document.getElementById("editCpf").value.trim(),
        dtNascimento: dataNascimentoStr,
        sexo: document.getElementById("editSexo").value.trim(),
        endereco: enderecoMontado,
        cargo: parseInt(selectCargoEdit ? selectCargoEdit.value : 0),
        experiencia: parseInt(document.getElementById("editExperiencia").value)
    };

    fetch("/apimembro/get-membro?keyword=")
        .then(res => res.json())
        .then(membros => {
            const nomeExiste = membros.some(m => m.id !== membroOriginal.id && m.nome && m.nome.trim().toLowerCase() === membroAtualizado.nome.trim().toLowerCase());
            const cpfExiste = membros.some(m => m.id !== membroOriginal.id && m.cpf && m.cpf.trim() === membroAtualizado.cpf.trim());

            if (nomeExiste) {
                mostrarModalAlerta("Erro de Validação", "Já existe outro membro cadastrado com este Nome!", "erro");
                return;
            }
            if (cpfExiste) {
                mostrarModalAlerta("Erro de Validação", "Já existe outro membro cadastrado com este CPF!", "erro");
                return;
            }

            fetch(`/apimembro/atualizarMembro`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(membroAtualizado)
            })
                .then(response => {
                    if (response.ok) {
                        mostrarModalAlerta("Sucesso", "Membro atualizado com sucesso!", "sucesso", function() {
                            localStorage.removeItem("membroEditar");
                            window.location.reload();
                        });
                    } else {
                        mostrarModalAlerta("Erro", "Erro ao atualizar o membro.", "erro");
                    }
                })
                .catch(error => console.error(error));
        })
        .catch(error => console.error("Erro ao verificar membros existentes:", error));
}


function verificarIdadeMinima(dataNascimentoString) {
    if (!dataNascimentoString) return false;

    const dataNasc = new Date(dataNascimentoString);
    const hoje = new Date();

    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const diferencaMes = hoje.getMonth() - dataNasc.getMonth();

    if (diferencaMes < 0 || (diferencaMes === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
    }

    return idade >= 5;
}

// --- EVENTOS E CONFIGURAÇÕES DA PÁGINA ---

document.addEventListener('DOMContentLoaded', () => {
    carregarMembros();
    const modalCadastrar = document.getElementById('cadastrar');
    if (modalCadastrar) {
        modalCadastrar.addEventListener('hidden.bs.modal', function () {
            const form = document.forms.formCadastro;
            if (form) {
                form.reset();
                form.classList.remove('was-validated');

                const camposValidados = form.querySelectorAll('.is-invalid, .is-valid');
                camposValidados.forEach(campo => {
                    campo.classList.remove('is-invalid', 'is-valid');
                });
            }
        });
    }
});



document.addEventListener('input', function (event) {
    if (event.target.classList.contains('is-invalid')) {
        event.target.classList.remove('is-invalid');
    }
});

document.addEventListener('change', function (event) {
    if (event.target.classList.contains('is-invalid')) {
        event.target.classList.remove('is-invalid');
    }
});

document.addEventListener('hide.bs.modal', function () {
    if (document.activeElement) {
        document.activeElement.blur(); // O "blur" é o comando que arranca o foco do elemento
    }
});