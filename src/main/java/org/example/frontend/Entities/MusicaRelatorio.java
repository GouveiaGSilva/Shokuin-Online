package org.example.frontend.Entities;

import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class MusicaRelatorio {
    Musica musica;
    List<Apresentacao> apresentacoes;
    List<Formacao> formacoes;
    List<Agenda> agendas;
    int totalExecucoes;

    public MusicaRelatorio(Musica musica) {
        this.musica = musica;
        this.apresentacoes = new ArrayList<>();
        this.formacoes = new ArrayList<>();
        this.agendas = new ArrayList<>();
        totalExecucoes = 0;
    }

    public MusicaRelatorio(Musica musica, List<Apresentacao> apresentacoes, List<Formacao> formacoes, List<Agenda> agendas, int totalExecucoes) {
        this.musica = musica;
        this.apresentacoes = apresentacoes;
        this.formacoes = formacoes;
        this.agendas = agendas;
        this.totalExecucoes = totalExecucoes;
    }

    public MusicaRelatorio() {
        this.musica = new Musica();
        this.apresentacoes = new ArrayList<>();
        this.formacoes = new ArrayList<>();
        this.agendas = new ArrayList<>();
        this.totalExecucoes = 0;
    }

    public Musica getMusica() {
        return musica;
    }

    public List<Apresentacao> getApresentacoes() {
        return apresentacoes;
    }

    public List<Formacao> getFormacoes() {
        return formacoes;
    }

    public List<Agenda> getAgendas() {
        return agendas;
    }

    public int getTotalExecucoes() {
        return totalExecucoes;
    }

    public List<MusicaRelatorio> getRelatorioPorData(String dataInicio, String dataFim){
        String sql = "SELECT * " +
                "FROM musicas m JOIN listamusicas lm ON lm.musi_id=m.musi_id " +
                "JOIN formacao f ON f.forma_id=lm.forma_id " +
                "JOIN apresentacao ap ON lm.aprese_id=ap.aprese_id " +
                "JOIN agenda ag ON ap.aprese_id=ag.aprese_id " +
                "WHERE ag.agenda_data>='" + dataInicio + "' AND ag.agenda_data<='"+ dataFim + "'";
        System.out.println(sql);
        List<MusicaRelatorio> relatorios = new ArrayList<>();
        try{
            ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
            while (resultSet.next()) {
                Musica musica = new Musica(resultSet.getInt("musi_id"), resultSet.getString("musi_nome"),
                        resultSet.getString("musi_duracao"), resultSet.getString("musi_compositor"));
                Apresentacao apresentacao = new Apresentacao(resultSet.getInt("aprese_id"), resultSet.getString("aprese_nome"),
                        resultSet.getString("agen_status").charAt(0), resultSet.getString("aprese_status").charAt(0), null, null);
                String stringlocal =  resultSet.getString("agenda_local");
                String[] linhas = stringlocal.split("\n");
                String cep = linhas[0].replaceFirst("CEP: ", "").trim();
                String estado = linhas[1].replaceFirst("Estado: ", "").trim();
                String cidade = linhas[2].replaceFirst("Cidade: ", "").trim();
                String bairro = linhas[3].replaceFirst("Bairro: ", "").trim();
                String rua = linhas[4].replaceFirst("Rua: ", "").trim();
                String numero = linhas[5].replaceFirst("Numero: ", "").trim();
                String complemento;
                if(linhas.length==7)
                    complemento = linhas[6].replaceFirst("Complemento: ", "").trim();
                else
                    complemento = "";
                Local local = new Local(estado, cidade, bairro, rua, complemento,  numero, cep);
                Agenda agenda = new Agenda(resultSet.getInt("agenda_id"), local,
                        resultSet.getString("agenda_data"), resultSet.getString("agenda_horario"));
                Formacao formacao = new Formacao(resultSet.getInt("forma_id"), resultSet.getString("forma_nome"));
                boolean flag = false;
                int index = 0;
                if(!relatorios.isEmpty())
                    for (int i = 0; i < relatorios.size() && !flag; i++)
                        if (relatorios.get(i).musica.getId() == musica.getId()) {
                            flag = true;
                            index = i;
                        }
                if(!flag){
                    List<Formacao> formacoes = new ArrayList<>();
                    formacoes.add(formacao);
                    List<Apresentacao> apresentacoes = new ArrayList<>();
                    apresentacoes.add(apresentacao);
                    List<Agenda> agendas = new ArrayList<>();
                    agendas.add(agenda);
                    MusicaRelatorio relatorio = new MusicaRelatorio(musica, apresentacoes, formacoes,  agendas, 1);
                    relatorios.add(relatorio);
                }else{
                    relatorios.get(index).apresentacoes.add(apresentacao);
                    relatorios.get(index).formacoes.add(formacao);
                    relatorios.get(index).agendas.add(agenda);
                    relatorios.get(index).totalExecucoes++;
                }
            }
        }catch(Exception e){
            System.err.println("Erro ao buscar músicas: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return relatorios;
    }
}
