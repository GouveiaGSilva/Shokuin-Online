package org.example.frontend.controls;

import org.example.frontend.Entities.Membro;
import org.example.frontend.Entities.Usuario;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("apiusuario")
public class CadastroUsuarioControl {

    @PostMapping("/cadusuario")
    public ResponseEntity<Object> cadastrarUsuario(
            @RequestParam String nomeMembro,
            @RequestParam String usuario,
            @RequestParam String senha,
            @RequestParam(defaultValue = "1") int nivel
    ) {
        SingletonDB.conectar();
        if (nomeMembro.isBlank() || usuario.isBlank() || senha.isBlank()) {
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body("Todos os campos devem ser preenchidos.");
        }
        Membro membro = new Membro();
        membro.setNome(nomeMembro);
        membro.setIdByNome();
        boolean membroExiste = membro.validarnome();
        if (!membroExiste) {
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body("Não foi possível realizar o cadastro: O membro '" + nomeMembro + "' não está registrado no sistema.");
        }
        Usuario novoUsuario = new Usuario(usuario, senha);
        novoUsuario.setMembro(membro);
        novoUsuario.setUsu_nivel(nivel);
        if(novoUsuario.existeUsuario()) {
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body("Não foi possível realizar o cadastro: Usuário já cadastrado.");
        }
        if(novoUsuario.existeCadstroMembro()){
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body("Não foi possível realizar o cadastro: Membro já possui um cadastro de usuário.");
        }
        boolean cadastrou = novoUsuario.cadastrarusuario();
        SingletonDB.desconectar();
        if (cadastrou) {
            return ResponseEntity.ok("Usuário registrado com sucesso!");
        } else {
            return ResponseEntity.badRequest().body("Ocorreu um erro interno no banco de dados ao tentar criar as credenciais do usuário.");
        }
    }
}