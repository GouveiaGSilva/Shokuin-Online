package org.example.frontend.util;

import java.io.RandomAccessFile;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.github.cdimascio.dotenv.Dotenv;

public class SingletonDB {

    private static final Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
    private static final ThreadLocal<Conexao> conexaoThreadLocal = ThreadLocal.withInitial(Conexao::new);
    private static HikariDataSource dataSource;

    private SingletonDB() {
    }

    public static synchronized HikariDataSource getDataSource() {
        if (dataSource == null) {
            HikariConfig config = new HikariConfig();
            String url = getDbUrl();
            if (!url.endsWith("/")) {
                url += "/";
            }
            config.setJdbcUrl(url + getDbName());
            config.setUsername(getDbUser());
            config.setPassword(getDbPassword());
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            dataSource = new HikariDataSource(config);
        }
        return dataSource;
    }

    public static String getDbUrl() {
        String url = dotenv.get("DB_URL");
        return (url != null && !url.isEmpty()) ? url : "jdbc:postgresql://localhost:5432/";
    }

    public static String getDbName() {
        String name = dotenv.get("DB_NAME");
        return (name != null && !name.isEmpty()) ? name : "shokuintaiko";
    }

    public static String getDbUser() {
        String user = dotenv.get("DB_USER");
        return (user != null && !user.isEmpty()) ? user : "postgres";
    }

    public static String getDbPassword() {
        String pass = dotenv.get("DB_PASSWORD");
        return (pass != null && !pass.isEmpty()) ? pass : "postgres123";
    }

    public static boolean conectar() {
        Conexao conexao = conexaoThreadLocal.get();
        return conexao.conectar(getDbUrl(), getDbName(), getDbUser(), getDbPassword());
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
            conexao.conectar(getDbUrl(), getDbName(), getDbUser(), getDbPassword());
        }
        return conexao;
    }

    public static boolean criarDatabase(String database, String usuario, String senha) {
        try {
            Class.forName("org.postgresql.Driver");
            String baseUrl = getDbUrl();
            if (!baseUrl.endsWith("/")) baseUrl += "/";
            try (Connection connect = DriverManager.getConnection(baseUrl + "postgres", usuario, senha);
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
        String url = getDbUrl() + BD;
        try {
            Class.forName("org.postgresql.Driver");
            try (Connection connection = DriverManager.getConnection(url, getDbUser(), getDbPassword());
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