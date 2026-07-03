package org.example.frontend.controls;

import org.example.frontend.Entities.Musica;
import org.example.frontend.Entities.MusicaRelatorio;
import org.example.frontend.util.SingletonDB;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("apirelmusica")
public class RelatorioMusicaControl {

    MusicaRelatorio relatorio = new MusicaRelatorio();
    List<MusicaRelatorio> relatorios;

    private void quickSort(int ini, int fim){
        MusicaRelatorio aux;
        int i = ini, j = fim;
        int pivo = relatorios.get((ini + fim) / 2).getTotalExecucoes();
        while (i <= j) {
            while (relatorios.get(i).getTotalExecucoes() > pivo)
                i++;
            while (relatorios.get(j).getTotalExecucoes() < pivo)
                j--;
            if (i <= j) {
                aux = relatorios.get(i);
                relatorios.set(i, relatorios.get(j));
                relatorios.set(j, aux);
                i++;
                j--;
            }
        }
        if (ini < j)
            quickSort(ini, j);
        if (i < fim)
            quickSort(i, fim);
    }

    @GetMapping("/listamusicas/maistocadas/pordata")
    public ResponseEntity<Object> getMusicasMaisTocadas(
            @RequestParam String dataInicio,
            @RequestParam String dataFim
    ){
        SingletonDB.conectar();
        relatorios = relatorio.getRelatorioPorData(dataInicio, dataFim);
        if (!relatorios.isEmpty()){
            quickSort(relatorios.indexOf(relatorios.getFirst()), relatorios.indexOf(relatorios.getLast()));
            SingletonDB.desconectar();
            return ResponseEntity.ok(relatorios);
        }else{
            SingletonDB.desconectar();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/listamusicas/10maistocadas/pordata")
    public ResponseEntity<Object> get10MusicasMaisTocadas(
            @RequestParam String dataInicio,
            @RequestParam String dataFim
    ){
        SingletonDB.conectar();
        relatorios = relatorio.getRelatorioPorData(dataInicio, dataFim);
        if (!relatorios.isEmpty()){
            quickSort(relatorios.indexOf(relatorios.getFirst()), relatorios.indexOf(relatorios.getLast()));
            List<MusicaRelatorio> relatorioFiltrado = new ArrayList<>();
            for (int i = 0; i < relatorios.size() && i < 10; i++) {
                relatorioFiltrado.add(relatorios.get(i));
            }
            SingletonDB.desconectar();
            return ResponseEntity.ok(relatorioFiltrado);
        }else{
            SingletonDB.desconectar();
            return ResponseEntity.notFound().build();
        }
    }
}
