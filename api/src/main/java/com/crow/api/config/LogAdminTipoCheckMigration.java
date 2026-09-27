package com.crow.api.config;

import com.crow.api.entity.LogAdmin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Realinha a restrição {@code logs_admin_tipo_check} com o enum
 * {@link LogAdmin.TipoLog}.
 *
 * <p>Para colunas {@code @Enumerated(STRING)} o Hibernate cria um
 * {@code CHECK (tipo IN (...))} com os valores que o enum tinha na criação da
 * tabela, e {@code ddl-auto=update} nunca altera restrições existentes. Sem
 * este ajuste, o primeiro log com um valor novo (MODERACAO, EMAIL) falharia
 * na inserção — depois de a ação administrativa já ter acontecido.</p>
 *
 * <p>Idempotente: recria a restrição a cada subida, sempre com a lista atual
 * do enum, então um valor acrescentado no futuro passa a ser aceito sem outro
 * passo manual. Roda antes dos demais runners para que nenhum registro
 * dependa da ordem de inicialização.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class LogAdminTipoCheckMigration implements ApplicationRunner {

    private static final String TABELA = "logs_admin";
    private static final String RESTRICAO = "logs_admin_tipo_check";

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        String valores = Arrays.stream(LogAdmin.TipoLog.values())
                .map(tipo -> "'" + tipo.name() + "'")
                .collect(Collectors.joining(", "));

        jdbcTemplate.execute("ALTER TABLE " + TABELA + " DROP CONSTRAINT IF EXISTS " + RESTRICAO);
        jdbcTemplate.execute("ALTER TABLE " + TABELA + " ADD CONSTRAINT " + RESTRICAO
                + " CHECK (tipo IN (" + valores + "))");

        log.info("Restrição {} realinhada com TipoLog: {}", RESTRICAO, valores);
    }
}
