package org.example.frontend.controls;


import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Formacao;
import org.example.frontend.Entities.Membro;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("formacao")
public class formacaoControl {

    @PostMapping("/salvarImg")
    public ResponseEntity<Object> salvarImg(String forma_img, MultipartFile imagem){
        String UPLOAD_FOLDER = "uploads/formacoes";
        try {
            File uploadFolder = new File(UPLOAD_FOLDER);
            if (!uploadFolder.exists())
                uploadFolder.mkdirs();
            imagem.transferTo(new File(uploadFolder.getAbsolutePath() + "/" + forma_img));
            return ResponseEntity.ok().body(forma_img);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao armazenar o arquivo. " + e.getMessage());
        }
    }

    @PostMapping("/salvar-formacao")
    public ResponseEntity<Object> cadastrar(@RequestBody Formacao formacao) {
        SingletonDB.conectar();
        boolean flag = formacao.salvarFormacao();
        SingletonDB.desconectar();
        if (flag) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro SQL", SingletonDB.getConexao().getMensagemErro()));
        }
    }

    @PostMapping("/salvar-instrumentos-formacao")
    public ResponseEntity<Object> salvarInstrumentos(@RequestBody Formacao formacao) {
        SingletonDB.conectar();
        boolean flag = formacao.salvarInstrumentos();
        SingletonDB.desconectar();
        if (flag) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro SQL", SingletonDB.getConexao().getMensagemErro()));
        }
    }

    @PutMapping("/atualizar-formacao")
    public ResponseEntity<Object> atualizar(@RequestBody Formacao formacao) {
        if (formacao.getId() == null || formacao.getId() <= 0) {
            return ResponseEntity.badRequest().body(new Erro("Erro", "ID da formação é necessário para atualizar."));
        }

        SingletonDB.conectar();
        Formacao old = new Formacao().buscarPorId(formacao.getId());
        SingletonDB.desconectar();
        String oldImg = old != null ? old.getImagem() : null;

        SingletonDB.conectar();
        boolean flag = formacao.atualizarFormacao();
        SingletonDB.desconectar();
        if (flag) {
            // Se a imagem mudou, exclui a antiga do disco
            if (formacao.getImagem() != null && !formacao.getImagem().equals(oldImg) && oldImg != null && !oldImg.isEmpty()) {
                File oldFile = new File("uploads/formacoes/" + oldImg);
                if(oldFile.exists()){
                    oldFile.delete();
                }
            }
            return ResponseEntity.ok(formacao);
        } else {
            String erroSql = SingletonDB.getConexao().getMensagemErro();
            return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar", erroSql));
        }
    }

    @GetMapping("get-tocadores")
    public ResponseEntity<Object> getTocadores(int idFormacao){
        if(SingletonDB.conectar()){
            Formacao formacao = new Formacao();
            List<Membro> membroList = formacao.getTocadores(idFormacao);
            return ResponseEntity.ok(membroList);
        }
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    @GetMapping("/buscar-formacao/{id}")
    public ResponseEntity<Object> buscar(@PathVariable int id) {
        SingletonDB.conectar();
        Formacao formacao = new Formacao().buscarPorId(id);
        SingletonDB.desconectar();

        if (formacao != null) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro", "Formação não encontrada."));
        }
    }

    @GetMapping("/buscar-formacao-nome")
    public ResponseEntity<Object> buscar(String nome) {
        SingletonDB.conectar();
        Formacao formacao = new Formacao().getFormacaoByNome(nome);
        SingletonDB.desconectar();
        if (formacao != null) {
            return ResponseEntity.ok(formacao);
        } else {
            return ResponseEntity.badRequest().body(new Erro("Erro", "Formação não encontrada."));
        }
    }

    @GetMapping("/listar-todas")
    public ResponseEntity<Object> listar() {
        SingletonDB.conectar();
        List<Formacao> lista = new Formacao().listarTodas();
        SingletonDB.desconectar();

        if (lista != null && !lista.isEmpty()) {
            return ResponseEntity.ok(lista);
        } else {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @DeleteMapping("/excluir-id")
    public ResponseEntity<Object> deletarFormacao(@RequestBody Formacao formacao){
        SingletonDB.conectar();
        Formacao old = new Formacao().buscarPorId(formacao.getId());
        boolean flag = formacao.deletarFormacao();
        SingletonDB.desconectar();
        
        if (flag) {
            String oldImg = old != null ? old.getImagem() : null;
            if (oldImg != null && !oldImg.isEmpty()) {
                File oldFile = new File("uploads/formacoes/" + oldImg);
                if(oldFile.exists()){
                    oldFile.delete();
                }
            }
            return ResponseEntity.ok().body("Formacão deletada.");
        }
        else
            return ResponseEntity.badRequest().body("Não foi possível deletar a Formação.");
    }

}













