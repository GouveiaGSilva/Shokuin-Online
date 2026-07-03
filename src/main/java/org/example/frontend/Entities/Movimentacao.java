package org.example.frontend.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Movimentacao {
    private int id;
    private Instrumentos instrumento;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX", timezone = "America/Sao_Paulo")
    private Date data;
    private String tipo;
    private String motivo;
    private int quant;
    private Double valor;

    public Movimentacao(int id, Instrumentos instrumento, Date data, String tipo, String motivo, int quant, Double valor) {
        this.id = id;
        this.instrumento = instrumento;
        this.data = data;
        this.tipo = tipo;
        this.motivo = motivo;
        this.quant = quant;
        this.valor = valor;
    }

    public Movimentacao(Instrumentos instrumento, Date data, String tipo, String motivo, int quant, Double valor) {
        this.instrumento = instrumento;
        this.data = data;
        this.tipo = tipo;
        this.motivo = motivo;
        this.quant = quant;
        this.valor = valor;
    }

    public Movimentacao() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Date getData() {
        return data;
    }

    public void setData(Date data) {
        this.data = data;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public int getQuant() {
        return quant;
    }

    public void setQuant(int quant) {
        this.quant = quant;
    }

    public Instrumentos getInstrumento() {
        return instrumento;
    }

    public void setInstrumento(Instrumentos instrumento) {
        this.instrumento = instrumento;
    }

    public boolean registrarMovimentacao(int instru_id){
        Conexao con = SingletonDB.getConexao();
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ssXXX");
        String dataFormatada = sdf.format(data);
        String sql = "insert into movimentacao (instru_id, mov_data, mov_tipo, mov_motivo, mov_quant, mov_valor) values ("+instru_id+",'"+dataFormatada+"','"+tipo+"','"+motivo+"',"+quant+","+valor+");";
        return con.manipular(sql);
    }

    public List<Movimentacao> listarMovFilter(String dataIni, String dataFim, String tipo){
        String sql = "select * from movimentacao natural join instrumentos where to_char(mov_data, 'YYYY-MM-DD') between '"+dataIni+"' and '"+dataFim+"'";
        if(tipo.equalsIgnoreCase("Entrada"))
            sql += " and upper(mov_tipo) = upper('"+tipo+"')";
        else if(tipo.equalsIgnoreCase("Saída") || tipo.equalsIgnoreCase("Saida"))
            sql += " and upper(mov_tipo) = upper('Saida')";
        sql += " order by mov_data";
        Conexao con = SingletonDB.getConexao();
        ResultSet rs = con.consultar(sql);
        List<Movimentacao> list = new ArrayList<>();
        try {
            while (rs != null && rs.next()) {
                Instrumentos i = new Instrumentos(rs.getInt("instru_id"), rs.getString("instru_nome"), "", null);
                list.add(new Movimentacao(i, rs.getTimestamp("mov_data"), rs.getString("mov_tipo"), rs.getString("mov_motivo"), rs.getInt("mov_quant"), rs.getDouble("mov_valor")));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    public Movimentacao listarAntigo(){
        Conexao con = SingletonDB.getConexao();
        String sql = "select * from movimentacao order by mov_data fetch first 1 rows only";
        ResultSet rs = con.consultar(sql);
        Movimentacao m;
        try {
            if(rs != null &&rs.next())
                m = new Movimentacao(null, rs.getTimestamp("mov_data"), rs.getString("mov_tipo"), rs.getString("mov_motivo"), rs.getInt("mov_quant"), rs.getDouble("mov_valor"));
            else
                return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return m;
    }
}