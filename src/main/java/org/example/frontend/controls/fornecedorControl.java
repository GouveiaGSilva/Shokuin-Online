package org.example.frontend.controls;

import org.example.frontend.Entities.Endereco;
import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Fornecedor;
import org.example.frontend.Entities.Misto;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("fornecedores")

public class fornecedorControl{
    //Endpoint de cadastro do fornecedor
    @PostMapping("cadastrar")
    public ResponseEntity<Object> cadastrarFornecedor(@RequestBody Misto misto){
        if(SingletonDB.conectar()){
            if(misto.getFornecedor().getCnpj().length() == 18 && misto.getEndereco().getCep().length() == 9){
                Fornecedor fornecedor = misto.getFornecedor();
                Endereco endereco = misto.getEndereco();
                fornecedor.setEndereco(endereco.getEndereco());
                if(fornecedor.cadastrarFornecedor()){
                    SingletonDB.desconectar();
                    return ResponseEntity.ok("Fornecedor cadastrado com sucesso!");
                }
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("Não foi possível cadastrar o fornecedor!\nTente novamente mais tarde!");
    }

    //Endpoint de listar fornecedores
    @GetMapping("listar")
    public ResponseEntity<Object> listarFornecedores(String keyword){
        if(SingletonDB.conectar()){
            Fornecedor fornecedor = new Fornecedor();
            List<Fornecedor> listaFornecedores = fornecedor.listarFornecedores(keyword);
            if(!listaFornecedores.isEmpty()){
                SingletonDB.desconectar();
                return ResponseEntity.ok(listaFornecedores);
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    //Endpoint de excluir fornecedor pelo id
    @DeleteMapping("excluir")
    public ResponseEntity<Object> excluirFornecedor(int id){
        if(SingletonDB.conectar()){
            Fornecedor fornecedor = new Fornecedor();
            if(fornecedor.excluirById(id)){
                SingletonDB.desconectar();
                return ResponseEntity.ok(fornecedor);
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }

    //Endpoint de atualizar fornecedor
    @PutMapping("atualizar")
    public ResponseEntity<Object> atualizarFornecedor(@RequestBody Misto misto){
        if(SingletonDB.conectar()){
            if(misto.getFornecedor().getCnpj().length() == 18 && misto.getEndereco().getCep().length() == 9){
                Fornecedor fornecedor = misto.getFornecedor();
                Endereco endereco = misto.getEndereco();
                fornecedor.setEndereco(endereco.getEndereco());
                if(fornecedor.atualizar()){
                    SingletonDB.desconectar();
                    return ResponseEntity.ok("Fornecedor alterado com sucesso!");
                }
            }
        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body("Não foi possivel alterar o fornecedor!\nTente novamente mais tarde");
    }

    //Endpoint de buscar um fornecedor pelo id
    @GetMapping("get-id")
    public ResponseEntity<Object> getFornecedor(int id){
        if(SingletonDB.conectar()){
            Fornecedor fornecedor = new Fornecedor();
            fornecedor = fornecedor.getById(id);
            if(fornecedor != null){
                SingletonDB.desconectar();
                return ResponseEntity.ok(fornecedor);
            }

        }
        SingletonDB.desconectar();
        return ResponseEntity.badRequest().body(SingletonDB.getConexao().getMensagemErro());
    }
}