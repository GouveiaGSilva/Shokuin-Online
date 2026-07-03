package org.example.frontend.controls;

import org.example.frontend.DAOS.MusicaDAO;
import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Musica;
import org.example.frontend.util.Conexao;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("apimusica")
public class musicaControl {

    MusicaDAO MusicaDAO = new MusicaDAO();

    @PostMapping("/cadmusicas")
    public ResponseEntity<Object> cadastrar(@RequestBody Musica musica) {
        System.out.println("Cadaando musica: " + musica.getNome());
        if(MusicaDAO.gravar(musica))
            return ResponseEntity.ok(musica);
        else
            return ResponseEntity.badRequest().body(new Erro("Musica nao cadastrada", ""));
    }

    @GetMapping("/listamusicas")
    public ResponseEntity<Object> getListaMusicas(){
        SingletonDB.conectar();
        List<Musica> musicaList = MusicaDAO.get("");
        SingletonDB.desconectar();
        if(!musicaList.isEmpty())
            return ResponseEntity.ok(musicaList);
        else
            return ResponseEntity.notFound().build();
    }

    @GetMapping("pesquisarmusica")
    public ResponseEntity<Object> getPesquisarMusica(@RequestParam String nome){
        SingletonDB.conectar();
        List<Musica> musicaList = MusicaDAO.get("musi_nome ILIKE '%"+nome+"%'");
        SingletonDB.desconectar();
        if(!musicaList.isEmpty())
            return ResponseEntity.ok(musicaList);
        else
            return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/deletarmusica/{id}")
    public ResponseEntity<Object> deletarMusica(@PathVariable int id){
        //System.out.println("este "+id);
        if(MusicaDAO.apagar(id))
            return ResponseEntity.ok().build();
        else
            return ResponseEntity.badRequest().body(new Erro("Erro ao deletar musica", ""));
    }

    @PutMapping("/atualizarmusica")
    public ResponseEntity<Object> atualizarMusica(@RequestBody Musica musica){
        System.out.println(musica.getNome());
        if(MusicaDAO.alterar(musica))
            return ResponseEntity.ok().build();
        else
            return ResponseEntity.badRequest().body(new Erro("Musica não alterada", ""));
    }

    @GetMapping("/quantidademusicas")
    public ResponseEntity<Integer> qtdeMusicas(){
        int qtde = MusicaDAO.getQtde();
        return ResponseEntity.ok(qtde);
    }
}
