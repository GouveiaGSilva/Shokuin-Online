package org.example.frontend.Entities;

import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Repertorio {
    private int idApresentacao;
    private List<Musica> listaMusica;
    private List<Formacao> listaFormacao;

    public Repertorio(int idApresentacao){
        this.idApresentacao = idApresentacao;
        this.listaMusica = new ArrayList<Musica>();
        this.listaFormacao = new ArrayList<Formacao>();
    }

    public Repertorio() {
        this(0, new ArrayList<>(), new ArrayList<>());
    }

    public Repertorio(int idApresentacao, List<Musica> idMusica, List<Formacao> idFormacao) {
        this.idApresentacao = idApresentacao;
        this.listaMusica = idMusica;
        this.listaFormacao = idFormacao;
    }

    public int getIdApresentacao() {
        return idApresentacao;
    }

    public void setIdApresentacao(int idApresentacao) {
        this.idApresentacao = idApresentacao;
    }

    public List<Musica> getListaMusica() {
        return listaMusica;
    }

    public void setListaMusica(List<Musica> listaMusica) {
        this.listaMusica = listaMusica;
    }

    public List<Formacao> getListaFormacao() {
        return listaFormacao;
    }

    public void setListaFormacao(List<Formacao> listaFormacao) {
        this.listaFormacao = listaFormacao;
    }

    public boolean gravar(){
        String sql = "";
        for(int i = 0; i < listaMusica.size(); i++){
            Musica musica = listaMusica.get(i);
            Formacao formacao = listaFormacao.get(i);
            sql += "INSERT INTO listamusicas(musi_id, aprese_id, forma_id) VALUES (#1,#2,#3);\n";
            sql = sql.replace("#1", ""+musica.getId());
            sql = sql.replace("#2", ""+idApresentacao);
            sql = sql.replace("#3", ""+formacao.getId());
        }
        return SingletonDB.getConexao().manipular(sql);
    }

    @JsonIgnore
    public boolean getById(){
        String sql = "SELECT lm.aprese_id, lm.musi_id, lm.forma_id, f.forma_nome, f.forma_img, m.musi_nome, m.musi_duracao, m.musi_compositor " +
                "FROM listamusicas lm " +
                "JOIN musicas m ON lm.musi_id=m.musi_id " +
                "JOIN FORMACAO f ON f.forma_id=lm.forma_id " +
                "WHERE lm.aprese_id=" + idApresentacao;
        try {
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while(rs != null && rs.next()){
                listaMusica.add(new Musica(rs.getInt("musi_id"), rs.getString("musi_nome"), rs.getString("musi_compositor"), rs.getString("musi_duracao")));
                Formacao f = new Formacao(rs.getInt("forma_id"), rs.getString("forma_nome"));
                f.setImagem(rs.getString("forma_img"));
                listaFormacao.add(f);
            }
            return true;
        } catch (Exception e) {
            System.out.println("Erro ao consultar: " + e.getMessage());
            return false;
        }
    }

    public boolean getApresentacao(int id){
        String sql = "SELECT a.aprese_id FROM listamusicas lm JOIN apresentacao a ON lm.aprese_id = "+id+" AND a.aprese_id = "+id;
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            if(rs.next())
                return true;
        } catch (Exception e) {
            System.out.println("Erro ao consultar: " + e.getMessage());
        }
        return false;
    }


    public boolean deletar(){
        String sql = "DELETE FROM listamusicas WHERE aprese_id = "+idApresentacao;
        return SingletonDB.getConexao().manipular(sql);
    }
}
