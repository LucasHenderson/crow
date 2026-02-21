package com.crow.api.dto.modulo;

import jakarta.validation.constraints.NotBlank;

public record ModuloRequest(
    @NotBlank String nome,
    String icone
) {}
