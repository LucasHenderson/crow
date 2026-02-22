package com.crow.api.dto.idioma;

public record IdiomaResponse(
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
    String criadoEm
) {}
