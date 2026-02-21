package com.crow.api.dto.modulo;

public record ModuloResponse(
    Long id,
    String nome,
    String icone,
    int frases,
    String criadoEm
) {}
