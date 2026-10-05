package com.crow.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Verificação de saúde, pública. Usada pelo Render (health check do deploy) e
 * pelo cron do Worker do Cloudflare, que a chama a cada 10 minutos para a API
 * não dormir no plano gratuito. A consulta ao banco é proposital: mantém o
 * projeto do Supabase ativo (ele pausa após uma semana sem uso do banco).
 */
@RestController
@RequestMapping("/api/saude")
@RequiredArgsConstructor
public class SaudeController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public Map<String, String> verificar() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return Map.of("status", "ok");
    }
}
