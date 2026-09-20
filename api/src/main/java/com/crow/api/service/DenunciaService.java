package com.crow.api.service;

import com.crow.api.dto.denuncia.DenunciaRequest;
import com.crow.api.entity.Denuncia;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.DenunciaRepository;
import com.crow.api.util.CodigoPublico;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DenunciaService {

    private final DenunciaRepository denunciaRepository;
    private final IdiomaService idiomaService;

    public List<Denuncia> buscarTodas() {
        return denunciaRepository.findAllComRelacionamentos();
    }

    public Denuncia buscarPorId(Long id) {
        return denunciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denúncia não encontrada"));
    }

    public Denuncia buscarPorCodigo(String codigo) {
        return denunciaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denúncia não encontrada"));
    }

    /**
     * Resolve a referência recebida na rota para a entidade: aceita o código
     * público e, temporariamente, o id numérico.
     */
    public Denuncia resolver(String referencia) {
        // TODO remover compatibilidade numérica após migração completa do frontend
        if (CodigoPublico.ehNumerico(referencia)) {
            return buscarPorId(Long.valueOf(referencia));
        }
        return buscarPorCodigo(referencia);
    }

    public Denuncia criar(Long idiomaId, DenunciaRequest dto, Usuario usuario) {
        Idioma idioma = idiomaService.buscarPorId(idiomaId);

        Denuncia denuncia = Denuncia.builder()
                .idioma(idioma)
                .usuario(usuario)
                .tiposJson(dto.tiposJson())
                .descricao(dto.descricao())
                .build();

        return denunciaRepository.save(denuncia);
    }

    @Transactional
    public Denuncia alterarStatus(Long id, String novoStatus, Usuario responsavel) {
        Denuncia denuncia = buscarPorId(id);
        try {
            denuncia.setStatus(Denuncia.StatusDenuncia.valueOf(novoStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido: " + novoStatus);
        }
        denuncia.setResponsavel(responsavel);
        Denuncia salva = denunciaRepository.save(denuncia);
        // Inicializa as relações usadas na montagem do DTO (open-in-view=false).
        Hibernate.initialize(salva.getIdioma());
        Hibernate.initialize(salva.getUsuario());
        return salva;
    }
}
