package com.crow.api.config;

import com.crow.api.repository.FraseRepository;
import com.crow.api.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Numera a posição (campo {@code ordem}) dos módulos e frases criados antes da
 * coluna existir. Com ddl-auto=update a coluna nasce nula nas linhas
 * existentes; módulos e frases novos já recebem a posição na criação.
 *
 * <p>Para cada idioma os módulos são numerados de 1 em diante por id crescente,
 * e para cada módulo suas frases seguem a mesma regra.</p>
 *
 * <p>É idempotente: só entra em ação nos pais que têm ao menos um filho com
 * {@code ordem} nula, de modo que uma segunda execução não altera nada. Num pai
 * parcialmente numerado, os filhos já posicionados mantêm sua ordem relativa e
 * os sem posição entram ao final — o resultado é sempre a sequência 1..n sem
 * buracos.</p>
 *
 * <p>A gravação é feita por update direto no banco (e não pelas entidades) para
 * não disparar o {@code @PreUpdate} do Modulo: numerar um módulo antigo não
 * deve marcá-lo como "atualizado agora".</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrdemBackfill implements ApplicationRunner {

    private final ModuloRepository moduloRepository;
    private final FraseRepository fraseRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int modulos = numerarModulos();
        int frases = numerarFrases();

        if (modulos == 0 && frases == 0) {
            log.info("Backfill de ordem: nenhum módulo ou frase pendente");
        } else {
            log.info("Backfill de ordem: {} módulo(s) e {} frase(s) numerado(s)", modulos, frases);
        }
    }

    /** @return quantidade de módulos que estavam sem posição. */
    private int numerarModulos() {
        int pendentes = 0;
        for (Long idiomaId : moduloRepository.idiomasComModuloSemOrdem()) {
            pendentes += moduloRepository.countByIdiomaIdAndOrdemIsNull(idiomaId);

            List<Long> ids = moduloRepository.idsNaOrdemVigente(idiomaId);
            for (int i = 0; i < ids.size(); i++) {
                moduloRepository.definirOrdem(ids.get(i), i + 1);
            }
        }
        return pendentes;
    }

    /** @return quantidade de frases que estavam sem posição. */
    private int numerarFrases() {
        int pendentes = 0;
        for (Long moduloId : fraseRepository.modulosComFraseSemOrdem()) {
            pendentes += fraseRepository.countByModuloIdAndOrdemIsNull(moduloId);

            List<Long> ids = fraseRepository.idsNaOrdemVigente(moduloId);
            for (int i = 0; i < ids.size(); i++) {
                fraseRepository.definirOrdem(ids.get(i), i + 1);
            }
        }
        return pendentes;
    }
}
