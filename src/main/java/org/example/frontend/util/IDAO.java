package org.example.frontend.util;

import java.util.List;

public interface IDAO <T>{
    public boolean gravar(T entidade);
    public boolean alterar(T entidade);
    public boolean apagar(int id);
    public T get(int id);
    public List<T> get(String filtro);
}

