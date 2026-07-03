package org.example.frontend.Entities;

import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class Categoria {
    private int id;
    private String nome;

    public Categoria(int id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Categoria() {
        this(-1, "");
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

    public List<Categoria> listarTodos(){
        List<Categoria> list = new ArrayList<>();
        String sql = "select * from categoria order by cat_nome";
        try (ResultSet rs = SingletonDB.getConexao().consultar(sql)) {
            while (rs != null && rs.next()){
                Categoria c = new Categoria(rs.getInt("cat_id"), rs.getString("cat_nome"));
                list.add(c);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return list;
    }
}
