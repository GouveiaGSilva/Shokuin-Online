package org.example.frontend.Entities;

public class Misto {
    private Fornecedor fornecedor;
    private Endereco endereco;

    public Misto(Fornecedor fornecedor, Endereco endereco) {
        this.fornecedor = fornecedor;
        this.endereco = endereco;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public Endereco getEndereco() {
        return endereco;
    }
}
