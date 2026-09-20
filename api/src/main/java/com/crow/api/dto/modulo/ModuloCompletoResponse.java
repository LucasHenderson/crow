package com.crow.api.dto.modulo;

import com.crow.api.dto.frase.FraseResponse;

import java.util.List;

/** Módulo acompanhado de todas as suas frases — visão de moderação, somente leitura. */
public record ModuloCompletoResponse(
    ModuloResponse modulo,
    List<FraseResponse> frases
) {}
