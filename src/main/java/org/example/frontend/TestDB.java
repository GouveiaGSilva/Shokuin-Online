package org.example.frontend;

import org.example.frontend.util.SingletonDB;

public class TestDB {
    public static void main(String[] args) {
        System.out.println("URL: " + SingletonDB.getDbUrl());
        System.out.println("Name: " + SingletonDB.getDbName());
        System.out.println("User: " + SingletonDB.getDbUser());
        System.out.println("Pass: " + SingletonDB.getDbPassword());
        
        boolean connected = SingletonDB.conectar();
        System.out.println("Connected: " + connected);
        System.out.println("Error: " + SingletonDB.getConexao().getMensagemErro());
    }
}
