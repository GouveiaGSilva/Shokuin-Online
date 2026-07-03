package org.example.frontend.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        HttpSession session = request.getSession(false);
        if (uri.equals("/login.html") ||
                uri.startsWith("/apiautenticacao/") ||
                uri.startsWith("/css/") ||
                uri.startsWith("/js/") ||
                uri.contains("favicon")) {
            return true;
        }
        if (session != null && session.getAttribute("usuarioLogado") != null) {
            return true;
        }
        response.sendRedirect("/login.html");
        return false;
    }
}