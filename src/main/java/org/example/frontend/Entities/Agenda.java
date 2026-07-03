package org.example.frontend.Entities;

import org.example.frontend.util.SingletonDB;

import java.math.BigInteger;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Agenda {
    private int id;
    private Local local;
    private String Data;
    private String Horario;
    private Apresentacao apresentacao;
    private String localidade;
    private String status;

    public Agenda() {
    }

    public Agenda(int id, Local local, String data, String horario, Apresentacao Apresentacao, String localidade, String status) {
        this.id = id;
        this.local = local;
        Data = data;
        Horario = horario;
        this.apresentacao = Apresentacao;
        this.localidade = localidade;
        this.status = status;
    }

    public Agenda(int id, Local local, String data, String horario, Apresentacao apresentacao, String localidade) {
        this.id = id;
        this.local = local;
        Data = data;
        Horario = horario;
        this.apresentacao = apresentacao;
        this.localidade = localidade;
    }

    public Agenda(int id, Local local, String data, String horario, Apresentacao apresentacao) {
        this.id = id;
        this.local = local;
        Data = data;
        Horario = horario;
        this.apresentacao = apresentacao;
    }

    public Agenda(Local local, String data, String horario, Apresentacao apresentacao) {
        this.local = local;
        Data = data;
        Horario = horario;
        this.apresentacao = apresentacao;
    }

    public Agenda(Local local, String data, String horario) {
        this.local = local;
        Data = data;
        Horario = horario;
    }

    public Agenda(int id, Local local, String data, String horario) {
        this.id = id;
        this.local = local;
        Data = data;
        Horario = horario;
    }

    public Local getLocal() {
        return local;
    }

    public void setLocal(Local local) {
        this.local = local;
    }

    public String getData() {
        return Data;
    }

    public void setData(String data) {
        Data = data;
    }

    public String getHorario() {
        return Horario;
    }

    public void setHorario(String horario) {
        Horario = horario;
    }

    public Apresentacao getApresentacao() {
        return apresentacao;
    }

    public void setApresentacao(Apresentacao apresentacao) {
        this.apresentacao = apresentacao;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getLocalidade() {
        return localidade;
    }

    public void setLocalidade(String localidade) {
        this.localidade = localidade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean gravar() {
        String stringLocal = "CEP: " + local.getCEP() + "\nEstado: " + local.getEstado() + "\nCidade: " + local.getCidade() +
                "\nBairro: "+local.getBairro()+"\nRua: "+local.getRua()+"\nNumero: "+local.getNumero();
        if(!local.getComplemento().isEmpty())
            stringLocal += "\nComplemento: "+local.getComplemento();
        String sql = "INSERT INTO agenda (agenda_local, agenda_data, agenda_horario, aprese_id) VALUES ('#1', '#2', '#3', #4);";
        sql = sql.replace("#1", stringLocal);
        sql = sql.replace("#2", Data);
        sql = sql.replace("#3", Horario);
        sql = sql.replace("#4", ""+apresentacao.getId());
        System.out.println(sql);
        return SingletonDB.getConexao().manipular(sql);
    }

    public Agenda getAgendaById(int idAgenda){
        Agenda agenda = new Agenda();
        String sql = "SELECT ag.agenda_id AS id_agenda, ag.agenda_local, ag.agenda_data, ag.agenda_horario, ag.aprese_id, ap.aprese_nome, ap.agen_status FROM agenda ag JOIN apresentacao ap ON ag.aprese_id=ap.aprese_id WHERE agenda_id="+idAgenda;
        try{
            ResultSet rs = SingletonDB.getConexao().consultar(sql);
            if(rs.next()){
                String stringlocal = rs.getString("agenda_local");
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
                Apresentacao apresentacao = new Apresentacao(rs.getInt("aprese_id"));
                agenda = new Agenda(rs.getInt("id_agenda"), local,
                        rs.getString("agenda_data"), rs.getString("agenda_horario"),
                        apresentacao, rs.getString("aprese_nome"), rs.getString("agen_status"));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return agenda;
    }

    public List<Agenda> listaAgendas(){
        List<Agenda> agendas = new ArrayList<>();
        String sql = "SELECT ag.agenda_id AS id_agenda, ag.agenda_local, ag.agenda_data, ag.agenda_horario, ag.aprese_id, ap.aprese_nome, ap.agen_status FROM agenda ag JOIN apresentacao ap ON ag.aprese_id=ap.aprese_id";
        sql+=" ORDER BY ag.agenda_data;";
        try{
            ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
            while (resultSet != null && resultSet.next()) {
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
                Apresentacao apre = new Apresentacao();
                Apresentacao apresentacao = apre.getById(resultSet.getInt("aprese_id"));
                Agenda agenda = new Agenda(resultSet.getInt("id_agenda"), local,
                        resultSet.getString("agenda_data"), resultSet.getString("agenda_horario"),
                        apresentacao, resultSet.getString("aprese_nome"), resultSet.getString("agen_status"));
                agendas.add(agenda);
            }
        }catch(Exception e){
            throw new RuntimeException(e);
        }
        return agendas;
    }

    public List<Agenda> listaAgendaPorDia(String dia){
        List<Agenda> agendas = new ArrayList<>();
        String sql = "SELECT ag.agenda_id AS id_agenda, ag.agenda_local, ag.agenda_data, ag.agenda_horario, ag.aprese_id, ap.aprese_nome, ap.agen_status FROM agenda ag JOIN apresentacao ap ON ag.aprese_id=ap.aprese_id";
        sql+=" WHERE agenda_data='"+dia+"' ";
        sql+="ORDER BY ag.agenda_data;";
        try{
            ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
            while (resultSet.next()) {
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
                Apresentacao apresentacao = new Apresentacao(resultSet.getInt("aprese_id"));
                Agenda agenda = new Agenda(resultSet.getInt("id_agenda"), local,
                        resultSet.getString("agenda_data"), resultSet.getString("agenda_horario"),
                        apresentacao, resultSet.getString("aprese_nome"), resultSet.getString("agen_status"));
                agendas.add(agenda);
            }
        }catch(Exception e){
            throw new RuntimeException(e);
        }
        return agendas;
    }

    public List<Agenda> listaAgendaPorPeriodo(String inicio, String fim){
        List<Agenda> agendas = new ArrayList<>();
        String sql = "SELECT ag.agenda_id AS id_agenda, ag.agenda_local, ag.agenda_data, ag.agenda_horario, ag.aprese_id, ap.aprese_nome, ap.agen_status FROM agenda ag JOIN apresentacao ap ON ag.aprese_id=ap.aprese_id";
        sql+=" WHERE agenda_data>='"+inicio+"' AND agenda_data<='"+fim+"' ";
        sql+="ORDER BY ag.agenda_data, ag.agenda_horario;";
        try{
            ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
            while (resultSet.next()) {
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
                Apresentacao apresentacao = new Apresentacao(resultSet.getInt("aprese_id"));
                Agenda agenda = new Agenda(resultSet.getInt("id_agenda"), local,
                        resultSet.getString("agenda_data"), resultSet.getString("agenda_horario"),
                        apresentacao, resultSet.getString("aprese_nome"), resultSet.getString("agen_status"));
                agendas.add(agenda);
            }
        }catch(Exception e){
            throw new RuntimeException(e);
        }
        return agendas;
    }

    public List<Agenda> proximasAgendas(){
        List<Agenda> agendas = new ArrayList<>();
        String sql = "SELECT ag.agenda_id AS id_agenda, ag.agenda_local, ag.agenda_data, ag.agenda_horario, ag.aprese_id, ap.aprese_nome, ap.agen_status FROM agenda ag JOIN apresentacao ap ON ag.aprese_id=ap.aprese_id";
        sql+=" WHERE agenda_data>=CURRENT_DATE AND ap.agen_status = 'A'";
        sql+="ORDER BY ag.agenda_data;";
        try{
            ResultSet resultSet = SingletonDB.getConexao().consultar(sql);
            while (resultSet != null && resultSet.next()) {
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
                Apresentacao apresentacao = new Apresentacao(resultSet.getInt("aprese_id"));
                Agenda agenda = new Agenda(resultSet.getInt("id_agenda"), local,
                        resultSet.getString("agenda_data"), resultSet.getString("agenda_horario"),
                        apresentacao, resultSet.getString("aprese_nome"), resultSet.getString("agen_status"));
                agendas.add(agenda);
            }
        }catch(Exception e){
            throw new RuntimeException(e);
        }
        return agendas;
    }

    public boolean deletar(){
        String sql = "DELETE FROM agenda WHERE agenda_id="+id+";";
        return SingletonDB.getConexao().manipular(sql);
    }

    public boolean checaDisponivel(){
        String sql = "select count(*) from agenda as a join apresentacao as ap on a.aprese_id = ap.aprese_id where a.agenda_data = '" + Data + "' and a.agenda_horario = '"+Horario+"' and ap.agen_status = 'A' and a.aprese_id <> "+ apresentacao.getId();
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        Long count = -1L;
        try {
            rs.next();
            count = rs.getLong("count");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        if(count == -1L || count > 0L)
            return false;
        else
            return true;
    }

    public boolean atualizar(){
        if(
                !local.getCEP().isBlank() &&
                !local.getBairro().isBlank() &&
                !local.getCidade().isBlank() &&
                !local.getNumero().isBlank() &&
                !local.getEstado().isBlank() &&
                !local.getRua().isBlank()
        ) {
            String stringLocal = "CEP: " + local.getCEP() + "\nEstado: " + local.getEstado() + "\nCidade: " + local.getCidade() + "\nBairro: " + local.getBairro() + "\nRua: " + local.getRua() + "\nNumero: " + local.getNumero();
            if (!local.getComplemento().isEmpty())
                stringLocal += "\nComplemento: " + local.getComplemento();
            String sql = "UPDATE agenda SET agenda_local='#1', agenda_data='#2', agenda_horario='#3' WHERE agenda_id=#4;";
            sql += "UPDATE apresentacao SET agen_status='A' WHERE aprese_id=" + apresentacao.getId();
            sql = sql.replace("#1", stringLocal);
            sql = sql.replace("#2", getData());
            sql = sql.replace("#3", getHorario());
            sql = sql.replace("#4", "" + id);
            return SingletonDB.getConexao().manipular(sql);
        }
        return false;
    }

    public boolean finalizar(){
        boolean flag = true;
        Apresentacao apresentacao = new Apresentacao();
        List<Apresentacao> list = apresentacao.getAllTerminouData();
        for(int i=0; i<list.size() && flag; i++) {
            Apresentacao ap = list.get(i);
            if (!ap.atualizarStatus('F'))
                flag = false;
        }
        return flag;
    }
}
