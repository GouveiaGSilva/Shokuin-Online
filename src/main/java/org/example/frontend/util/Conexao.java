package org.example.frontend.util;

import java.sql.*;

public class Conexao {
    private Connection connect;
    private String erro;

    public Conexao() {
        this.erro = "";
        this.connect = null;
    }

    public boolean conectar(String local, String banco, String usuario, String senha) {
        this.erro = "";
        try {
            if (this.connect != null && !this.connect.isClosed()) {
                return true;
            }

            Class.forName("org.postgresql.Driver");
            String url = local + banco;
            this.connect = DriverManager.getConnection(url, usuario, senha);
            return true;
        } catch (ClassNotFoundException cnfex) {
            this.erro = "Driver PostgreSQL não encontrado: " + cnfex.toString();
            return false;
        } catch (SQLException sqlex) {
            this.erro = "Impossivel conectar com a base de dados: " + sqlex.toString();
            return false;
        } catch (Exception ex) {
            this.erro = "Outro erro: " + ex.toString();
            return false;
        }
    }

    public boolean desconectar() {
        boolean desconectado = false;
        if (this.connect != null) {
            try {
                if (!this.connect.isClosed()) {
                    this.connect.close();
                }
                desconectado = true;
            } catch (SQLException e) {
                this.erro = "Não foi possivel fechar a conexão com o banco: " + e.toString();
            } finally {
                this.connect = null;
            }
        } else {
            desconectado = true;
        }
        return desconectado;
    }

    public String getMensagemErro() {
        return this.erro;
    }

    public boolean getEstadoConexao() {
        try {
            return (this.connect != null && !this.connect.isClosed());
        } catch (SQLException e) {
            return false;
        }
    }

    public boolean manipular(String sql) {
        System.out.println(sql);
        boolean executou = false;
        this.erro = "";

        try (Statement statement = this.connect.createStatement()) {
            int result = statement.executeUpdate(sql);
            if (result >= 1) {
                executou = true;
            }
        } catch (SQLException sqlex) {
            this.erro = "Erro: " + sqlex.toString();
        }
        return executou;
    }

    public ResultSet consultar(String sql) {
        System.out.println("Consultando " + sql);
        this.erro = "";
        try {
            Statement statement = this.connect.createStatement();
            return statement.executeQuery(sql);
        } catch (SQLException sqlex) {
            this.erro = "Erro: " + sqlex.toString();
            return null;
        }
    }

    public int getMaxPK(String tabela, String chave) {
        String sql = "select max(" + chave + ") from " + tabela;
        int max = 0;
        this.erro = "";

        try (ResultSet rs = consultar(sql)) {
            if (rs != null && rs.next()) {
                max = rs.getInt(1);
            }
        } catch (SQLException sqlex) {
            this.erro = "Erro: " + sqlex.toString();
            max = -1;
        }
        return max;
    }

    public Connection getConnect() {
        try {
            if (this.connect == null || this.connect.isClosed()) {
                conectar("jdbc:postgresql://localhost:5432/", "shokuintaiko", "postgres", "postgres123");
            }
        } catch (SQLException ignored) {}
        return this.connect;
    }
}