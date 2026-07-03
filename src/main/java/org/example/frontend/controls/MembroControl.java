package org.example.frontend.controls;

import org.example.frontend.Entities.Cargo;
import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Musica;
import org.example.frontend.Entities.Membro;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("apimembro")
public class MembroControl {

        @PostMapping("/cadmembro")
        public ResponseEntity<Object> cadastrarMembro(@RequestBody Membro membro) {
            SingletonDB.conectar();
            if (membro.cadastrar()) {
                SingletonDB.desconectar();
                return ResponseEntity.ok(membro);
            } else {
                SingletonDB.desconectar();
                return ResponseEntity.badRequest().body(new Erro("Erro SQL", SingletonDB.getConexao().getMensagemErro()));
            }
        }
    @GetMapping("/get-membro")
    public ResponseEntity<Object> getMembro(@RequestParam(required = false, defaultValue = "") String keyword) {
        Membro membro = new Membro();
        keyword = keyword.toUpperCase();
        List<Membro> lista = membro.listarMembros(keyword);

        if(lista == null || lista.isEmpty()) {
            // Retornar OK mesmo se estiver vazio é melhor para o front-end,
            // assim o Javascript não cai no bloco .catch() de erro, e renderiza a tabela vazia bonitinha.
            return ResponseEntity.ok().body(lista);
        }

        return ResponseEntity.ok().body(lista);
    }
    
    @GetMapping("/get-membro/{id}")
    public ResponseEntity<Object> getMembroPorId(@PathVariable int id) {
        Membro membro = new Membro();
        Membro membroBusca = membro.buscarPorId(id);
        if (membroBusca != null) {
            return ResponseEntity.ok().body(membroBusca);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
        @DeleteMapping("/excluirMembro/{id}")
        public ResponseEntity<Object> deletarMembro(@PathVariable int id){

            Membro membro = new Membro();
            membro.setId(id);

            if(membro.deletarMembro())
                return ResponseEntity.ok().body("Membro deletado com sucesso.");
            else
                return ResponseEntity.badRequest().body("Não foi possível deletar o membro.");
        }

    @PutMapping("/atualizarMembro")
    public ResponseEntity<Object> atualizarMembro(@RequestBody Membro membro) {
        System.out.println(membro.getNome());
        if(membro.alterar(membro))
            return ResponseEntity.ok().build();
        else
            return ResponseEntity.badRequest().body(new Erro("Membro não alterado", ""));
    }

    @GetMapping("/quantidademembros")
    public ResponseEntity<Integer> qtdeMembros(){
        Membro membros = new Membro();
        int qtde = membros.getQtde();
        return ResponseEntity.ok(qtde);
    }

}





