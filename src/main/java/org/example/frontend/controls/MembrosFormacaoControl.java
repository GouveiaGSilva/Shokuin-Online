package org.example.frontend.controls;

import org.example.frontend.Entities.Membro;
import org.example.frontend.Entities.MembrosFormacao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/membros-formacao")
public class MembrosFormacaoControl {

    @GetMapping("/{idFormacao}")
    public ResponseEntity<List<Membro>> buscarMembrosDaFormacao(@PathVariable int idFormacao) {
        try {
            List<Membro> membros = MembrosFormacao.buscarMembrosDaFormacao(idFormacao);
            return ResponseEntity.ok(membros);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/salvar")
    public ResponseEntity<String> salvarMembrosPool(@RequestParam int idFormacao, @RequestBody List<Integer> idMembros) {
        try {
            boolean sucesso = MembrosFormacao.salvarMembrosPool(idFormacao, idMembros);
            if (sucesso) {
                return ResponseEntity.ok("Membros da formação atualizados com sucesso.");
            } else {
                return ResponseEntity.badRequest().body("Falha ao atualizar membros da formação.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro interno no servidor.");
        }
    }
}
