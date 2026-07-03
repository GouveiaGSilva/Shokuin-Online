package org.example.frontend.controls;

import org.example.frontend.Entities.*;
import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("estoque")
public class EstoqueControl {
    @PostMapping("registrarEntrada")
    public ResponseEntity<Object> registrarEntrada(@RequestBody Estoque estoque){
        SingletonDB.conectar();
        Instrumentos i = estoque.getInstrumento();
        Fornecedor f = i.getFornecedor();
        if(i.validaIdNome() && f.validaId()) {
            if(estoque.getQuantidade() == 0){
                SingletonDB.desconectar();
                return ResponseEntity.badRequest().body(new Erro("Insira a quantidade.", "Erro"));
            }
            boolean flag = estoque.entrarEstoque();
            SingletonDB.desconectar();
            if (flag) {
                return ResponseEntity.ok().body(estoque);
            } else
                return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
        }
        else
            return ResponseEntity.badRequest().body(new Erro("Preencha os dados corretamento", "Dados inválidos"));
    }

    @PostMapping("registrarMovimento")
    public ResponseEntity<Object> registrarMovimento(int instru_id, @RequestBody Movimentacao m){
        SingletonDB.conectar();
        boolean flag = m.registrarMovimentacao(instru_id);
        SingletonDB.desconectar();
        if(flag){
            return ResponseEntity.ok().body(m);
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("getEstoqueId")
    public ResponseEntity<Object> getEstoqueById(int id){
        Estoque estoque = new Estoque();
        SingletonDB.conectar();
        estoque = estoque.getEstoqueById(id);
        SingletonDB.desconectar();
        return ResponseEntity.ok().body(estoque);
    }

    @GetMapping("getAll")
    public ResponseEntity<Object> getAll(){
        List<Estoque> listEstoque = new ArrayList<>();
        Estoque estoque = new Estoque();
        SingletonDB.conectar();
        listEstoque = estoque.getAll();
        SingletonDB.desconectar();
        return ResponseEntity.ok().body(listEstoque);
    }

    @PutMapping("registrarSaida")
    public ResponseEntity<Object> registrarSaida(@RequestBody Estoque estoque){
        SingletonDB.conectar();
        Instrumentos i = estoque.getInstrumento();
        Fornecedor f = i.getFornecedor();
        if(i.validaIdNome() && f.validaId()) {
            if(estoque.validaQuant()) {
                if(estoque.getQuantidade() == 0){
                    SingletonDB.desconectar();
                    return ResponseEntity.badRequest().body(new Erro("Insira a quantidade.", "Erro"));
                }
                boolean flag = estoque.retirarEstoque();
                SingletonDB.desconectar();
                if (flag)
                    return ResponseEntity.ok().body(estoque);
                else
                    return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
            }
            else {
                SingletonDB.desconectar();
                return ResponseEntity.badRequest().body(new Erro("Preencha os dados corretamente", "Estoque insuficiente"));
            }
        }
        else {
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body(new Erro("Preencha os dados corretamente", "Dados inválidos"));
        }
    }

    @GetMapping("get-mov-filter")
    public ResponseEntity<Object> getMovFilter(String dataIni, String dataFim, String tipo){
        if(SingletonDB.conectar()){
            Movimentacao m = new Movimentacao();
            List<Movimentacao> list = m.listarMovFilter(dataIni, dataFim, tipo);
            SingletonDB.desconectar();
            return ResponseEntity.ok().body(list);
        }
        else {
            Conexao con = SingletonDB.getConexao();
            Erro erro = new Erro(con.getMensagemErro(), "Erro");
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body(erro);
        }
    }

    @GetMapping("get-mov-antigo")
    public ResponseEntity<Object> getMovAntigo(){
        if(SingletonDB.conectar()){
            Movimentacao m = new Movimentacao();
            m = m.listarAntigo();
            SingletonDB.desconectar();
            if(m == null)
                return ResponseEntity.badRequest().body(new Erro("Nenhuma movimentação registrada", "Erro"));
            return ResponseEntity.ok().body(m);
        }
        else {
            Conexao con = SingletonDB.getConexao();
            Erro erro = new Erro(con.getMensagemErro(), "Erro");
            return ResponseEntity.badRequest().body(erro);
        }
    }

    @GetMapping("get-instrumento-filter")
    public ResponseEntity<Object> getInstrumentoFilter(String tipo, String filter){
        Instrumentos i = new Instrumentos();
        List<Instrumentos> list;
        SingletonDB.conectar();
        list = i.listarFiltro(tipo, filter);
        SingletonDB.desconectar();
        return ResponseEntity.ok().body(list);
    }

}