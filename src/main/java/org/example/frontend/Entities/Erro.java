package org.example.frontend.Entities;

public class Erro {
    private String mensagem;
    private String erro;

    public Erro(String mensagem, String erro) {
        this.mensagem = mensagem;
        this.erro = erro;
    }

    public String getMensagem() { return mensagem; }
    public String getErro() { return erro; }
}
