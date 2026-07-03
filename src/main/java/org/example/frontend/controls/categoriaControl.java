package org.example.frontend.controls;

import org.example.frontend.Entities.Categoria;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("categoria")
public class categoriaControl {
    @GetMapping("get-all")
    public ResponseEntity<Object> getAll(){
        if(SingletonDB.conectar()){
            Categoria c = new Categoria();
            List<Categoria> list = c.listarTodos();
            SingletonDB.desconectar();
            return ResponseEntity.ok().body(list);
        }
        else
            return ResponseEntity.badRequest().body("Erro: " + SingletonDB.getConexao().getMensagemErro());
    }
}
