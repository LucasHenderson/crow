package com.crow.api.service;

import com.crow.api.dto.modulo.ModuloRequest;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import com.crow.api.repository.ModuloRepository;
import com.crow.api.util.Reordenacao;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuloService {

    private final ModuloRepository moduloRepository;
    private final FraseRepository fraseRepository;
    private final IdiomaService idiomaService;

    /** Módulos do idioma na ordem definida pelo criador. */
    public List<Modulo> buscarPorIdioma(Long idiomaId) {
        return moduloRepository.findByIdiomaIdOrderByOrdemAscIdAsc(idiomaId);
    }

    public Modulo buscarPorId(Long id) {
        return moduloRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado"));
    }

    /**
     * Garante que o usuário é proprietário do idioma ao qual o módulo pertence.
     * Lança 403 caso contrário (com log quando quem tenta é um administrador —
     * ver {@link IdiomaService#validarProprietario}).
     *
     * @param acao descrição curta da operação (ex.: "criar frase"), usada no log.
     */
    @Transactional(readOnly = true)
    public void validarProprietarioDoModulo(Long moduloId, Long usuarioId, String acao) {
        Modulo modulo = buscarPorId(moduloId);
        idiomaService.validarProprietario(modulo.getIdioma().getId(), usuarioId, acao);
    }

    /**
     * Garante que o usuário pode ler o conteúdo do módulo (dono do idioma ou
     * idioma público). Lança 403 caso contrário.
     */
    @Transactional(readOnly = true)
    public void validarAcessoLeituraDoModulo(Long moduloId, Long usuarioId) {
        Modulo modulo = buscarPorId(moduloId);
        idiomaService.validarAcessoLeitura(modulo.getIdioma().getId(), usuarioId);
    }

    @Transactional
    public Modulo criar(Long idiomaId, ModuloRequest dto, Long usuarioId) {
        idiomaService.validarProprietario(idiomaId, usuarioId, "criar módulo");

        int count = moduloRepository.countByIdiomaId(idiomaId);
        if (count >= 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite máximo de 20 módulos por idioma atingido");
        }

        Idioma idioma = idiomaService.buscarPorId(idiomaId);
        Modulo modulo = Modulo.builder()
                .nome(dto.nome())
                .icone(dto.icone())
                .ordem(Reordenacao.proximaPosicao(moduloRepository.maiorOrdemDoIdioma(idiomaId)))
                .idioma(idioma)
                .build();

        modulo = moduloRepository.save(modulo);

        // Persiste a contagem real de módulos no idioma
        idiomaService.sincronizarContagemModulos(idiomaId);
        idiomaService.registrarAtualizacao(idiomaId);

        return modulo;
    }

    @Transactional
    public Modulo editar(Long id, ModuloRequest dto, Long usuarioId) {
        Modulo modulo = buscarPorId(id);
        Long idiomaId = modulo.getIdioma().getId();
        idiomaService.validarProprietario(idiomaId, usuarioId, "editar módulo");
        if (dto.nome() != null) modulo.setNome(dto.nome());
        if (dto.icone() != null) modulo.setIcone(dto.icone());
        Modulo salvo = moduloRepository.save(modulo);
        idiomaService.registrarAtualizacao(idiomaId);
        return salvo;
    }

    /** Marca o módulo como atualizado agora (usado quando suas frases mudam). */
    public Modulo registrarAtualizacao(Modulo modulo) {
        modulo.setAtualizadoEm(LocalDateTime.now());
        return moduloRepository.save(modulo);
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Modulo modulo = buscarPorId(id);
        Long idiomaId = modulo.getIdioma().getId();
        idiomaService.validarProprietario(idiomaId, usuarioId, "excluir módulo");
        moduloRepository.delete(modulo);

        // Fecha o buraco deixado na sequência pelos módulos restantes
        renumerarModulosDoIdioma(idiomaId);

        // Persiste a contagem real de módulos no idioma
        idiomaService.sincronizarContagemModulos(idiomaId);
        idiomaService.registrarAtualizacao(idiomaId);
    }

    /**
     * Persiste a nova ordem dos módulos do idioma. A lista precisa conter todos
     * os módulos do idioma exatamente uma vez; do contrário devolve 400. Só o
     * proprietário do idioma pode reordenar (403 caso contrário).
     *
     * @return os módulos já na nova ordem.
     */
    @Transactional
    public List<Modulo> reordenar(Long idiomaId, List<Long> idsOrdenados, Long usuarioId) {
        idiomaService.validarProprietario(idiomaId, usuarioId, "reordenar módulos");

        List<Modulo> existentes = moduloRepository.findByIdiomaIdOrderByOrdemAscIdAsc(idiomaId);
        if (existentes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este idioma não possui módulos para reordenar");
        }

        List<Modulo> naNovaOrdem = Reordenacao.aplicar(
                existentes, idsOrdenados, Modulo::getId, Modulo::setOrdem, "os módulos deste idioma");

        moduloRepository.saveAll(naNovaOrdem);
        idiomaService.registrarAtualizacao(idiomaId);
        return naNovaOrdem;
    }

    /** Reescreve as posições dos módulos do idioma como 1..n, sem buracos. */
    private void renumerarModulosDoIdioma(Long idiomaId) {
        List<Modulo> restantes = moduloRepository.findByIdiomaIdOrderByOrdemAscIdAsc(idiomaId);
        moduloRepository.saveAll(
                Reordenacao.renumerar(restantes, Modulo::getOrdem, Modulo::setOrdem));
    }
}
