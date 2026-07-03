package org.example.frontend.Entities;

import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Estoque {
    private int id;
    Instrumentos instrumento;
    private int quantidade;

    public Estoque() {
    }

    public Estoque(int id, Instrumentos instrumento, int quantidade) {
        this.id = id;
        this.instrumento = instrumento;
        this.quantidade = quantidade;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Instrumentos getInstrumento() {
        return instrumento;
    }

    public void setInstrumento(Instrumentos instrumento) {
        this.instrumento = instrumento;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public boolean validaQuant(){
        Conexao con = SingletonDB.getConexao();
        String sql = "select est_quant from estoque where instru_id = "+instrumento.getId();
        ResultSet rs = con.consultar(sql);
        int quant;
        try {
            rs.next();
            quant = rs.getInt("est_quant");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        if(quantidade > quant)
            return false;
        return true;
    }

    private boolean validaIdInstrumento(){
        String sql = "select count(*) as quant from instrumentos where instru_id = "+instrumento.getId();
        Conexao con = SingletonDB.getConexao();
        ResultSet rs = con.consultar(sql);
        int quant;
        try {
            rs.next();
            quant = rs.getInt("quant");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        if(quant <=0)
            return false;
        return true;
    }

    public boolean entrarEstoque(){
        if(validaIdInstrumento()) {
            String sql = "update estoque set est_quant = est_quant + " + quantidade + " where instru_id = " + instrumento.getId();
            return SingletonDB.getConexao().manipular(sql);
        }
        return false;
    }

    public Estoque getEstoqueById(int id) {
        Estoque estoque = null;
        String sql ="";
        if(id > 0){
            sql = " select * from estoque where instru_id = "+id;
        }
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try{
            if(rs != null && rs.next()){
                Instrumentos i = new Instrumentos(id);
                estoque = (new Estoque (rs.getInt("est_id"),i,rs.getInt("est_quant")));
            }
            return estoque;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @JsonIgnore
    public List<Estoque> getAll() {
        List<Estoque> estoque = new ArrayList<>();
        String sql = " SELECT * FROM estoque";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try{
            while(rs != null && rs.next()){
                Instrumentos i = new Instrumentos(rs.getInt("instru_id"));
                estoque.add(new Estoque (rs.getInt("est_id"),i,rs.getInt("est_quant")));
            }
            return estoque;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean retirarEstoque(){
        String sql = "UPDATE estoque SET est_quant = est_quant - " + quantidade +" WHERE instru_id = " + instrumento.getId();
        Conexao con = SingletonDB.getConexao();
        if(validaIdInstrumento()){
            return con.manipular(sql);
        }
        return false;
    }

    public List<Estoque> listarEstoque(String chave) {
        List<Estoque> lista = new ArrayList<>();
        String sql = "SELECT i.instru_id, fornecedores.forne_nome ,fornecedores.forne_id, i.instru_nome, i.instru_img, COALESCE(e.est_quant, 0) as est_quant FROM instrumentos i join fornecedores on i.forne_id = fornecedores.forne_id LEFT JOIN estoque e on e.instru_id = i.instru_id WHERE i.instru_ativo = TRUE";
        if (!chave.isBlank()) {
            sql += " AND LOWER(i.instru_nome) LIKE LOWER('%" + chave + "%')";
        }
        sql += " ORDER BY i.instru_nome ASC";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                Instrumentos i = (new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f));
                Estoque e = new Estoque();
                e.setQuantidade(rs.getInt("est_quant"));
                e.setInstrumento(i);
                lista.add(e);
            }
            if (lista.isEmpty()) {
                return null;
            }
            return lista;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Estoque> listarAll() {
        List<Estoque> lista = new ArrayList<>();
        String sql = "SELECT i.instru_id, fornecedores.forne_nome ,fornecedores.forne_id, i.instru_nome, i.instru_img, e.est_quant FROM instrumentos i join fornecedores on i.forne_id = fornecedores.forne_id LEFT JOIN estoque e on e.instru_id = i.instru_id WHERE i.instru_ativo = TRUE ORDER BY i.instru_nome ASC";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                Instrumentos i = new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f);
                Estoque e = new Estoque();
                e.setQuantidade(rs.getInt("est_quant"));
                e.setInstrumento(i);
                lista.add(e);
            }
            if (lista.isEmpty()) {
                return null;
            }
            return lista;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}