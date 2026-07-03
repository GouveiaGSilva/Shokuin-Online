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
        Usuario u = verificarlogin(usuario, senha);
        if (u != null) {
            session.setAttribute("usuarioLogado", usuario);
            session.setAttribute("usuarioNivel", u.getUsu_nivel());
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
        
        Integer nivel = (Integer) session.getAttribute("usuarioNivel");
        if (nivel == null) nivel = 1;

        Map<String, Object> dadosUsuario = new HashMap<>();
        dadosUsuario.put("nome", usuarioLogado);
        dadosUsuario.put("nivel", nivel);

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

    private Usuario verificarlogin(String usuario, String senha) {
        Usuario u = new Usuario(usuario, senha);
        if("admin".equals(usuario) && "admin123".equals(senha)) {
            Usuario admin = new Usuario();
            admin.setNome("admin");
            admin.setUsu_nivel(3);
            return admin;
        } else if(SingletonDB.conectar()){
            return u.fazerLogin();
        }
        return null;
    }

}