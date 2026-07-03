package org.example.frontend.controls;

import org.apache.coyote.Response;
import org.example.frontend.Entities.Cargo;
import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("cargos")
public class cargoControl {
    @PostMapping("cadastrar-cargo")
    public ResponseEntity<Object> cadastrarCargo(String cargo, String funcao){
        Cargo c = new Cargo(cargo, funcao);
        if (cargo.isBlank() || funcao.isBlank()) {
            return ResponseEntity.badRequest().body("Preencha todos os campos.");
        }
        else if(SingletonDB.conectar()) {
            if (c.cadastrarCargo()) {
                SingletonDB.desconectar();
                return ResponseEntity.ok().body("Cargo cadastrado.");
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @PutMapping("atualizar-cargo")
    public ResponseEntity<Object> atualizarCargo(@RequestParam int id, String cargo, String funcao){
        Cargo c = new Cargo(id, cargo, funcao);
        if(cargo.isBlank() || funcao.isBlank() || cargo.isEmpty() || funcao.isEmpty())
            return ResponseEntity.badRequest().body("Preencha todos os campos");
        else if(SingletonDB.conectar()) {
            if (c.atualizarCargo()) {
                SingletonDB.desconectar();
                return ResponseEntity.ok().body("Cargo atualizado.");
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("get-cargos")
    public ResponseEntity<Object> getCargos(String keyword){
        Cargo c = new Cargo();
        List<Cargo> lista = null;
        if(SingletonDB.conectar()) {
            lista = c.listarCargos(keyword);
            SingletonDB.desconectar();
        }
        if(lista == null)
            return ResponseEntity.badRequest().body("Nenhum cargo cadastrado.");
        return ResponseEntity.ok().body(lista);
    }

    @GetMapping("get-cargo-id")
    public ResponseEntity<Object> getCargoById(@RequestParam int id){
        Cargo c = new Cargo();
        if(SingletonDB.conectar()) {
            c = c.getCargoById(id);
            SingletonDB.desconectar();
        }
        if(c == null)
            return ResponseEntity.badRequest().body("Cargo não encontrado");
        return ResponseEntity.ok().body(c);
    }

    @DeleteMapping("excluir-cargo")
    public ResponseEntity<Object> deletarCargo(@RequestBody Cargo c){
        if(SingletonDB.conectar()){
            if(c.deletarCargo()) {
                SingletonDB.desconectar();
                return ResponseEntity.ok().body("Cargo deletado.");
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("Não foi possível deletar o cargo.");
    }
}
