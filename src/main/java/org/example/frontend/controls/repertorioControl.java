package org.example.frontend.controls;

import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Formacao;
import org.example.frontend.Entities.Musica;
import org.example.frontend.Entities.Repertorio;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import static java.lang.Integer.parseInt;

@RestController
@RequestMapping("apirepertorio")
public class repertorioControl {

    @PostMapping("cadrepertorio")
    public ResponseEntity<Object> cadastrarRepertorio(
            @RequestParam int idApresentacao,
            @RequestParam List<Integer> listaMusica,
            @RequestParam List<Integer> listaFormacao
    ){
        List<Musica> listaMusicaRepertorio = new ArrayList<>();
        List<Formacao> listaFormacaoRepertorio = new ArrayList<>();
        for (int i = 0; i < listaFormacao.size(); i++) {
            Musica musica = new Musica(listaMusica.get(i));
            listaMusicaRepertorio.add(musica);
            Formacao formacao = new Formacao(listaFormacao.get(i));
            listaFormacaoRepertorio.add(formacao);
        }
        Repertorio repertorio = new Repertorio(idApresentacao,  listaMusicaRepertorio, listaFormacaoRepertorio);
        SingletonDB.conectar();
        if(repertorio.gravar()){
            SingletonDB.desconectar();
            return ResponseEntity.ok(repertorio);
        }else{
            String erro = SingletonDB.getConexao().getMensagemErro();
            SingletonDB.getConexao().desconectar();
            return ResponseEntity.badRequest().body(new Erro("Repertório não cadastrado", erro));
        }
    }

    @GetMapping("get")
    public ResponseEntity<Object> getRepertorio(@RequestParam int idApresentacao){
        Repertorio repertorio = new Repertorio(idApresentacao);
        SingletonDB.conectar();
        if(repertorio.getById()){
            SingletonDB.desconectar();
            return ResponseEntity.ok(repertorio);
        }else{
            String erro = SingletonDB.getConexao().getMensagemErro();
            SingletonDB.getConexao().desconectar();
            return ResponseEntity.badRequest().body(new Erro("Repertório não encontrado", erro));

        }
    }

    @GetMapping("getApresentacao")
    public ResponseEntity<Object> getApresentacao(int id){
        if(SingletonDB.conectar()){
            Repertorio repertorio = new Repertorio();
            if(repertorio.getApresentacao(id)){
                SingletonDB.desconectar();
                return ResponseEntity.ok("");
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("");
    }

    @PutMapping("atualizarepertorio")
    public ResponseEntity<Object> atualizarRepertorio(
            @RequestParam int idApresentacao,
            @RequestParam List<Integer> listaMusica,
            @RequestParam List<Integer> listaFormacao
    ){
        List<Musica> listaMusicaRepertorio = new ArrayList<>();
        List<Formacao> listaFormacaoRepertorio = new ArrayList<>();
        for (int i = 0; i < listaFormacao.size(); i++) {
            Musica musica = new Musica(listaMusica.get(i));
            listaMusicaRepertorio.add(musica);
            Formacao formacao = new Formacao(listaFormacao.get(i));
            listaFormacaoRepertorio.add(formacao);
        }
        Repertorio repertorio = new Repertorio(idApresentacao,  listaMusicaRepertorio, listaFormacaoRepertorio);
        SingletonDB.conectar();
        if(repertorio.deletar()){
            if(repertorio.gravar()){
                SingletonDB.desconectar();
                return ResponseEntity.ok(repertorio);
            }else{
                String erro = SingletonDB.getConexao().getMensagemErro();
                SingletonDB.getConexao().desconectar();
                return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar", erro));
            }
        }else{
            String erro = SingletonDB.getConexao().getMensagemErro();
            SingletonDB.getConexao().desconectar();
            return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar", erro));
        }
    }

}