package com.crow.api.dto.avaliacao;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record AvaliacaoRequest(
    @Min(1) @Max(5) int nota
) {}
