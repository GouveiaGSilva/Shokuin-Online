package org.example.frontend;

import org.example.frontend.util.SingletonDB;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FrontEndApplication {

    public static void main(String[] args) {
        if (SingletonDB.conectar()) {
            SingletonDB.getConexao().desconectar();
            SpringApplication.run(FrontEndApplication.class, args);
        } else {
            System.out.println("Erro ao conectar no banco de dados. Verifique suas Variáveis de Ambiente (DB_URL, DB_USER, DB_PASSWORD).");
        }
    }
}
