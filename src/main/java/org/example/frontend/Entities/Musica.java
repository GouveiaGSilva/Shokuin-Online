package org.example.frontend.Entities;

import java.util.Objects;

public class Musica {
    int id;
    String nome;
    String compositor;
    String duracao;

    public Musica() {
    }

    public Musica(int id) {
        this.id = id;
    }


    public Musica(int id, String nome) {
        this.id = id;
        this.nome = nome;
        this.compositor ="";
        this.duracao = "";
    }

    public Musica(String nome, String compositor, String duracao) {
        this.nome = nome;
        this.compositor = compositor;
        this.duracao = duracao;
    }

    public Musica(int id, String nome, String compositor, String duracao) {
        this.id = id;
        this.nome = nome;
        this.compositor = compositor;
        this.duracao = duracao;
    }

    public String getNome() {
        return nome;
    }

    public String getCompositor() {
        return compositor;
    }

    public String getDuracao() {
        return duracao;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCompositor(String compositor) {
        this.compositor = compositor;
    }

    public void setDuracao(String duracao) {
        this.duracao = duracao;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Musica musica = (Musica) o;
        return id == musica.id && Objects.equals(nome, musica.nome) && Objects.equals(compositor, musica.compositor) && Objects.equals(duracao, musica.duracao);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nome, compositor, duracao);
    }

}
