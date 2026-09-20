package com.crow.api.config;

import com.crow.api.entity.Denuncia;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.DenunciaRepository;
import com.crow.api.repository.IdiomaRepository;
import com.crow.api.repository.UsuarioRepository;
import com.crow.api.util.CodigoPublico;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Predicate;

/**
 * Preenche o identificador público (codigo) dos registros criados antes da
 * coluna existir. Com ddl-auto=update a coluna nasce nula nas linhas
 * existentes; entidades novas já recebem o código no @PrePersist.
 *
 * <p>É idempotente: só considera registros com codigo nulo, de modo que uma
 * segunda execução não altera nada.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CodigoPublicoBackfill implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final IdiomaRepository idiomaRepository;
    private final DenunciaRepository denunciaRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int usuarios = preencherUsuarios();
        int idiomas = preencherIdiomas();
        int denuncias = preencherDenuncias();
        int total = usuarios + idiomas + denuncias;

        if (total == 0) {
            log.info("Backfill de código público: nenhum registro pendente");
        } else {
            log.info("Backfill de código público: {} registro(s) preenchido(s) "
                            + "(usuarios={}, idiomas={}, denuncias={})",
                    total, usuarios, idiomas, denuncias);
        }
    }

    private int preencherUsuarios() {
        List<Usuario> pendentes = usuarioRepository.findByCodigoIsNull();
        pendentes.forEach(u -> u.setCodigo(
                gerarUnico(CodigoPublico.PREFIXO_USUARIO, usuarioRepository::existsByCodigo)));
        usuarioRepository.saveAll(pendentes);
        return pendentes.size();
    }

    private int preencherIdiomas() {
        List<Idioma> pendentes = idiomaRepository.findByCodigoIsNull();
        pendentes.forEach(i -> i.setCodigo(
                gerarUnico(CodigoPublico.PREFIXO_IDIOMA, idiomaRepository::existsByCodigo)));
        idiomaRepository.saveAll(pendentes);
        return pendentes.size();
    }

    private int preencherDenuncias() {
        List<Denuncia> pendentes = denunciaRepository.findByCodigoIsNull();
        pendentes.forEach(d -> d.setCodigo(
                gerarUnico(CodigoPublico.PREFIXO_DENUNCIA, denunciaRepository::existsByCodigo)));
        denunciaRepository.saveAll(pendentes);
        return pendentes.size();
    }

    /** Sorteia até obter um código ainda não usado, respeitando o índice único. */
    private String gerarUnico(String prefixo, Predicate<String> jaExiste) {
        String codigo;
        do {
            codigo = CodigoPublico.gerar(prefixo);
        } while (jaExiste.test(codigo));
        return codigo;
    }
}
