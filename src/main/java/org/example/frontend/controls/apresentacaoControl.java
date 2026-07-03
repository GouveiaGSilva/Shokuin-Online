package org.example.frontend.controls;

import org.example.frontend.Entities.Apresentacao;
import org.example.frontend.Entities.Membro;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("apresentacao")
public class apresentacaoControl {

    @PostMapping("gravar")
    public ResponseEntity<Object> gravarApresentacao(@RequestBody Apresentacao apresentacao, @RequestParam int id){
        if(SingletonDB.conectar()){
            if(apresentacao.getById(id) != null){
                if(apresentacao.atualizar(id)){
                    SingletonDB.desconectar();
                    return ResponseEntity.ok(apresentacao);
                }
            }
            else
            if(apresentacao.gravar()){
                SingletonDB.desconectar();
                return ResponseEntity.ok(apresentacao);
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("");
    }

    @PutMapping("atualizar")
    public ResponseEntity<Object> atualizarApresentacao(@RequestBody Apresentacao apresentacao, @RequestParam int id){
        if(SingletonDB.conectar()){
            if(apresentacao.atualizar(id)){
                SingletonDB.desconectar();
                return ResponseEntity.ok(apresentacao);
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("");
    }

    @DeleteMapping("excluir")
    public ResponseEntity<Object> excluirApresentação(int id){
        if(SingletonDB.conectar()){
            Apresentacao apresentacao = new Apresentacao();
            if(apresentacao.deletar(id)){
                SingletonDB.desconectar();
                return ResponseEntity.ok("");
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("");
    }

    @GetMapping("get-byId")
    public ResponseEntity<Object> getById(int id){
        if(SingletonDB.conectar()){
            Apresentacao apresentacao = new Apresentacao();
            Apresentacao apre =  apresentacao.getById(id);
            if(apre != null){
                SingletonDB.desconectar();
                return ResponseEntity.ok(apre);
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("");
    }

    @GetMapping("get-byNome")
    public ResponseEntity<Object> getByNome(String nome){
        if(SingletonDB.conectar()){
            Apresentacao apresentacao = new Apresentacao();
            Apresentacao apre = apresentacao.getByNome(nome);
            if(apre != null){
                SingletonDB.desconectar();
                return ResponseEntity.ok(apre);
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("");
    }

    @GetMapping("get-all")
    public ResponseEntity<Object> getAll(){
        if(SingletonDB.conectar()) {
            Apresentacao apr = new Apresentacao();
            List<Apresentacao> list = apr.getAll();
            SingletonDB.desconectar();
            return ResponseEntity.ok().body(list);
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("get-all-sem-agenda")
    public ResponseEntity<Object> getAllSemAgenda(){
        if(SingletonDB.conectar()) {
            Apresentacao apr = new Apresentacao();
            List<Apresentacao> list = apr.getAllSemAgenda();
            SingletonDB.desconectar();
            return ResponseEntity.ok().body(list);
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("membros-vinculados")
    public ResponseEntity<Object> getMembrosVinculados(@RequestParam int id) {
        if(SingletonDB.conectar()) {
            Apresentacao apr = new Apresentacao();
            List<Integer> list = apr.getMembrosVinculados(id);
            SingletonDB.desconectar();
            return ResponseEntity.ok().body(list);
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("membro-vinculados")
    public ResponseEntity<Object> MembrosVinculados(@RequestParam int id) {
        if(SingletonDB.conectar()) {
            Apresentacao apr = new Apresentacao(id);
            List<Membro> list = apr.getMembrosVinculados();
            SingletonDB.desconectar();
            return ResponseEntity.ok().body(list);
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }


    @PostMapping("salvar-membros")
    public ResponseEntity<Object> salvarMembrosVinculados(@RequestParam int id, @RequestBody List<Integer> membrosIds) {
        if(SingletonDB.conectar()) {
            Apresentacao apr = new Apresentacao();
            boolean success = apr.salvarMembrosVinculados(id, membrosIds);
            SingletonDB.desconectar();
            if (success) {
                return ResponseEntity.ok().body("Membros vinculados com sucesso.");
            } else {
                return ResponseEntity.badRequest().body("Erro ao vincular membros.");
            }
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }
}