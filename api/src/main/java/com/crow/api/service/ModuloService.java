package com.crow.api.service;

import com.crow.api.dto.modulo.ModuloRequest;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import com.crow.api.repository.ModuloRepository;
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

    public List<Modulo> buscarPorIdioma(Long idiomaId) {
        return moduloRepository.findByIdiomaId(idiomaId);
    }

    public Modulo buscarPorId(Long id) {
        return moduloRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado"));
    }

    /**
     * Garante que o usuário é proprietário do idioma ao qual o módulo pertence.
     * Lança 403 caso contrário.
     */
    @Transactional(readOnly = true)
    public void validarProprietarioDoModulo(Long moduloId, Long usuarioId) {
        Modulo modulo = buscarPorId(moduloId);
        idiomaService.validarProprietario(modulo.getIdioma().getId(), usuarioId);
    }

    @Transactional
    public Modulo criar(Long idiomaId, ModuloRequest dto, Long usuarioId) {
        idiomaService.validarProprietario(idiomaId, usuarioId);

        int count = moduloRepository.countByIdiomaId(idiomaId);
        if (count >= 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite máximo de 20 módulos por idioma atingido");
        }

        Idioma idioma = idiomaService.buscarPorId(idiomaId);
        Modulo modulo = Modulo.builder()
                .nome(dto.nome())
                .icone(dto.icone())
                .idioma(idioma)
                .build();

        modulo = moduloRepository.save(modulo);

        // Persiste a contagem real de módulos no idioma
        idiomaService.sincronizarContagemModulos(idiomaId);

        return modulo;
    }

    @Transactional
    public Modulo editar(Long id, ModuloRequest dto, Long usuarioId) {
        Modulo modulo = buscarPorId(id);
        idiomaService.validarProprietario(modulo.getIdioma().getId(), usuarioId);
        if (dto.nome() != null) modulo.setNome(dto.nome());
        if (dto.icone() != null) modulo.setIcone(dto.icone());
        return moduloRepository.save(modulo);
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
        idiomaService.validarProprietario(idiomaId, usuarioId);
        moduloRepository.delete(modulo);

        // Persiste a contagem real de módulos no idioma
        idiomaService.sincronizarContagemModulos(idiomaId);
    }
}
