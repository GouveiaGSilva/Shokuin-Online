package org.example.frontend.Entities;

import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Cargo {
    private int id;
    private String nome;
    private String funcao;

    public Cargo() {
        this.nome = "";
        this.funcao = "";
        this.id = -1;
    }

    public Cargo(String nome, String funcao) {
        this.nome = nome;
        this.funcao = funcao;
        this.id = -1;
    }

    public Cargo(int id, String nome, String funcao) {
        this.id = id;
        this.nome = nome;
        this.funcao = funcao;
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

    public String getFuncao() {
        return funcao;
    }

    public void setFuncao(String funcao) {
        this.funcao = funcao;
    }

    public boolean cadastrarCargo(){
        String sql;
        sql = "INSERT INTO cargos (cargo_nome, cargo_funcao) VALUES ('"+nome+"', '"+funcao+"')";
        if(nome.isBlank() && funcao.isBlank())
            return false;
        else if(!SingletonDB.getConexao().manipular(sql))
            return false;
        return true;
    }

    public boolean atualizarCargo(){
        String sql = "";
        if(!nome.isBlank() && !funcao.isBlank())
            sql = "UPDATE cargos SET cargo_nome = '"+nome+"', cargo_funcao = '"+funcao+"' WHERE cargo_id = "+id;
        else
            return false;
        if(!SingletonDB.getConexao().manipular(sql))
            return false;
        return true;
    }

    public List<Cargo> listarCargos(String keyword) {
        List<Cargo> lista = new ArrayList<>();
        String sql = "SELECT * FROM cargos";
        if(!keyword.isBlank()){
            sql+=" WHERE LOWER(cargo_nome) LIKE LOWER('%"+keyword+"%')";
        }
        sql += " ORDER BY cargo_nome ASC";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try{
            while(rs != null && rs.next()){
                lista.add(new Cargo(rs.getInt("cargo_id"), rs.getString("cargo_nome"), rs.getString("cargo_funcao")));
            }
            if(lista.isEmpty())
                return null;
            return lista;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Cargo getCargoById(int id){
        Cargo c = new Cargo();
        String sql = "SELECT * FROM cargos WHERE cargo_id = "+id;
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try{
            if(rs != null && rs.next()){
                c.setId(rs.getInt("cargo_id"));
                c.setNome(rs.getString("cargo_nome"));
                c.setFuncao(rs.getString("cargo_funcao"));
            }
            else
                c = null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return c;
    }

    public boolean deletarCargo(){
        String sql = "DELETE FROM cargos WHERE cargo_id = "+id;
        if(this.id == -1)
            return false;
        else if(SingletonDB.getConexao().manipular(sql))
            return true;
        return false;
    }

    public String getNomeCargoByMembroId(int id) {
        Conexao con = SingletonDB.getConexao();
        String sql = "select cargo_nome from cargos natural join membros where membro_id = "+id;
        ResultSet rs = con.consultar(sql);
        String nome = "";
        try {
            if(rs != null && rs.next()){
                nome = rs.getString("cargo_nome");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return nome;
    }
}
