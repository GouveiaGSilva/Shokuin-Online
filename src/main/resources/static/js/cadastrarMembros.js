
const modalCadastrar = document.getElementById('cadastrar');

modalCadastrar.addEventListener('hidden.bs.modal', function () {
    const form = document.forms.formCadastro;

    form.reset();

    form.classList.remove('was-validated');

    const camposValidados = form.querySelectorAll('.is-invalid, .is-valid');
    camposValidados.forEach(campo => {
        campo.classList.remove('is-invalid', 'is-valid');
    });
});




function cadastrarMembro() {

    if (!validarFormulario()) {
        console.warn("Formulário inválido! O envio foi bloqueado.");
        return;
    }
    const form = document.forms[0];
    const compInput = document.getElementById("complemento");
    const compValue = compInput && compInput.value.trim() !== "" ? " | " + compInput.value.trim() : "";

    const membro = {
        nome: form.nomeMembro.value,
        cpf: form.cpf.value,
        dtNascimento: form.dtNascimento.value,
        sexo: form.sexo.value,
        experiencia: form.experiencia.value,
        endereco: form.rua.value + ", " + form.numero.value + ", " + form.bairro.value + compValue + " - " + form.cidade.value + "/" + form.estado.value + " - " + form.cep.value,
        cargo: form.cargoId.value
    };

    fetch("/apimembro/get-membro?keyword=")
        .then(res => res.json())
        .then(membros => {
            const nomeExiste = membros.some(m => m.nome.trim().toLowerCase() === membro.nome.trim().toLowerCase());
            const cpfExiste = membros.some(m => m.cpf.trim() === membro.cpf.trim());

            if (nomeExiste) {
                mostrarModalAlerta("Erro de Validação", "Já existe um membro cadastrado com este Nome!", "erro");
                return;
            }
            if (cpfExiste) {
                mostrarModalAlerta("Erro de Validação", "Já existe um membro cadastrado com este CPF!", "erro");
                return;
            }

            fetch("/apimembro/cadmembro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(membro)
            })
                .then(response => {
                    if (response.ok) {
                        const messageModalEl = document.getElementById('messageModal');
                        if (messageModalEl) {
                            const messageModal = new bootstrap.Modal(messageModalEl);
                            messageModal.show();
                        } else {
                            mostrarModalAlerta("Sucesso", "Cadastrado com sucesso!", "sucesso", function() {
                                if (typeof carregarMembros === 'function') carregarMembros();
                            });
                        }
                        form.reset();
                        form.classList.remove('was-validated');
                        const camposValidados = form.querySelectorAll('.is-invalid, .is-valid');
                        camposValidados.forEach(campo => {
                            campo.classList.remove('is-invalid', 'is-valid');
                        });
                    } else {
                        throw new Error("Erro ao reset membro");
                    }
                })
                .catch(error => {
                    console.error(error);
                    const errorModalEl = document.getElementById('messageError');
                    if (errorModalEl) {
                        const errorModal = new bootstrap.Modal(errorModalEl);
                        errorModal.show();
                    } else {
                        mostrarModalAlerta("Erro no Cadastro", "Ocorreu um erro: " + error.message, "erro");
                    }
                });
        })
        .catch(error => console.error("Erro ao verificar membros existentes:", error));
}

function mostrarCargos() {
    const printarCadastro = document.getElementById("cargo");
    const printarEdicao = document.getElementById("editCargo");

    fetch("/cargos/get-cargos?keyword=")
        .then(resposta => { return resposta.json(); })
        .then(dados => {
            let comboboxHtmlCad = `
                <label for="cargoId" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Cargo / Nível <span class="text-danger">*</span></label>
                <div class="input-group input-group-lg shadow-sm has-validation">
                    <span class="input-group-text bg-light border-end-0 text-taiko-red"><i class="bi bi-award-fill"></i></span>
                    <select class="form-select border-start-0 ps-0 fw-medium bg-light" id="cargoId" name="cargoId" required>
                        <option value selected disabled>Selecione um nível...</option>
            `;
            for (let cargo of dados) {
                comboboxHtmlCad += `<option value="${cargo.id}">${cargo.nome}</option>`;
            }
            comboboxHtmlCad += `</select><div class="invalid-feedback">Informe o cargo.</div></div>`;

            // HTML para o modal de edição
            let comboboxHtmlEdit = `
                <label for="editCargoId" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Cargo / Nível <span class="text-danger">*</span></label>
                <div class="input-group input-group-lg shadow-sm has-validation">
                    <span class="input-group-text bg-light border-end-0 text-taiko-red"><i class="bi bi-award-fill"></i></span>
                    <select class="form-select border-start-0 ps-0 fw-medium bg-light" id="editCargoId" name="editCargoId" required>
                        <option value selected disabled>Selecione um nível...</option>
            `;
            for (let cargo of dados) {
                comboboxHtmlEdit += `<option value="${cargo.id}">${cargo.nome}</option>`;
            }
            comboboxHtmlEdit += `</select><div class="invalid-feedback">Informe o cargo.</div></div>`;

            if (printarCadastro) printarCadastro.innerHTML = comboboxHtmlCad;
            if (printarEdicao) printarEdicao.innerHTML = comboboxHtmlEdit;
        })
        .catch(erro => { console.error(erro); });
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

                    // Joga o foco para o número
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


function mascaraCPF(input) {
    let valor = input.value.replace(/\D/g, "");
    valor = valor.replace(/^(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");

    valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{2})$/, "$1.$2.$3-$4");

    input.value = valor;
}


function mascaraNumero(input) {
    input.value = input.value.replace(/\D/g, '');
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


function validarFormulario() {
    let formValido = true;

    // Adicionei o "cargoId" aqui na lista!
    const camposObrigatorios = [
        "nomeMembro",
        "cpf",
        "dtNascimento",
        "sexo",
        "experiencia",
        "cargoId", // <--- AQUI ESTÁ A CORREÇÃO
        "cep",
        "estado",
        "cidade",
        "rua",
        "numero",
        "bairro"
    ];

    camposObrigatorios.forEach(id => {
        const campo = document.getElementById(id);

        if (campo) {
            if (!campo.value || campo.value.trim() === "") {
                campo.classList.add("is-invalid"); // Pinta de vermelho
                formValido = false; // Avisa que o formulário está quebrado
            } else {
                campo.classList.remove("is-invalid");
            }
        }
    });

    // ... (o resto da sua função de validar a idade continua igualzinho)
    const inputData = document.getElementById("dtNascimento");
    if (inputData && inputData.value) {
        const temIdade = verificarIdadeMinima(inputData.value);
        if (!temIdade) {
            inputData.classList.add("is-invalid");

            const feedbackIdade = inputData.nextElementSibling;
            if (feedbackIdade) {
                feedbackIdade.textContent = "O membro precisa ter no mínimo 5 anos.";
            }
            formValido = false;
        } else {
            const feedbackIdade = inputData.nextElementSibling;
            if (feedbackIdade) {
                feedbackIdade.textContent = "Informe a data de nascimento.";
            }
        }
    }

    const inputExperiencia = document.getElementById("experiencia");
    if (inputExperiencia && inputExperiencia.value) {
        if (parseFloat(inputExperiencia.value) < 0) {
            inputExperiencia.classList.add("is-invalid");
            const feedbackExp = inputExperiencia.nextElementSibling;
            if (feedbackExp) {
                feedbackExp.textContent = "A experiência não pode ser negativa.";
            }
            formValido = false;
        } else {
            const feedbackExp = inputExperiencia.nextElementSibling;
            if (feedbackExp) {
                feedbackExp.textContent = "Informe a experiência.";
            }
        }
    }

    return formValido;
}