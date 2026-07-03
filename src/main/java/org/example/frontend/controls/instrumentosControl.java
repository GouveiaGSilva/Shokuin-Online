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

    @PostMapping("salvarImg")
    public ResponseEntity<Object> salvarImg(String instru_nome, MultipartFile imagem){
        String UPLOAD_FOLDER = "uploads";
        try {
            File uploadFolder = new File(UPLOAD_FOLDER);
            if (!uploadFolder.exists())
                uploadFolder.mkdir();
            imagem.transferTo(new File(uploadFolder.getAbsolutePath() + "\\" +instru_nome));
            return ResponseEntity.ok().body(instru_nome);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao armazenar o arquivo. " + e.getMessage());
        }
    }


    @PutMapping("atualizaInstrumento")
    public ResponseEntity<Object> atualizarInstrumento(@RequestBody Instrumentos i){
        SingletonDB.conectar();
        Instrumentos old = i.getInstrumentoById(i.getId());
        SingletonDB.desconectar();
        String oldImg = old != null ? old.getImg() : null;

        boolean nameChanged = old != null && i.getNome() != null && !old.getNome().equals(i.getNome());
        boolean imageUploaded = i.getImg() != null && !i.getImg().equals(oldImg);
        
        if (nameChanged && !imageUploaded && oldImg != null && !oldImg.isEmpty()) {
            String extensao = oldImg.contains(".") ? oldImg.substring(oldImg.lastIndexOf(".")) : "";
            String newImgName = i.getNome() + extensao;
            File oldFile = new File("uploads/" + oldImg);
            File newFile = new File("uploads/" + newImgName);
            if(oldFile.exists()){
                oldFile.renameTo(newFile);
            }
            i.setImg(newImgName);
        }
        SingletonDB.conectar();
        boolean flag = i.atualizarInstrumento();
        SingletonDB.desconectar();
        
        if(flag){
            if (imageUploaded && oldImg != null && !oldImg.isEmpty()) {
                File oldFile = new File("uploads/" + oldImg);
                if(oldFile.exists()){
                    oldFile.delete();
                }
            }
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
        String newImgName = null;

        if (oldImg != null && !oldImg.isEmpty()) {
            int dotIndex = oldImg.lastIndexOf(".");
            if (dotIndex > 0) {
                newImgName = oldImg.substring(0, dotIndex) + suffix + oldImg.substring(dotIndex);
            } else {
                newImgName = oldImg + suffix;
            }
        }

        boolean flag = instrumentos.excluirInstrumento(newName, newImgName);
        SingletonDB.desconectar();

        if (flag) {
            if (oldImg != null && !oldImg.isEmpty() && newImgName != null) {
                File oldFile = new File("uploads/" + oldImg);
                File newFile = new File("uploads/" + newImgName);
                if(oldFile.exists()){
                    oldFile.renameTo(newFile);
                }
            }
            return ResponseEntity.ok().body("Instrumento deletado.");
        }
        else
            return ResponseEntity.badRequest().body("Não foi possível deletar o Instrumento.");
    }

}
