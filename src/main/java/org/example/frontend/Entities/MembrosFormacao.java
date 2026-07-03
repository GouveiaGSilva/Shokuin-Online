package org.example.frontend.Entities;

import org.example.frontend.util.SingletonDB;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MembrosFormacao {

    @JsonProperty("id_mf")
    private Integer idMf;

    @JsonProperty("id_formacao")
    private Integer idFormacao;

    @JsonProperty("id_membro")
    private Integer idMembro;

    @JsonProperty("id_instrumento")
    private Integer idInstrumento;

    @JsonProperty("indice_instrumento")
    private Integer indiceInstrumento;

    public MembrosFormacao() {}

    public MembrosFormacao(Integer idFormacao, Integer idMembro) {
        this.idFormacao = idFormacao;
        this.idMembro = idMembro;
        this.idInstrumento = null;
        this.indiceInstrumento = null;
    }

    public Integer getIdMf() { return idMf; }
    public void setIdMf(Integer idMf) { this.idMf = idMf; }

    public Integer getIdFormacao() { return idFormacao; }
    public void setIdFormacao(Integer idFormacao) { this.idFormacao = idFormacao; }

    public Integer getIdMembro() { return idMembro; }
    public void setIdMembro(Integer idMembro) { this.idMembro = idMembro; }

    public Integer getIdInstrumento() { return idInstrumento; }
    public void setIdInstrumento(Integer idInstrumento) { this.idInstrumento = idInstrumento; }

    public Integer getIndiceInstrumento() { return indiceInstrumento; }
    public void setIndiceInstrumento(Integer indiceInstrumento) { this.indiceInstrumento = indiceInstrumento; }

    // Busca os membros salvos como pool da formação (aqueles onde id_instrumento pode ser nulo ou não, 
    // mas que fazem parte da formação de forma única)
    public static List<Membro> buscarMembrosDaFormacao(int idFormacao) {
        List<Membro> lista = new ArrayList<>();
        // Usa DISTINCT para não duplicar se o mesmo membro tiver id_instrumento IS NULL e id_instrumento = X
        String sql = "SELECT DISTINCT m.* FROM membros_formacao mf JOIN membros m ON mf.id_membro = m.membro_id WHERE mf.id_formacao = " + idFormacao + " ORDER BY m.membro_nome";
        try {
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while (rs != null && rs.next()) {
                String sexoStr = rs.getString("membro_sexo");
                char sexo = (sexoStr != null && !sexoStr.isEmpty()) ? sexoStr.charAt(0) : 'M';
                lista.add(new Membro(rs.getInt("membro_id"), rs.getString("membro_nome"), rs.getString("membro_cpf"),
                        rs.getString("membro_dtnascimento"), sexo, rs.getString("membro_endereco"),
                        rs.getInt("cargo_id"), rs.getInt("membro_experiencia")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    // Salva a lista de membros de forma manual no pool da formação
    public static boolean salvarMembrosPool(int idFormacao, List<Integer> idMembros) {
        // Primeiro deleta todos do pool (aqueles não associados ao palco)
        String sqlLimpar = "DELETE FROM membros_formacao WHERE id_formacao = " + idFormacao + " AND id_instrumento IS NULL";
        SingletonDB.getConexao().manipular(sqlLimpar);

        if (idMembros == null || idMembros.isEmpty()) {
            return true;
        }

        // Insere os novos
        for (Integer idMembro : idMembros) {
            String sqlInsert = "INSERT INTO membros_formacao (id_formacao, id_membro, id_instrumento, indice_instrumento) " +
                    "VALUES (" + idFormacao + ", " + idMembro + ", NULL, NULL)";
            SingletonDB.getConexao().manipular(sqlInsert);
        }
        return true;
    }
}
