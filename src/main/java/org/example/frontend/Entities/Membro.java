package org.example.frontend.Entities;
import org.example.frontend.util.Conexao;
import org.example.frontend.Entities.Cargo;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Membro {
    private int id;
    private String nome;
    private String cpf;
    private String dtNascimento;
    private char sexo;
    private String endereco;
    private int cargo;
    private int experiencia;

    public Membro() {
    }

    public Membro(String nome, String cpf, String dtNascimento, char sexo, String endereco, int cargo,
                  int experiencia) {
        this.nome = nome;
        this.cpf = cpf;
        this.dtNascimento = dtNascimento;
        this.sexo = sexo;
        this.endereco = endereco;
        this.cargo = cargo;
        this.experiencia = experiencia;
    }

    public Membro(int id, String nome) {
        this(id, nome, "", "", ' ', "", 0, 0);
    }

    public Membro(int id, String nome, String cpf, String dtNascimento, char sexo, String endereco, int cargo,
                  int experiencia) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.dtNascimento = dtNascimento;
        this.sexo = sexo;
        this.endereco = endereco;
        this.cargo = cargo;
        this.experiencia = experiencia;
    }

    public int getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getDtNascimento() {
        return dtNascimento;
    }

    public void setDtNascimento(String dtNascimento) {
        this.dtNascimento = dtNascimento;
    }

    public char getSexo() {
        return sexo;
    }

    public void setSexo(char sexo) {
        this.sexo = sexo;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public int getCargo() {
        return cargo;
    }

    public void setCargo(int cargo) {
        this.cargo = cargo;
    }


    public int getExperiencia() {
        return experiencia;
    }

    public void setExperiencia(int experiencia) {
        this.experiencia = experiencia;
    }

    public boolean deletarMembro() {

        String sql = "DELETE FROM membros WHERE membro_id = " + id;

        SingletonDB.conectar();
        boolean flag = SingletonDB.getConexao().manipular(sql);
        SingletonDB.getConexao().desconectar();
        return flag;
    }

    public boolean alterar(Membro membro) {
        String sql = """
                UPDATE membros SET membro_nome='#1', membro_cpf='#2', membro_dtnascimento='#3',
                membro_sexo='#4', membro_endereco='#5', cargo_id=#6, membro_experiencia=#7
                WHERE membro_id=#8""";

        sql = sql.replace("#1", membro.getNome());
        sql = sql.replace("#2", membro.getCpf());
        sql = sql.replace("#3", membro.getDtNascimento());

        sql = sql.replace("#4", String.valueOf(membro.getSexo()));

        sql = sql.replace("#5", membro.getEndereco());
        sql = sql.replace("#6", "" + membro.getCargo());
        sql = sql.replace("#7", "" + membro.getExperiencia());
        sql = sql.replace("#8", "" + membro.getId());

        SingletonDB.conectar();
        boolean flag = SingletonDB.getConexao().manipular(sql);
        SingletonDB.getConexao().desconectar();

        return flag;
    }

    public boolean cadastrar() {
        int proxId = 1;
        try {
            ResultSet rs = SingletonDB.getConexao().consultar("SELECT COALESCE(MAX(membro_id), 0) + 1 AS prox_id FROM membros");
            if (rs != null && rs.next()) {
                proxId = rs.getInt("prox_id");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao obter próximo ID: " + e.getMessage());
        }

        String sql = "INSERT INTO membros (membro_id, membro_cpf, membro_nome, cargo_id, membro_dtNascimento, membro_sexo, membro_endereco, membro_experiencia) VALUES (#0, '#1', '#2', #3, '#4', '#5', '#6', #7)";
        sql = sql.replace("#0", String.valueOf(proxId));
        sql = sql.replace("#1", cpf);
        sql = sql.replace("#2", nome);
        sql = sql.replace("#3", String.valueOf(cargo));
        sql = sql.replace("#4", dtNascimento);
        sql = sql.replace("#5", String.valueOf(sexo));
        sql = sql.replace("#6", endereco);
        sql = sql.replace("#7", String.valueOf(experiencia));
        System.out.println(sql);
        if (SingletonDB.getConexao().manipular(sql))
            return true;
        return false;
    }

    public List<Membro> listarMembros(String keyword) {
        List<Membro> lista = new ArrayList<>();
        String sql = "SELECT * FROM membros";
        if (!keyword.isEmpty()) {
            sql += " WHERE UPPER(membro_nome) LIKE '%" + keyword + "%'";
        }
        sql += " ORDER BY membro_nome;";
        try {
            SingletonDB.conectar();
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while (rs != null && rs.next()) {
                String sexoStr = rs.getString("membro_sexo");
                char sexo = sexoStr.charAt(0);
                lista.add(new Membro(rs.getInt("membro_id"), rs.getString("membro_nome"), rs.getString("membro_cpf"),
                        rs.getString("membro_dtnascimento"), sexo, rs.getString("membro_endereco"),
                        rs.getInt("cargo_id"), rs.getInt("membro_experiencia")));
            }
            SingletonDB.getConexao().desconectar();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return lista;
    }

    public boolean validarnome() {
        Conexao con = SingletonDB.getConexao();
        String sql = "select count(*) as quant from membros where membro_nome = '"+nome+"'";
        ResultSet rs = con.consultar(sql);
        try {
            if(rs!=null && rs.next()) {
                int quant = rs.getInt("quant");
                if(quant == 1)
                    return true;
            }
            return false;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void setIdByNome() {
        Conexao con = SingletonDB.getConexao();
        String sql = "select membro_id from membros where membro_nome = '"+nome+"'";
        ResultSet rs = con.consultar(sql);
        try {
            if(rs!=null && rs.next()) {
                setId(rs.getInt("membro_id"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Membro buscarPorId(int idBusca) {
        String sql = "SELECT * FROM membros WHERE membro_id = " + idBusca;
        Membro membro = null;
        try {
            SingletonDB.conectar();
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            if (rs != null && rs.next()) {
                String sexoStr = rs.getString("membro_sexo");
                char sexo = sexoStr.charAt(0);
                membro = new Membro(rs.getInt("membro_id"), rs.getString("membro_nome"), rs.getString("membro_cpf"),
                        rs.getString("membro_dtnascimento"), sexo, rs.getString("membro_endereco"),
                        rs.getInt("cargo_id"), rs.getInt("membro_experiencia"));
            }
            SingletonDB.getConexao().desconectar();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return membro;
    }

    @JsonIgnore
    public int getQtde() {
        String sql = "SELECT COUNT(*) AS total_de_linhas FROM membros";
        try {
            SingletonDB.conectar();
            ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
            int qtde = 0;
            if (resultSet.next()) {
                qtde = resultSet.getInt("total_de_linhas");
            }
            SingletonDB.getConexao().desconectar();
            return qtde;
        } catch (Exception e) {
            System.err.println("Erro ao contar membros: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}