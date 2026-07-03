package org.example.frontend.DAOS;

import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Musica;
import org.example.frontend.util.IDAO;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MusicaDAO implements IDAO<Musica> {
    @Override
    public boolean gravar(Musica musica){
        String sql = "INSERT INTO musicas (musi_nome, musi_duracao, musi_compositor) VALUES ('#1', '#2', '#3')";
        sql = sql.replace("#1", musica.getNome());
        sql = sql.replace("#2", musica.getDuracao());
        sql = sql.replace("#3", musica.getCompositor());
        System.out.println(sql);
        SingletonDB.conectar();
        boolean flag = SingletonDB.getConexao().manipular(sql);
        SingletonDB.getConexao().desconectar();
        return flag;
    }

    @Override
    public boolean alterar(Musica musica) {
        String sql="""
          UPDATE musicas SET musi_nome='#1', musi_duracao='#2',  musi_compositor='#3' 
          WHERE musi_id=#4""";
        sql=sql.replace("#1",musica.getNome());
        sql=sql.replace("#2",musica.getDuracao());
        sql=sql.replace("#3",musica.getCompositor());
        sql=sql.replace("#4",""+musica.getId());
        SingletonDB.conectar();
        boolean flag = SingletonDB.getConexao().manipular(sql);
        SingletonDB.getConexao().desconectar();
        return flag;
    }

    @Override
    public boolean apagar(int id) {
        String  sql = "DELETE FROM musicas WHERE musi_id = "+id;
        //System.out.println(sql);
        SingletonDB.conectar();
        boolean flag = SingletonDB.getConexao().manipular(sql);
        SingletonDB.getConexao().desconectar();
        return flag;
    }

    @Override
    public Musica get(int id) {
        return null;
    }

    @Override
    public List<Musica> get(String filtro){
        List<Musica> musicas = new ArrayList<>();
        String sql = "SELECT * FROM musicas";
        if(!filtro.isEmpty())
            sql+=" WHERE "+filtro;
        sql+=" ORDER BY musicas.musi_nome;";
        try{
                ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
                while (resultSet.next()) {
                    Musica musica = new Musica(resultSet.getInt("musi_id"), resultSet.getString("musi_nome"),
                            resultSet.getString("musi_duracao"), resultSet.getString("musi_compositor"));
                    musicas.add(musica);
                }
        }catch(Exception e){
            throw new RuntimeException(e);
        }
        return musicas;
    }

    public int getQtde() {
        String sql = "SELECT COUNT(*) AS total_de_linhas FROM musicas";
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
            System.err.println("Erro ao contar músicas: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }


}
