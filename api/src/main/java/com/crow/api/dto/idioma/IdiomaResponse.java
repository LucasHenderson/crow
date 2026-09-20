package com.crow.api.dto.idioma;

import com.crow.api.entity.Idioma;

import java.time.format.DateTimeFormatter;

public record IdiomaResponse(
    // TODO Fase 21: remover id e criadorId — mantidos enquanto o frontend depende deles
    Long id,
    String codigo,
    String nome,
    String idioma,
    String bandeira,
    String descricao,
    Long criadorId,
    String codigoCriador,
    String criadorNome,
    int modulos,
    double avaliacao,
    int totalAvaliacoes,
    String proficiencia,
    String visibilidade,
    String criadoEm,
    /** Última alteração de conteúdo (módulos ou frases); nulo se desconhecida. */
    String atualizadoEm
) {

    /**
     * Converte a entidade para o DTO de resposta. O criador do idioma deve
     * estar inicializado (fetch join ou Hibernate.initialize) antes da chamada.
     */
    public static IdiomaResponse from(Idioma idioma) {
        return new IdiomaResponse(
                idioma.getId(),
                idioma.getCodigo(),
                idioma.getNome(),
                idioma.getIdioma(),
                idioma.getBandeira(),
                idioma.getDescricao(),
                idioma.getCriador() != null ? idioma.getCriador().getId() : null,
                idioma.getCriador() != null ? idioma.getCriador().getCodigo() : null,
                idioma.getCriador() != null ? idioma.getCriador().getNome() : null,
                idioma.getModulos(),
                idioma.getAvaliacao(),
                idioma.getTotalAvaliacoes(),
                idioma.getProficiencia() != null ? idioma.getProficiencia().name().toLowerCase() : null,
                idioma.getVisibilidade() != null ? idioma.getVisibilidade().name().toLowerCase() : null,
                idioma.getCriadoEm() != null
                        ? idioma.getCriadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null,
                idioma.getAtualizadoEm() != null
                        ? idioma.getAtualizadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null
        );
    }
}
