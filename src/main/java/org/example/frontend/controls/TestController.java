package org.example.frontend.controls;

import org.example.frontend.util.SingletonDB;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class TestController {
    @GetMapping("/testdb")
    public List<Map<String, Object>> testDb() {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            SingletonDB.conectar();
            ResultSet rs = SingletonDB.getConexao().consultar("SELECT * FROM estoque");
            ResultSetMetaData md = rs.getMetaData();
            int columns = md.getColumnCount();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columns; ++i) {
                    row.put(md.getColumnName(i), rs.getObject(i));
                }
                result.add(row);
            }
            SingletonDB.desconectar();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
}
