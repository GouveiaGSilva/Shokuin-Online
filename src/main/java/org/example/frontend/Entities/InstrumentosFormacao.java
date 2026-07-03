package org.example.frontend.Entities;

public class InstrumentosFormacao {

    private Instrumentos instrumento;
    private Formacao formacao;
    private int quantidade;

    public InstrumentosFormacao(Instrumentos instrumento, Formacao formacao, int quantidade) {
        this.instrumento = instrumento;
        this.formacao = formacao;
        this.quantidade = quantidade;
    }

    public InstrumentosFormacao() {
    }

    public Instrumentos getInstrumento() {
        return instrumento;
    }

    public void setInstrumento(Instrumentos instrumento) {
        this.instrumento = instrumento;
    }

    public Formacao getFormacao() {
        return formacao;
    }

    public void setFormacao(Formacao formacao) {
        this.formacao = formacao;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public void setId(int id) {
        if (this.instrumento == null) {
            this.instrumento = new Instrumentos();
        }
        this.instrumento.setId(id);
    }
}
