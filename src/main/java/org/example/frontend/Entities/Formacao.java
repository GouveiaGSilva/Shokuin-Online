package org.example.frontend.Entities;








import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.frontend.util.SingletonDB;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.example.frontend.util.SingletonDB;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Formacao {

    @JsonProperty("forma_id")
    private Integer id;
    @JsonProperty("forma_nome")
    private String nome;
    @JsonProperty("forma_instrumentos")
    private String instrumentos;
    @JsonProperty("forma_img")
    private String imagem;
    @JsonProperty("musi_id")
    private Musica musica;

    private List<InstrumentosFormacao> listaInstrumentos;

    public Formacao(Integer id, String nome) {
        this.id = id;
        this.nome = nome;
        this.instrumentos = "";
        this.musica = null;
    }

    public Formacao(Integer id) {
        this.id = id;
    }

    public Formacao(Integer id, String nome, String instrumentos, Musica musica) {
        this.id = id;
        this.nome = nome;
        this.instrumentos = instrumentos;
        this.musica = musica;
    }

    public Formacao(String nome, String instrumentos, Musica musica) {
        this.nome = nome;
        this.instrumentos = instrumentos;
        this.musica = musica;
    }

    public Formacao() {
    }

    public Integer getId() {
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

    public String getInstrumentos() {
        return instrumentos;
    }

    public void setInstrumentos(String instrumentos) {
        this.instrumentos = instrumentos;
    }

    public List<InstrumentosFormacao> getListaInstrumentos() {
        return listaInstrumentos;
    }

    public void setListaInstrumentos(List<InstrumentosFormacao> listaInstrumentos) {
        this.listaInstrumentos = listaInstrumentos;
    }

    public String getImagem() { return imagem; }

    public void setImagem(String imagem) { this.imagem = imagem; }

    public Musica getMusica() { return musica; }

    public void setMusica(Musica musica) { this.musica = musica; }


    public List<Formacao> listarTodas() {
        List<Formacao> lista = new ArrayList<>();
        String sql = "SELECT f.forma_id, f.forma_nome, f.forma_img, f.musi_id, m.musi_nome, m.musi_duracao " +
                     "FROM Formacao f " +
                     "LEFT JOIN musicas m ON f.musi_id = m.musi_id " +
                     "ORDER BY f.forma_nome";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            while (rs != null && rs.next()) {
                Formacao f = new Formacao();
                f.setId(rs.getInt("forma_id"));
                f.setNome(rs.getString("forma_nome"));
                f.setImagem(rs.getString("forma_img"));
                
                int musiId = rs.getInt("musi_id");
                if (musiId > 0) {
                    Musica m = new Musica();
                    m.setId(musiId);
                    m.setNome(rs.getString("musi_nome"));
                    m.setDuracao(rs.getString("musi_duracao"));
                    f.setMusica(m);
                }
                
                lista.add(f);
            }
        } catch (SQLException e) {
            System.out.println("Erro ao listar formações: " + e.getMessage());
        }
        return lista;
    }

    public Formacao buscarPorId(int buscaId) {
        String sql = "SELECT * FROM Formacao WHERE forma_id = " + buscaId;
        ResultSet rs = SingletonDB.getConexao().consultar(sql);

        try {
            if (rs != null && rs.next()) {
                Musica musica = new Musica();
                musica.setId(rs.getInt("musi_id"));
                Formacao f = new Formacao(
                        rs.getInt("forma_id"),
                        rs.getString("forma_nome"),
                        rs.getString("forma_jsonPalco"),
                        musica
                );
                f.setImagem(rs.getString("forma_img"));
                return f;
            }
        } catch (SQLException e) {
            System.out.println("Erro ao buscar formação: " + e.getMessage());
        }
        return null;
    }

    public boolean salvarFormacao() {
        String instrumentosSeguros = instrumentos.replace("'", "''");
        String sql = "INSERT INTO Formacao (forma_nome, forma_jsonPalco, forma_img, musi_id) VALUES ('#1', '#2', '#img', #3)";
        sql = sql.replace("#1", nome);
        sql = sql.replace("#2", instrumentosSeguros);
        sql = sql.replace("#img", imagem != null ? imagem : "");
        if (musica != null && musica.getId() > 0) {
            sql = sql.replace("#3", String.valueOf(musica.getId()));
        } else {
            sql = sql.replace("#3", "NULL");
        }
        if (SingletonDB.getConexao().manipular(sql)) {
            if (this.id == null || this.id == 0) {
                this.id = SingletonDB.getConexao().getMaxPK("Formacao", "forma_id");
            }
            salvarMembrosFormacao();
            return true;
        }
        return false;
    }

    public boolean atualizarFormacao() {
        String instrumentosSeguros = this.instrumentos.replace("'", "''");
        String sql = "UPDATE Formacao SET "
                + "forma_nome = '#1', "
                + "forma_jsonPalco = '#2', "
                + "forma_img = '#img', "
                + "musi_id = #3 "
                + "WHERE forma_id = " + this.id;

        sql = sql.replace("#1", this.nome);
        sql = sql.replace("#2", instrumentosSeguros);
        sql = sql.replace("#img", this.imagem != null ? this.imagem : "");

        if (musica != null && musica.getId() > 0) {
            sql = sql.replace("#3", String.valueOf(musica.getId()));
        } else {
            sql = sql.replace("#3", "NULL");
        }
        System.out.println("Executando Update: " + sql);
        if (SingletonDB.getConexao().manipular(sql)) {
            salvarMembrosFormacao();
            return true;
        }
        return false;
    }

    public boolean deletarFormacao() {
        String sql = "DELETE FROM formacao WHERE forma_id = " + id;
        if (SingletonDB.getConexao().manipular(sql)) {
            return true;
        }
        return false;
    }

    private void salvarMembrosFormacao() {
        if (this.id == null || this.id <= 0) return;

        String sqlLimpar = "DELETE FROM membros_formacao WHERE id_formacao = " + this.id + " AND id_instrumento IS NOT NULL";
        SingletonDB.getConexao().manipular(sqlLimpar);

        if (this.instrumentos == null || this.instrumentos.trim().isEmpty()) return;

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(this.instrumentos);
            JsonNode instrumentosArray = root.path("instrumentos");

            if (instrumentosArray.isArray()) {
                Map<Integer, Integer> contagemInstrumentos = new HashMap<>();

                for (JsonNode instNode : instrumentosArray) {
                    if (instNode.has("idTocador") && !instNode.get("idTocador").isNull()) {
                        String idTocadorStr = instNode.get("idTocador").asText();
                        if (idTocadorStr.trim().isEmpty()) continue;

                        int idTocador = Integer.parseInt(idTocadorStr);

                        int idInstrumento = -1;
                        int indiceInstrumento = 1;
                        if (instNode.has("idBanco") && !instNode.get("idBanco").isNull()) {
                            idInstrumento = instNode.get("idBanco").asInt();
                            if (idInstrumento > 0) {
                                indiceInstrumento = contagemInstrumentos.getOrDefault(idInstrumento, 0) + 1;
                                contagemInstrumentos.put(idInstrumento, indiceInstrumento);
                            }
                        }

                        String sqlInsert = "INSERT INTO membros_formacao (id_formacao, id_membro, id_instrumento, indice_instrumento) " +
                                           "VALUES (" + this.id + ", " + idTocador + ", " +
                                           (idInstrumento > 0 ? idInstrumento : "NULL") + ", " +
                                           (idInstrumento > 0 ? indiceInstrumento : "NULL") + ")";

                        SingletonDB.getConexao().manipular(sqlInsert);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao salvar membros_formacao: " + e.getMessage());
        }
    }

    public List<Membro> getTocadores(int id){
        List<Membro> membroList = new ArrayList<>();
        String sql = "SELECT m.membro_id, m.membro_nome FROM membros_formacao mf JOIN membros m ON mf.id_formacao = "+id+" AND mf.id_membro = m.membro_id";
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            while(rs.next())
                membroList.add(new Membro(rs.getInt("membro_id"), rs.getString("membro_nome")));
        } catch (Exception e) {}
        return membroList;
    }


    public boolean salvarInstrumentos() {
        String deleteSql = "DELETE FROM instrumentos_formacao WHERE id_formacao = " + id;
        SingletonDB.getConexao().manipular(deleteSql);

        if (listaInstrumentos != null && !listaInstrumentos.isEmpty()) {
            try {
                for (InstrumentosFormacao instrumento : listaInstrumentos) {
                    String sql = " INSERT INTO instrumentos_formacao(id_formacao, id_instrumento, quantidade) ";
                    sql += "VALUES ( " + id + "," + instrumento.getInstrumento().getId() + ", " + instrumento.getQuantidade() + ")";
                    if (!SingletonDB.getConexao().manipular(sql)) {
                        System.out.println("ERRO SQL AO INSERIR INSTRUMENTO: " + SingletonDB.getConexao().getMensagemErro());
                        return false;
                    }
                }
                return true;
            } catch (Exception e) {
                System.out.println("Erro ao salvar instrumentos da formação: " + e.getMessage());
                return false;
            }
        }
        return true;
    }

    public Formacao getFormacaoByNome(String nome) {
        String sql = "SELECT * FROM Formacao WHERE forma_nome = '" + nome + "'";
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try {
            if (rs != null && rs.next()) {
                Musica musica = new Musica();
                musica.setId(rs.getInt("musi_id"));
                Formacao f = new Formacao(
                        rs.getInt("forma_id"),
                        rs.getString("forma_nome"),
                        rs.getString("forma_jsonPalco"),
                        musica
                );
                f.setImagem(rs.getString("forma_img"));
                return f;
            }
        } catch (SQLException e) {
            System.out.println("Erro ao buscar formação: " + e.getMessage());
        }
        return null;
    }

}
