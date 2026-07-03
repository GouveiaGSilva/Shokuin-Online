package org.example.frontend.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Instrumentos {

    @JsonProperty("instru_id")
    private int id;
    @JsonProperty("instru_nome")
    private String nome;
    @JsonProperty("instru_img")
    private String img;
    private Fornecedor fornecedor;

    public Instrumentos(int id) {
        this.id = id;
    }

    public Instrumentos(int id, String nome, String img, Fornecedor fornecedor) {
        this.id = id;
        this.nome = nome;
        this.img = img;
        this.fornecedor = fornecedor;
    }

    public Instrumentos() {
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
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

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public boolean validaIdNome() {
        String sql = "select count(*) as quant from instrumentos where instru_id = " + id + " and instru_nome = '" + nome + "' and forne_id = " + fornecedor.getId();
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

    public boolean cadastrarInstrumento() {
        SingletonDB.getConexao().manipular("ALTER TABLE instrumentos ADD COLUMN IF NOT EXISTS instru_ativo BOOLEAN DEFAULT TRUE;");
        String sql = "INSERT INTO instrumentos (instru_nome, instru_img , forne_id, instru_ativo) VALUES ('"
                + nome + "' , " + "'" + img + "' , " + fornecedor.getId() + ", TRUE) "
                + "ON CONFLICT (instru_nome) DO UPDATE SET instru_ativo = TRUE, instru_img = EXCLUDED.instru_img, forne_id = EXCLUDED.forne_id;";
        System.out.println(sql);
        return SingletonDB.getConexao().manipular(sql);
    }

    public Instrumentos getInstrumentoById(int id) {
        Instrumentos Instrumentos = null;
        String sql = "SELECT i.instru_id, fornecedores.forne_nome ,fornecedores.forne_id, i.instru_nome, i.instru_img, COALESCE(e.est_quant, 0) as est_quant FROM instrumentos i join fornecedores on i.forne_id = fornecedores.forne_id LEFT JOIN estoque e on e.instru_id = i.instru_id";
        if (id > 0) {
            sql += " WHERE (i.instru_id = " + id + ")";
        }
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            if (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                Instrumentos = (new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f));
            }
            return Instrumentos;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Instrumentos getInstrumentoByNome(String nome) {
        Instrumentos Instrumentos = null;
        String sql = "SELECT i.instru_id, fornecedores.forne_nome ,fornecedores.forne_id, i.instru_nome, i.instru_img, COALESCE(e.est_quant, 0) as est_quant FROM instrumentos i join fornecedores on i.forne_id = fornecedores.forne_id LEFT JOIN estoque e on e.instru_id = i.instru_id";
        if (!nome.isBlank()) {
            sql += " WHERE i.instru_nome = '" + nome + "'";
        }
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            if (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                Instrumentos = (new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f));
            }
            return Instrumentos;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean excluirInstrumento(String newName, String newImgName) {
        SingletonDB.getConexao().manipular("ALTER TABLE instrumentos ADD COLUMN IF NOT EXISTS instru_ativo BOOLEAN DEFAULT TRUE;");
        String sql = "UPDATE instrumentos SET instru_ativo = FALSE";

        if (newName != null && !newName.trim().isEmpty()) {
            sql += ", instru_nome = '" + newName + "'";
        } else {
            sql += ", instru_nome = instru_nome || '_Ex'";
        }

        if (newImgName != null && !newImgName.trim().isEmpty()) {
            sql += ", instru_img = '" + newImgName + "'";
        }
        sql += " WHERE instru_id = " + id;
        if (SingletonDB.getConexao().manipular(sql)) {
            return true;
        }
        return false;
    }

    public boolean excluirInstrumento() {
        return excluirInstrumento(null, null);
    }

    public boolean atualizarInstrumento() {
        String sql = "UPDATE Instrumentos SET instru_nome = '" + nome + "', forne_id = '" + fornecedor.getId() + "'";
        if (img != null && !img.trim().isEmpty()) {
            sql += ", instru_img = '" + img + "'";
        }
        sql += " WHERE instru_id = '" + id + "'";
        if (SingletonDB.getConexao().manipular(sql)) {
            return true;
        }else {
            return false;
        }
    }

    public List<Instrumentos> listarAllIncludeInactive() {
        List<Instrumentos> lista = new ArrayList<>();
        String sql = "SELECT i.instru_id, fornecedores.forne_nome ,fornecedores.forne_id, i.instru_nome, i.instru_img, COALESCE(e.est_quant, 0) as est_quant FROM instrumentos i join fornecedores on i.forne_id = fornecedores.forne_id LEFT JOIN estoque e on e.instru_id = i.instru_id ORDER BY i.instru_nome ASC";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                lista.add(new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f));
            }
            if (lista.isEmpty()) {
                return null;
            }
            return lista;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Instrumentos> listarFiltro(String tipo, String filter) {
        List<Instrumentos> lista = new ArrayList<>();
        String sql = "";
        if (tipo.equals("codigo")) {
            sql = "select * from Instrumentos join fornecedores on Instrumentos.forne_id = fornecedores.forne_id where instru_ativo = TRUE and cast(instru_id as char) LIKE '" + filter + "%' order by instru_id";
        }else {
            sql = "select * from Instrumentos join fornecedores on Instrumentos.forne_id = fornecedores.forne_id where instru_ativo = TRUE and upper(instru_nome) like upper('" + filter + "%') order by instru_nome";
        }
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                Instrumentos p = new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f);
                lista.add(p);
            }
            if (lista.isEmpty()) {
                return null;
            }
            return lista;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Instrumentos> listarAllInfo() {
        List<Instrumentos> lista = new ArrayList<>();
        String sql = "SELECT i.instru_id, i.instru_nome, e.est_quant, f.forne_nome FROM instrumentos i LEFT JOIN estoque e ON e.instru_id = i.instru_id LEFT JOIN fornecedores f ON f.forne_id = i.forne_id WHERE i.instru_ativo = TRUE GROUP BY i.instru_id, i.instru_nome, f.forne_nome, e.est_quant ORDER BY i.instru_nome;";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                Fornecedor f = new Fornecedor();
                f.setId(rs.getInt("forne_id"));
                f.setNome(rs.getString("forne_nome"));
                lista.add(new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), rs.getString("instru_img"), f));
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