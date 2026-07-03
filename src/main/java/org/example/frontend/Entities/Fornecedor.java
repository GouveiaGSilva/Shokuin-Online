package org.example.frontend.Entities;

import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Fornecedor {

    private int id;
    private String nome;
    private String cnpj;
    private String endereco;

    public Fornecedor(String nome, String cnpj) {
        this(0, nome, cnpj, "");
    }

    public Fornecedor(int id, String nome, String cnpj, String endereco) {
        this.id = id;
        this.nome = nome;
        this.cnpj = cnpj;
        this.endereco = endereco;
    }

    public Fornecedor(String nome, String cnpj, String endereco) {
        this(0, nome, cnpj, endereco);
    }

    public Fornecedor() {
        this(0, "", "", null);
    }

    public boolean validaId() {
        String sql = "select count(*) as quant from fornecedores where forne_id = " + id;
        Conexao con = SingletonDB.getConexao();
        ResultSet rs = con.consultar(sql);
        int quant;
        try {
            rs.next();
            quant = rs.getInt("quant");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        if (quant <= 0) {
            return false;
        }
        return true;
    }

    public boolean cadastrarFornecedor() {
        String sql = " INSERT INTO fornecedores(forne_nome, forne_cnpj, forne_endereco) VALUES ('#1', '#2', '#3') ";
        sql = sql.replace("#1", getNome());
        sql = sql.replace("#2", getCnpj());
        sql = sql.replace("#3", getEndereco());
        return SingletonDB.getConexao().manipular(sql);
    }

    public List<Fornecedor> listarFornecedores(String keyword) {
        List<Fornecedor> lista = new ArrayList<>();
        String sql = "SELECT * FROM Fornecedores";
        if (!keyword.isBlank()) {
            sql += " WHERE LOWER(forne_nome) LIKE LOWER('%" + keyword + "%') OR LOWER(forne_cnpj) LIKE LOWER('%" + keyword + "%') OR LOWER(forne_endereco) LIKE LOWER('%" + keyword + "%')";
        }
        sql += " ORDER BY forne_cnpj ASC";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                lista.add(new Fornecedor(rs.getInt("forne_id"), rs.getString("forne_nome"), rs.getString("forne_cnpj"), rs.getString("forne_endereco")));
            }
            return lista;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean excluirById(int id) {
        String sql = "DELETE FROM fornecedores WHERE forne_id = " + id;
        return SingletonDB.getConexao().manipular(sql);
    }

    public Fornecedor getById(int id) {
        String sql = "SELECT * FROM Fornecedores WHERE forne_id = " + id;
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            if (rs.next()) {
                return new Fornecedor(rs.getInt("forne_id"), rs.getString("forne_nome"), rs.getString("forne_cnpj"), rs.getString("forne_endereco"));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public boolean atualizar() {
        String sql = "UPDATE Fornecedores SET forne_nome = '#1', forne_cnpj = '#2', forne_endereco = '#3'";
        sql += " WHERE forne_id = " + getId();
        sql = sql.replace("#1", getNome());
        sql = sql.replace("#2", getCnpj());
        sql = sql.replace("#3", getEndereco());
        return SingletonDB.getConexao().manipular(sql);
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

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }
}
