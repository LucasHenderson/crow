package com.crow.api.dto.idioma;

public record IdiomaResponse(
    String id,
    String nome,
    String idioma,
    String bandeira,
    String descricao,
    String criadorId,
    String criadorNome,
    int modulos,
    double avaliacao,
    int totalAvaliacoes,
    String proficiencia,
    String visibilidade,
    String criadoEm
) {}
