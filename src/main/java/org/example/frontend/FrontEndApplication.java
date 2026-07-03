package org.example.frontend;

import org.example.frontend.util.SingletonDB;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.swing.*;

@SpringBootApplication
public class FrontEndApplication {

    public static void main(String[] args) {
        if(SingletonDB.conectar()) {
            SingletonDB.getConexao().manipular("CREATE OR REPLACE FUNCTION fn_verifica_data_agenda() RETURNS TRIGGER AS $$ BEGIN IF NEW.agenda_data < CURRENT_DATE THEN RAISE EXCEPTION 'Dia do evento anterior ao dia de hoje' USING ERRCODE = 'P0001'; ELSIF NEW.agenda_data = CURRENT_DATE AND NEW.agenda_horario <= CURRENT_TIME THEN RAISE EXCEPTION 'Horario do evento anterior ao horario atual'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;");
            
            SingletonDB.getConexao().desconectar();
            SpringApplication.run(FrontEndApplication.class, args);
        }
        else{
            if(SingletonDB.criarDatabase("shokuintaiko","postgres","postgres123")) {
                System.out.println("Database criado com sucesso");
                //restaurar o script
                SingletonDB.criarTabelas("src/main/resources/static/db/criacaotabelas.sql","shokuintaiko");
                if(SingletonDB.conectar())
                    SpringApplication.run(FrontEndApplication.class, args);
            }
            else
                System.out.println("Erro ao criar database");
        }
    }
}
