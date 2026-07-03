package org.example.frontend.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.frontend.util.SingletonDB;

import java.sql.ResultSet;

public class Palco {
    @JsonProperty("pl_id")
    private int id;
    @JsonProperty("pl_altura")
    private int altura;
    @JsonProperty("pl_largura")
    private int largura;
    @JsonProperty("pl_linhasv")
    private int linhasv;
    @JsonProperty("pl_linhash")
    private int linhash;
    @JsonProperty("forma_id")
    private int forma_id;

    public Palco(int id, int altura, int largura, int linhasv, int linhash, int forma_id) {
        this.id = id;
        this.altura = altura;
        this.largura = largura;
        this.linhasv = linhasv;
        this.linhash = linhash;
        this.forma_id = forma_id;
    }

    public Palco(int altura, int largura, int linhasv, int linhash, int forma_id) {
        this.altura = altura;
        this.largura = largura;
        this.linhasv = linhasv;
        this.linhash = linhash;
        this.forma_id = forma_id;
    }

    public Palco() {
        this(0,0,0,0,0,0);
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAltura() {
        return altura;
    }

    public void setAltura(int altura) {
        this.altura = altura;
    }

    public int getLargura() {
        return largura;
    }

    public void setLargura(int largura) {
        this.largura = largura;
    }

    public int getLinhasv() {
        return linhasv;
    }

    public void setLinhasv(int linhasv) {
        this.linhasv = linhasv;
    }

    public int getLinhash() {
        return linhash;
    }

    public void setLinhash(int linhash) {
        this.linhash = linhash;
    }

    public int getForma_id() {
        return forma_id;
    }

    public void setForma_id(int forma_id) {
        this.forma_id = forma_id;
    }

    public Palco getPalcoByFormacao(int formacao){
        Palco palco = null;
        String sql = "SELECT * FROM palco p JOIN formacao f on p.forma_id = " + formacao;
        ResultSet rs = SingletonDB.getConexao().consultar(sql);
        try{
            if(rs != null && rs.next()){
                palco = (new Palco(
                rs.getInt("pl_altura"),
                rs.getInt("pl_largura"),
                rs.getInt("pl_linhasv"),
                rs.getInt("pl_linhash"),
                rs.getInt("forma_id")));
            }
            return palco;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
