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

function mascaraNumero(input) {
    input.value = input.value.replace(/\D/g, '');
}

function finalizarCadastro() {
    window.location.href = "listarApresentacao.html";
}

function cadastrarAgenda() {
    event.preventDefault();
    const idApresentacao = localStorage.getItem('id');
    const data = document.getElementById('data').value;
    let horario = document.getElementById('horario').value;
    const cep = document.getElementById("cep").value;
    const estado = document.getElementById("estado").value;
    const numero = document.getElementById("numero").value;
    const cidade = document.getElementById("cidade").value;
    const bairro = document.getElementById("bairro").value;
    const complemento = document.getElementById("complemento").value;
    const rua = document.getElementById("rua").value;

    if (!data || !horario || !cep || !estado || !numero || !cidade || !bairro) {
        alert("Preencha todos os campos!");
        return;
    }

    if (horario.length === 5) { // HH:MM
        horario += ":00";
    }
    const params = new URLSearchParams();

    params.append('data', data);
    params.append('horario',horario);
    params.append('cep', cep);
    params.append('estado', estado);
    params.append('cidade', cidade);
    params.append('rua', rua);
    params.append('numero', numero);
    params.append('bairro', bairro);
    params.append('complemento', complemento);
    params.append('idApresentacao', idApresentacao);

    fetch("/apiagenda/cadagenda", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    })
    .then(async response => {
        const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
        const p = document.getElementById("msg");
        const span = document.getElementById("subtitulo");
        if (response.ok) {
            localStorage.clear();
            span.innerText = "Sucesso";
            p.innerText = "Agenda cadastrada com sucesso";
            modal.show();
        } else {
            const erroObjeto = await response.json();
            let msg = erroObjeto.erro;

            if (msg.includes("Onde:")) {
                msg = msg.split("Onde:")[0];
            }
            msg = msg.replace("ERROR:", "").trim();
            span.innerText = "Erro";
            p.innerText = "Erro: "+ erroObjeto.mensagem +"\n"+ msg;
            modal.show();
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro de conexão.");
    });
}