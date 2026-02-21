package com.crow.api.dto.idioma;

import jakarta.validation.constraints.NotBlank;

public record IdiomaRequest(
    @NotBlank String nome,
    @NotBlank String idioma,
    String bandeira,
    String descricao,
    String proficiencia,
    String visibilidade
) {}
