document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();

    const usuario = document.getElementById('username').value;
    const senha = document.getElementById('password').value;
    const alerta = document.getElementById('alerta-erro');
    const mensagem = document.getElementById('erro-mensagem');
    alerta.classList.add('d-none');

    try {
        const url = `http://localhost:8080/apiautenticacao/login?usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`;
        const response = await fetch(url, {
            method: 'POST'
        });
        if (response.ok) {
            const loginAceito = await response.json();
            if (loginAceito === true) {
                window.location.href = "index.html";
            } else {
                mensagem.innerText = "Acesso negado. Usuário ou senha inválidos.";
                alerta.classList.remove('d-none');
            }
        } else {
            const erroTexto = await response.text();
            mensagem.innerText = "Erro ao processar login: " + erroTexto;
            alerta.classList.remove('d-none');
        }
    } catch (error) {
        console.error("Erro ao conectar na API de autenticação:", error);
        mensagem.innerText = "Falha na comunicação com o servidor.";
        alerta.classList.remove('d-none');
    }
});