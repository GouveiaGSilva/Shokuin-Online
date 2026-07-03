package org.example.frontend.Entities;

import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Apresentacao {
    private int id;
    private String nome;
    private char agen_status;
    private char status;
    private List<Musica> listaMusica = new ArrayList<>();
    private List<Membro> listaMembro = new ArrayList<>();

    public Apresentacao(int id, String nome, char agen_status, char status, List<Musica> listaMusica, List<Membro> listaMembro) {
        this.id = id;
        this.nome = nome;
        this.agen_status = agen_status;
        this.status = status;
        this.listaMusica = listaMusica;
        this.listaMembro = listaMembro;
    }

    public Apresentacao(String nome) {
        this(0, nome, ' ', ' ', null, null);
    }

    public Apresentacao(int id, String nome, char agen_status, char status) {
        this(id, nome, agen_status, status, null, null);
    }

    public Apresentacao(int id) {
        this(id, "", ' ', ' ', null, null);
    }

    public Apresentacao() {
        this(0, "", ' ', ' ', null, null);
    }

    public boolean gravar(){
        String sql = "INSERT INTO apresentacao (aprese_nome) VALUES ('#1')";
        sql = sql.replace("#1", nome);
        return SingletonDB.getConexao().manipular(sql);
    }

    public boolean atualizar(int id){
        String sql = "UPDATE apresentacao SET aprese_nome = '#1' WHERE aprese_id = "+id;
        sql = sql.replace("#1", nome);
        return SingletonDB.getConexao().manipular(sql);
    }

    public boolean deletar(int id){
        String sql = "DELETE FROM apresentacao WHERE aprese_id = "+id;
        return SingletonDB.getConexao().manipular(sql);
    }

    @JsonIgnore
    public List<Apresentacao> getAll(){
        List<Apresentacao> listaA = new ArrayList<>();
        String sql = "select * from apresentacao ORDER BY aprese_nome";
        try {
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while (rs!=null && rs.next()){
                Apresentacao A = new Apresentacao(rs.getInt("aprese_id"), rs.getString("aprese_nome"), rs.getString("agen_status").charAt(0), rs.getString("aprese_status").charAt(0), null, null);
                listaA.add(A);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return listaA;
    }

    @JsonIgnore
    public List<Apresentacao> getAllSemAgenda(){
        List<Apresentacao> listaA = new ArrayList<>();
        String sql = "select * from apresentacao where agen_status = 'N' ORDER BY aprese_nome";
        try {
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while (rs!=null && rs.next()){
                Apresentacao A = new Apresentacao(rs.getInt("aprese_id"), rs.getString("aprese_nome"), rs.getString("agen_status").charAt(0), rs.getString("aprese_status").charAt(0), null, null);
                listaA.add(A);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return listaA;
    }

    public List<Membro> getMembrosVinculados(){
        int idApresentacao = id;
        List<Membro> membros = new ArrayList<>();
        String sql = "SELECT m.membro_id, m.membro_nome FROM membros_apresentacao ma JOIN membros m ON ma.aprese_id = "+idApresentacao+" AND ma.membro_id = m.membro_id";
        try {
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while (rs != null && rs.next()) {
                membros.add(new Membro(rs.getInt("membro_id"), rs.getString("membro_nome")));
            }
        } catch (SQLException e) {
            System.out.println("Erro ao buscar membros da apresentação: " + e.getMessage());
        }
        return membros;
    }


    public Apresentacao getById(int id){
        String sql = "SELECT * FROM apresentacao WHERE aprese_id = "+id;
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            if(rs.next())
                return new Apresentacao(rs.getInt("aprese_id"), rs.getString("aprese_nome"), rs.getString("agen_status").charAt(0), rs.getString("aprese_status").charAt(0), null, null);
        } catch (Exception e) {
            System.out.println(SingletonDB.getConexao().getMensagemErro());
        }
        return null;
    }

    public Apresentacao getByNome(String nome){
        String sql = "SELECT * FROM apresentacao WHERE aprese_nome = '"+nome+"'";
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            if(rs.next())
                return new Apresentacao(rs.getInt("aprese_id"), rs.getString("aprese_nome"), rs.getString("agen_status").charAt(0), rs.getString("aprese_status").charAt(0), null, null);
        }catch (Exception e){
            System.out.println(SingletonDB.getConexao().getMensagemErro());
        }
        return null;
    }

    public boolean atualizarStatus(char s){
        String sql = "update apresentacao set agen_status = '"+s+"' where aprese_id = "+id;
        return SingletonDB.getConexao().manipular(sql);
    }

    @JsonIgnore
    public List<Apresentacao> getAllTerminouData(){
        List<Apresentacao> list = new ArrayList<>();
        String sql = "select * from agenda as ag join apresentacao as ap on ag.aprese_id = ap.aprese_id where agenda_data <= current_date and TO_CHAR(agenda_horario, 'HH24:MI:SS') < TO_CHAR(LOCALTIME, 'HH24:MI:SS') and agen_status = 'A'";
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while(rs != null && rs.next()){
                Apresentacao ap = new Apresentacao();
                ap.setId(rs.getInt("aprese_id"));
                list.add(ap);
            }

        }catch (SQLException e) {
            list = null;
            throw new RuntimeException(e);
        }
        return list;
    }

    public List<Integer> getMembrosVinculados(int idApresentacao) {
        List<Integer> membros = new ArrayList<>();
        String sql = "SELECT membro_id FROM membros_apresentacao WHERE aprese_id = " + idApresentacao;
        try {
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while (rs != null && rs.next()) {
                membros.add(rs.getInt("membro_id"));
            }
        } catch (SQLException e) {
            System.out.println("Erro ao buscar membros da apresentação: " + e.getMessage());
        }
        return membros;
    }

    public boolean salvarMembrosVinculados(int idApresentacao, List<Integer> membrosIds) {
        // Primeiro deleta todos os vínculos atuais para evitar duplicidade ou manter lixo
        String sqlDelete = "DELETE FROM membros_apresentacao WHERE aprese_id = " + idApresentacao;
        SingletonDB.getConexao().manipular(sqlDelete);
        
        // Em seguida reinsere os selecionados
        if (membrosIds != null && !membrosIds.isEmpty()) {
            for (Integer membroId : membrosIds) {
                String sqlInsert = "INSERT INTO membros_apresentacao (aprese_id, membro_id) VALUES (" 
                    + idApresentacao + ", " + membroId + ")";
                if (!SingletonDB.getConexao().manipular(sqlInsert)) {
                    return false; // falhou em inserir algum membro
                }
            }
        }
        return true;
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

    public char getAgen_status() {
        return agen_status;
    }

    public void setAgen_status(char agen_status) {
        this.agen_status = agen_status;
    }

    public char getStatus() {
        return status;
    }

    public void setStatus(char status) {
        this.status = status;
    }

    public List<Musica> getListaMusica() {
        return listaMusica;
    }

    public void setListaMusica(List<Musica> listaMusica) {
        this.listaMusica = listaMusica;
    }

    public List<Membro> getListaMembro() {
        return listaMembro;
    }

    public void setListaMembro(List<Membro> listaMembro) {
        this.listaMembro = listaMembro;
    }
}