const form = document.getElementById('formCadastroUsuario');
const urlBackend = "/";

if (form) {
    form.onsubmit = submeterFormulario;
}

function submeterFormulario(event) {
    event.preventDefault();
    form.classList.add('was-validated');

    if (form.checkValidity()) {
        cadastrarUsuario();
    }
}

function cadastrarUsuario() {
    removeMensagem();

    const formData = new FormData(form);

    fetch(urlBackend + "apiusuario/cadusuario", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.text();
        })
        .then(dados => {
            exibirMensagem(true, "Usuário cadastrado com sucesso e vinculado ao membro!");
            form.reset();
            form.classList.remove('was-validated');
        })
        .catch(error => {
            console.error("Erro no cadastro:", error);
            exibirMensagem(false, error.message || "Erro ao processar o cadastro.");
        });
}

function exibirMensagem(sucesso, texto) {
    let container = document.getElementById('containerMensagem');
    container.innerHTML = ''; // Limpa mensagens anteriores

    let div = document.createElement('div');
    div.role = "alert";

    let elementoIcone;
    if (sucesso) {
        div.className = "alert alert-success d-flex align-items-center mb-4 shadow-sm rounded-3";
        elementoIcone = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img"><use xlink:href="#check-circle-fill"/></svg>`;
    } else {
        div.className = "alert alert-danger d-flex align-items-center mb-4 shadow-sm rounded-3";
        elementoIcone = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img"><use xlink:href="#exclamation-triangle-fill"/></svg>`;
    }

    div.innerHTML = `${elementoIcone} <div class="fw-semibold small">${texto}</div>`;
    container.appendChild(div);

    if (sucesso) {
        setTimeout(() => { removeMensagem(); }, 5000);
    }
}

function removeMensagem() {
    let container = document.getElementById('containerMensagem');
    if (container) {
        container.innerHTML = '';
    }
}