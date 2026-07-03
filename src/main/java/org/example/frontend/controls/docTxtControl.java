package org.example.frontend.controls;

import org.example.frontend.Entities.DocTxt;
import org.example.frontend.Entities.Erro;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("doc")
public class docTxtControl {
    //Endpoint para salvar o documento
    @PostMapping("salvar")
    public ResponseEntity<Object> salvarDoc(@RequestBody DocTxt docTxt, @RequestParam int id){
        if(SingletonDB.conectar()){
            docTxt.setApresentacao(docTxt.getApresentacao().getById(id));
            if(docTxt.getByIdApresentacao() != null){
                if(docTxt.atualizar()){
                    SingletonDB.desconectar();
                    return ResponseEntity.ok("");
                }
            }
            else{
                if(docTxt.gravar()){
                    SingletonDB.desconectar();
                    return ResponseEntity.ok("");
                }
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @DeleteMapping("deletar")
    public ResponseEntity<Object> deletarDoc(int id){
        if(SingletonDB.conectar()){
            DocTxt docTxt = new DocTxt();
            if(docTxt.deletar(id)){
                SingletonDB.desconectar();
                return ResponseEntity.ok("");
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("get-byIdAprese")
    public ResponseEntity<Object> getDocByIdApre(int id){
        if(SingletonDB.conectar()){
            DocTxt docTxt = new DocTxt();
            docTxt.setApresentacao(docTxt.getApresentacao().getById(id));
            docTxt = docTxt.getByIdApresentacao();
            if(docTxt != null){
                System.out.println(SingletonDB.desconectar());
                return ResponseEntity.ok(docTxt);
            }
        }
        System.out.println(SingletonDB.desconectar());
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("get-all")
    public ResponseEntity<Object> getAllDoc(){
        if(SingletonDB.conectar()){
            DocTxt docTxt = new DocTxt();
            List<DocTxt> docTxtList = docTxt.getAll();
            SingletonDB.desconectar();
            return ResponseEntity.ok(docTxtList);
        }
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }
}
