package org.example.frontend.Entities;
import org.example.frontend.util.SingletonDB;

import javax.print.Doc;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class DocTxt {
    private int id;
    private String nome;
    private String conteudo;
    private Apresentacao apresentacao;

    public DocTxt(int id, String nome, String conteudo, Apresentacao apresentacao) {
        this.id = id;
        this.nome = nome;
        this.conteudo = conteudo;
        this.apresentacao = apresentacao;
    }

    public DocTxt(String nome, String conteudo, Apresentacao apresentacao) {
        this(0, nome, conteudo, apresentacao);
    }

    public DocTxt(int id, String nome, String conteudo) {
       this(id, nome, conteudo, new Apresentacao());
    }

    public DocTxt() {
        this(0, "", "", new Apresentacao());
    }

    public boolean gravar(){
        String sql = "INSERT INTO docTxt (doc_nome, doc_conteudo, aprese_id) VALUES ('#1', '#2', #3)";
        sql = sql.replace("#1", nome);
        sql = sql.replace("#2", conteudo);
        sql = sql.replace("#3", ""+apresentacao.getId());
        return SingletonDB.getConexao().manipular(sql);
    }

    public boolean atualizar(){
        String sql = "UPDATE docTxt SET doc_nome = '#1', doc_conteudo = '#2' WHERE aprese_id = "+apresentacao.getId();
        sql = sql.replace("#1", nome);
        sql = sql.replace("#2", conteudo);
        return SingletonDB.getConexao().manipular(sql);
    }

    public boolean deletar(int id){
        String sql = "DELETE FROM docTxt WHERE aprese_id = "+id;
        return SingletonDB.getConexao().manipular(sql);
    }

    @JsonIgnore
    public DocTxt getByIdApresentacao(){
        String sql = "SELECT * FROM docTxt WHERE aprese_id = "+apresentacao.getId();
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            if(rs.next())
                return new DocTxt(rs.getInt("doc_id"), rs.getString("doc_nome"), rs.getString("doc_conteudo"));
        } catch (Exception e) {
        }
        return null;
    }

    @JsonIgnore
    public List<DocTxt> getAll(){
        String sql = "SELECT * FROM docTxt";
        List<DocTxt> docTxtList = new ArrayList<>();
        Apresentacao ap = new Apresentacao();
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while(rs.next())
                docTxtList.add(new DocTxt(rs.getInt("doc_id"), rs.getString("doc_nome"), rs.getString("doc_conteudo"),
                        apresentacao = ap.getById(rs.getInt("aprese_id"))));
        } catch (Exception e){}
        return docTxtList;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public Apresentacao getApresentacao() {
        return apresentacao;
    }

    public void setApresentacao(Apresentacao apresentacao) {
        this.apresentacao = apresentacao;
    }
}