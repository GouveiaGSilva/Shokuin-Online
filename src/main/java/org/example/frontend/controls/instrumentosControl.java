package org.example.frontend.controls;

import org.example.frontend.Entities.Estoque;
import org.example.frontend.Entities.Fornecedor;
import org.example.frontend.Entities.Instrumentos;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("apiInstrumento")
public class instrumentosControl {

    @PostMapping("cadastroInstrumento")
    public ResponseEntity<Object> addInstrumento(@RequestBody Instrumentos i){
        System.out.println(i.getFornecedor().getId());
        SingletonDB.conectar();
        boolean flag = i.cadastrarInstrumento();
        SingletonDB.desconectar();
        if(flag)
            return ResponseEntity.ok().body(i);
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @PutMapping("atualizaInstrumento")
    public ResponseEntity<Object> atualizarInstrumento(@RequestBody Instrumentos i){
        SingletonDB.conectar();
        boolean flag = i.atualizarInstrumento();
        SingletonDB.desconectar();
        
        if(flag){
            return ResponseEntity.ok().body(i);
        }
        else
            return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("listarInstrumentos")
    public ResponseEntity<Object> listarInstrumentos(String chave){
        Estoque e = new Estoque();
        SingletonDB.conectar();
        List<Estoque> lista = e.listarEstoque(chave);
        SingletonDB.desconectar();
        if (lista == null){
            lista = new ArrayList<>();
            return ResponseEntity.ok().body(lista);
        }
        else{
            return ResponseEntity.ok().body(lista);
        }
    }

    @GetMapping("getAllInstrumentos")
    public ResponseEntity<Object> getAll(){
        Estoque e = new Estoque();
        SingletonDB.conectar();
        List<Estoque> lista = e.listarAll();
        SingletonDB.desconectar();
        if (lista == null){
            lista = new ArrayList<>();
            return ResponseEntity.ok().body(lista);
        }
        else{
            return ResponseEntity.ok().body(lista);
        }
    }

    @GetMapping("getAllInstrumentosIncludeInactive")
    public ResponseEntity<Object> getAllIncludeInactive(){
        Instrumentos i = new Instrumentos();
        SingletonDB.conectar();
        List<Instrumentos> lista = i.listarAllIncludeInactive();
        SingletonDB.desconectar();
        if (lista == null){
            lista = new ArrayList<>();
            return ResponseEntity.ok().body(lista);
        }
        else{
            return ResponseEntity.ok().body(lista);
        }
    }

    @GetMapping("getAllInfo")
    public ResponseEntity<Object> getAllInfo(){
        Instrumentos i = new Instrumentos();
        SingletonDB.conectar();
        List<Instrumentos> lista = i.listarAllInfo();
        SingletonDB.desconectar();
        if (lista == null){
            lista = new ArrayList<>();
            return ResponseEntity.ok().body(lista);
        }
        else{
            return ResponseEntity.ok().body(lista);
        }
    }

    @GetMapping("getInstrumentos")
    public ResponseEntity<Object> getInstrumentoById(int id){
        Instrumentos i = new Instrumentos();
        SingletonDB.conectar();
        i = i.getInstrumentoById(id);
        SingletonDB.desconectar();
        return ResponseEntity.ok().body(i);
    }

    @GetMapping("getInstrumentosNome")
    public ResponseEntity<Object> getInstrumentoByNome(String nome){
        Instrumentos i = new Instrumentos();
        SingletonDB.conectar();
        i = i.getInstrumentoByNome(nome);
        SingletonDB.desconectar();
        if (i != null){
            return ResponseEntity.ok().body(i);
        }
        return ResponseEntity.ok().body(i);
    }

    @DeleteMapping("excluir-id")
    public ResponseEntity<Object> DeletarInstrumento(Instrumentos instrumentos){
        SingletonDB.conectar();
        Instrumentos old = instrumentos.getInstrumentoById(instrumentos.getId());
        
        if (old == null) {
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body("Instrumento não encontrado.");
        }

        String baseName = old.getNome();
        String oldImg = old.getImg();
        
        String suffix = "_Ex";
        int counter = 1;
        Instrumentos temp = new Instrumentos();
        while (temp.getInstrumentoByNome(baseName + suffix) != null) {
            suffix = "_Ex" + counter;
            counter++;
        }
        
        String newName = baseName + suffix;

        boolean flag = instrumentos.excluirInstrumento(newName, oldImg);
        SingletonDB.desconectar();

        if (flag) {
            return ResponseEntity.ok().body("Instrumento deletado.");
        }
        else
            return ResponseEntity.badRequest().body("Não foi possível deletar o Instrumento.");
    }

}
