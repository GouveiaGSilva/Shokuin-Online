package org.example.frontend.controls;


import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Formacao;
import org.example.frontend.Entities.Membro;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("formacao")
public class formacaoControl {

    @PostMapping("/salvar-formacao")
    public ResponseEntity<Object> cadastrar(@RequestBody Formacao formacao) {
        SingletonDB.conectar();
        boolean flag = formacao.salvarFormacao();
        SingletonDB.desconectar();
        if (flag) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro SQL", SingletonDB.getConexao().getMensagemErro()));
        }
    }

    @PostMapping("/salvar-instrumentos-formacao")
    public ResponseEntity<Object> salvarInstrumentos(@RequestBody Formacao formacao) {
        SingletonDB.conectar();
        boolean flag = formacao.salvarInstrumentos();
        SingletonDB.desconectar();
        if (flag) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro SQL", SingletonDB.getConexao().getMensagemErro()));
        }
    }

    @PutMapping("atualizar-formacao")
    public ResponseEntity<Object> atualizarFormacao(@RequestBody Formacao formacao) {
        SingletonDB.conectar();
        boolean flag = formacao.atualizarFormacao();
        SingletonDB.desconectar();

        if (flag) {
            return ResponseEntity.ok().body(formacao);
        } else {
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
        }
    }

    @GetMapping("get-tocadores")
    public ResponseEntity<Object> getTocadores(int idFormacao){
        if(SingletonDB.conectar()){
            Formacao formacao = new Formacao();
            List<Membro> membroList = formacao.getTocadores(idFormacao);
            return ResponseEntity.ok(membroList);
        }
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("/buscar-formacao/{id}")
    public ResponseEntity<Object> buscar(@PathVariable int id) {
        SingletonDB.conectar();
        Formacao formacao = new Formacao().buscarPorId(id);
        SingletonDB.desconectar();

        if (formacao != null) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro", "Formação não encontrada."));
        }
    }

    @GetMapping("/buscar-formacao-nome")
    public ResponseEntity<Object> buscar(String nome) {
        SingletonDB.conectar();
        Formacao formacao = new Formacao().getFormacaoByNome(nome);
        SingletonDB.desconectar();
        if (formacao != null) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro", "Formação não encontrada."));
        }
    }

    @GetMapping("/listar-todas")
    public ResponseEntity<Object> listar() {
        SingletonDB.conectar();
        List<Formacao> lista = new Formacao().listarTodas();
        SingletonDB.desconectar();

        if (lista != null && !lista.isEmpty()) {
            return ResponseEntity.ok(lista);
        } else {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping(value = "/capa/{id}", produces = "text/plain")
    public ResponseEntity<String> getCapa(@PathVariable int id) {
        SingletonDB.conectar();
        String capa = new Formacao().buscarCapa(id);
        SingletonDB.desconectar();

        if (capa != null && !capa.isEmpty()) {
            return ResponseEntity.ok(capa);
        } else {
            return ResponseEntity.ok("");
        }
    }

    @DeleteMapping("excluir-id")
    public ResponseEntity<Object> deletarFormacao(@RequestBody Formacao formacao) {
        SingletonDB.conectar();
        boolean flag = formacao.deletarFormacao();
        SingletonDB.desconectar();

        if (flag) {
            return ResponseEntity.ok().body("Formação deletada com sucesso.");
        } else {
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
        }
    }
}
