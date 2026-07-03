package org.example.frontend.controls;

import org.example.frontend.Entities.Agenda;
import org.example.frontend.Entities.Apresentacao;
import org.example.frontend.Entities.Erro;
import org.example.frontend.Entities.Local;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("apiagenda")
public class atualizarAgendaControl {

    @PostMapping("/cadagenda")
    public ResponseEntity<Object> cadastrarAgenda(
            @RequestParam String data,
            @RequestParam String horario,
            @RequestParam String cep,
            @RequestParam String estado,
            @RequestParam String cidade,
            @RequestParam String rua,
            @RequestParam String numero,
            @RequestParam String bairro,
            @RequestParam(required = false) String complemento,
            @RequestParam int idApresentacao
    ) {
        Local local = new Local(estado, cidade, bairro, rua, complemento, numero, cep);
        Apresentacao apresentacao = new Apresentacao(idApresentacao);
        Agenda agenda = new Agenda(local, data, horario, apresentacao);
        SingletonDB.conectar();
        if(agenda.gravar()) {
            apresentacao.atualizarStatus('A');
            SingletonDB.getConexao().desconectar();
            return ResponseEntity.ok(agenda);
        }else {
            String erro = SingletonDB.getConexao().getMensagemErro();
            SingletonDB.getConexao().desconectar();
            return ResponseEntity.badRequest().body(new Erro("Agenda nao cadastrada", erro));
        }
    }


    @GetMapping("/getagenda")
    public ResponseEntity<Object> getAgenda(){
        List<Agenda> lista = null;
        if(SingletonDB.conectar()) {
            Agenda agenda = new Agenda();
            lista = agenda.listaAgendas();
            SingletonDB.desconectar();
//            if(lista.isEmpty())
//                return ResponseEntity.badRequest().body(new Erro("Erro", "Nenhuma apresentação agendada"));
//            else
            return ResponseEntity.ok(lista);
        }
        else{
            SingletonDB.desconectar();
            String erro = SingletonDB.getConexao().getMensagemErro();
            return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
        }
    }

    @GetMapping("/getagendapordia")
    public ResponseEntity<Object> getAgendaDia(@RequestParam String dia){
        List<Agenda> lista = null;
        if(SingletonDB.conectar()){
            Agenda agenda = new Agenda();
            lista = agenda.listaAgendaPorDia(dia);
            SingletonDB.desconectar();
//            if(lista.isEmpty())
//                return ResponseEntity.badRequest().body(new Erro("Erro", "Nenhuma apresentação agendada"));
//            else
            return ResponseEntity.ok(lista);
        }
        else{
            SingletonDB.desconectar();
            String erro = SingletonDB.getConexao().getMensagemErro();
            return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
        }
    }

    @GetMapping("/getagendaporperiodo")
    public ResponseEntity<Object> getAgendaPeriodo(@RequestParam String inicio, @RequestParam String fim){
        List<Agenda> lista = null;
        if(SingletonDB.conectar()){
            Agenda agenda = new Agenda();
            lista = agenda.listaAgendaPorPeriodo(inicio, fim);
            SingletonDB.desconectar();
            return ResponseEntity.ok(lista);
        }
        else{
            SingletonDB.desconectar();
            String erro = SingletonDB.getConexao().getMensagemErro();
            return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
        }
    }

    @GetMapping("/getproximasagendas")
    public ResponseEntity<Object> getProximas(){
        List<Agenda> lista = null;
        if(SingletonDB.conectar()){
            Agenda agenda = new Agenda();
            lista = agenda.proximasAgendas();
            SingletonDB.desconectar();
//            if(lista.isEmpty())
//                return ResponseEntity.badRequest().body(new Erro("Aviso", "Nenhuma apresentação agendada"));
//            else
            return ResponseEntity.ok(lista);
        }
        else {
            SingletonDB.desconectar();
            String erro = SingletonDB.getConexao().getMensagemErro();
            return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
        }
    }

    @PutMapping("/atualizaagenda")
    public ResponseEntity<Object> atualizarAgenda(
            @RequestParam int id,
            @RequestParam String data,
            @RequestParam String horario,
            @RequestParam String cep,
            @RequestParam String estado,
            @RequestParam String cidade,
            @RequestParam String rua,
            @RequestParam String numero,
            @RequestParam String bairro,
            @RequestParam(required = false) String complemento,
            @RequestParam int idApresentacao
    ) {
        if(     !data.isBlank()
                && !horario.isBlank()
                && !cep.isBlank()
                && !estado.isBlank()
                && !cidade.isBlank()
                && !rua.isBlank()
                && !numero.isBlank()
                && !bairro.isBlank()
        ) {
            String erro;
            Local local = new Local(estado, cidade, bairro, rua, complemento, numero, cep);
            Apresentacao apresentacao = new Apresentacao(idApresentacao);
            Agenda agenda = new Agenda(id, local, data, horario, apresentacao);
            if (SingletonDB.conectar()) {
                if(agenda.checaDisponivel()) {
                    if (agenda.atualizar()) {
                        SingletonDB.getConexao().desconectar();
                        return ResponseEntity.ok(agenda);
                    } else {
                        erro = SingletonDB.getConexao().getMensagemErro();
                        SingletonDB.getConexao().desconectar();
                        return ResponseEntity.badRequest().body(new Erro("Agenda não atualizada", erro));
                    }
                }
                else
                    return ResponseEntity.badRequest().body(new Erro("Horário não disponivel", "Escolha outra data ou horário"));
            }
            erro = SingletonDB.getConexao().getMensagemErro();
            SingletonDB.desconectar();
            return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
        }
        else
            return ResponseEntity.badRequest().body(new Erro("Preencha todos os campos", "Campos obrigatórios não foram preenchidos"));
    }

    @DeleteMapping("/deletaragenda")
    public ResponseEntity<Object> deletarAgenda(@RequestParam int id) {
        String erro;
        Agenda agenda = new Agenda();
        agenda.setId(id);
        if(SingletonDB.conectar()) {
            agenda = agenda.getAgendaById(id);
            Apresentacao ap = agenda.getApresentacao();
            if(ap.atualizarStatus('N')) {
                if (agenda.deletar()) {
                    SingletonDB.getConexao().desconectar();
                    return ResponseEntity.ok(id);
                } else {
                    erro = SingletonDB.getConexao().getMensagemErro();
                    SingletonDB.getConexao().desconectar();
                    return ResponseEntity.badRequest().body(new Erro("Agenda não deletada", erro));
                }
            }else{
                erro = SingletonDB.getConexao().getMensagemErro();
                SingletonDB.getConexao().desconectar();
                return ResponseEntity.badRequest().body(new Erro("Agenda não deletada", erro));
            }
        }
        SingletonDB.desconectar();
        erro = SingletonDB.getConexao().getMensagemErro();
        return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
    }

    @PutMapping("/cancelaragenda")
    public ResponseEntity<Object> cancelarAgenda(@RequestParam int id) {
        String erro;
        if(SingletonDB.conectar()) {
            Apresentacao apresentacao = new Apresentacao(id);
            if (apresentacao.atualizarStatus('C')) {
                SingletonDB.getConexao().desconectar();
                return ResponseEntity.ok(id);
            } else {
                erro = SingletonDB.getConexao().getMensagemErro();
                SingletonDB.getConexao().desconectar();
                return ResponseEntity.badRequest().body(new Erro("Agenda não deletada", erro));
            }
        }
        SingletonDB.desconectar();
        erro = SingletonDB.getConexao().getMensagemErro();
        return ResponseEntity.badRequest().body(new Erro("Erro na conexão com o banco", erro));
    }

    @GetMapping("finalizar-agenda")
    public void finalizarAgenda(){
        Agenda agenda = new Agenda();
        if(SingletonDB.conectar()){
            agenda.finalizar();
        }
        SingletonDB.desconectar();
    }
}