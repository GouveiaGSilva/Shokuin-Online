package org.example.frontend.Entities;

import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.sql.SQLException;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Usuario {
    private int id;
    private String nome;
    private String senha;
    private Membro membro;
    private int usu_nivel;

    public Usuario(String nome) {
        this.nome = nome;
    }

    public Usuario(String nome, String senha) {
        this.nome = nome;
        this.senha = senha;
    }

    public Usuario(int id, String nome, String senha, Membro membro, int usu_nivel) {
        this.id = id;
        this.nome = nome;
        this.senha = senha;
        this.membro = membro;
        this.usu_nivel = usu_nivel;
    }

    public Usuario() {
    }

    public int getUsu_nivel() {
        return usu_nivel;
    }

    public void setUsu_nivel(int usu_nivel) {
        this.usu_nivel = usu_nivel;
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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Membro getMembro() {
        return membro;
    }

    public void setMembro(Membro membro) {
        this.membro = membro;
    }

    public boolean validarDados() {
        Conexao con = SingletonDB.getConexao();
        String sql = "select * from usuario where usu_nome = '"+nome+"' and usu_senha = '"+senha+"'";
        ResultSet rs = con.consultar(sql);
        try {
            if(rs!=null && rs.next()) {
                if (rs.getString("usu_nome").equals(nome) && rs.getString("usu_senha").equals(senha))
                    return true;
            }
            return false;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Usuario fazerLogin() {
        Conexao con = SingletonDB.getConexao();
        String sql = "select * from usuario where usu_nome = '"+nome+"' and usu_senha = '"+senha+"'";
        ResultSet rs = con.consultar(sql);
        try {
            if(rs!=null && rs.next()) {
                if (rs.getString("usu_nome").equals(nome) && rs.getString("usu_senha").equals(senha)) {
                    Usuario u = new Usuario();
                    u.setId(rs.getInt("usu_id"));
                    u.setNome(rs.getString("usu_nome"));
                    u.setUsu_nivel(rs.getInt("usu_nivel"));
                    return u;
                }
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean cadastrarusuario() {
        Conexao con = SingletonDB.getConexao();
        // default para 1 caso venha 0
        int nivel = usu_nivel > 0 ? usu_nivel : 1;
        String sql = "insert into usuario (usu_nome, usu_senha, membro_id, usu_nivel) values ('"+nome+"', '"+senha+"', "+membro.getId()+", "+nivel+")";
        try {
            return con.manipular(sql);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @JsonIgnore
    public Membro getIdMembro() {
        Membro m = new Membro();
        Conexao con = SingletonDB.getConexao();
        String sql = "select membro_id from usuario where usu_nome = '"+nome+"'";
        ResultSet rs = con.consultar(sql);
        try {
            if(rs != null && rs.next()){
                m.setId(rs.getInt("membro_id"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return m;
    }

    public boolean existeUsuario() {
        Conexao con = SingletonDB.getConexao();
        String sql = "select count(*) as quant from usuario where usu_nome = '"+nome+"'";
        ResultSet rs = con.consultar(sql);
        try {
            if(rs!=null && rs.next()) {
                int quant = rs.getInt("quant");
                if(quant == 0)
                    return false;
            }
            return true;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean existeCadstroMembro() {
        Conexao con = SingletonDB.getConexao();
        String sql = "select count(*) as quant from usuario where membro_id = " + membro.getId();
        ResultSet rs = con.consultar(sql);
        try {
            if(rs!=null && rs.next()) {
                int quant = rs.getInt("quant");
                if(quant == 0)
                    return false;
            }
            return true;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}