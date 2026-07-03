package org.example.frontend.util;

import java.io.RandomAccessFile;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class SingletonDB {

    private static final ThreadLocal<Conexao> conexaoThreadLocal = ThreadLocal.withInitial(Conexao::new);

    private SingletonDB() {
    }

    public static boolean conectar() {
        Conexao conexao = conexaoThreadLocal.get();
        return conexao.conectar("jdbc:postgresql://localhost:5432/", "shokuintaiko", "postgres", "postgres123");
    }

    public static boolean desconectar() {
        Conexao conexao = conexaoThreadLocal.get();
        if (conexao != null) {
            return conexao.desconectar();
        }
        return true;
    }

    public static Conexao getConexao() {
        Conexao conexao = conexaoThreadLocal.get();
        if (conexao == null) {
            conexao = new Conexao();
            conexaoThreadLocal.set(conexao);
        }
        if (!conexao.getEstadoConexao()) {
            conexao.conectar("jdbc:postgresql://localhost:5432/", "shokuintaiko", "postgres", "postgres123");
        }
        return conexao;
    }

    public static boolean criarDatabase(String database, String usuario, String senha) {
        try {
            Class.forName("org.postgresql.Driver");
            try (Connection connect = DriverManager.getConnection("jdbc:postgresql://localhost:5432/postgres", usuario, senha);
                 Statement statement = connect.createStatement()) {
                statement.execute("CREATE DATABASE " + database);
                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean criarTabelas(String script, String BD) {
        String url = "jdbc:postgresql://localhost/" + BD;
        try {
            Class.forName("org.postgresql.Driver");
            try (Connection connection = DriverManager.getConnection(url, "postgres", "postgres123");
                 Statement statement = connection.createStatement();
                 RandomAccessFile arq = new RandomAccessFile(script, "r")) {

                while (arq.getFilePointer() < arq.length()) {
                    String linha = arq.readLine();
                    if (linha != null && !linha.trim().isEmpty()) {
                        statement.addBatch(linha);
                    }
                }
                statement.executeBatch();
                return true;
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }
}