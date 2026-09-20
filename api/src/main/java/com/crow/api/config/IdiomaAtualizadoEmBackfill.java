package com.crow.api.config;

import com.crow.api.repository.IdiomaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Preenche {@code atualizadoEm} dos idiomas criados antes da coluna existir,
 * copiando o valor de {@code criadoEm}. Com ddl-auto=update a coluna nasce nula
 * nas linhas existentes; idiomas novos já recebem o valor no @PrePersist.
 *
 * <p>É idempotente: só considera registros com {@code atualizadoEm} nulo, de
 * modo que uma segunda execução não altera nada.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IdiomaAtualizadoEmBackfill implements ApplicationRunner {

    private final IdiomaRepository idiomaRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int atualizados = idiomaRepository.preencherAtualizadoEmComCriadoEm();

        if (atualizados == 0) {
            log.info("Backfill de atualizadoEm: nenhum idioma pendente");
        } else {
            log.info("Backfill de atualizadoEm: {} idioma(s) preenchido(s) a partir de criadoEm",
                    atualizados);
        }
    }
}
