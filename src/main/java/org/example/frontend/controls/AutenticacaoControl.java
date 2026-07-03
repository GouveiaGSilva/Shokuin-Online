package org.example.frontend.controls;

import org.example.frontend.Entities.Cargo;
import org.example.frontend.Entities.Membro;
import org.example.frontend.Entities.Usuario;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("apiautenticacao")
public class AutenticacaoControl {

    @PostMapping("/login")
    public ResponseEntity<Boolean> realizarLogin(@RequestParam String usuario, @RequestParam String senha, HttpSession session) {
        boolean valido = verificarlogin(usuario, senha);
        if (valido) {
            session.setAttribute("usuarioLogado", usuario);
            return ResponseEntity.ok(true);
        }
        return ResponseEntity.ok(false);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> realizarLogout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Sessão encerrada.");
    }

    @GetMapping("/usuario-atual")
    public ResponseEntity<Object> obterUsuarioAtual(HttpSession session) {
        String usuarioLogado = (String) session.getAttribute("usuarioLogado");
        if (usuarioLogado == null) {
            return ResponseEntity.status(401).body("Nenhum usuário conectado.");
        }
        SingletonDB.conectar();
        //String nomeCargo = listarcargo(usuarioLogado);
        SingletonDB.desconectar();
        Map<String, String> dadosUsuario = new HashMap<>();
        dadosUsuario.put("nome", usuarioLogado);
        //dadosUsuario.put("cargo", nomeCargo);

        return ResponseEntity.ok(dadosUsuario);
    }

    private String listarcargo(String usuario) {
        if(usuario.equals("admin"))
            return "Membro Verificado";
        Usuario u = new Usuario();
        u.setNome(usuario);
        Membro m = u.getIdMembro();
        Cargo c = new Cargo();
        String cargo = c.getNomeCargoByMembroId(m.getId());
        return cargo;
    }

    private boolean verificarlogin(String usuario, String senha) {
        Usuario u = new Usuario(usuario, senha);
        if("admin".equals(usuario) && "admin123".equals(senha))
            return true;
        else if(SingletonDB.conectar()){
            return u.validarDados();
        }
        return false;
    }

}