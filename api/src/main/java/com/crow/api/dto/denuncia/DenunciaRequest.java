package com.crow.api.dto.denuncia;

import jakarta.validation.constraints.NotBlank;

public record DenunciaRequest(
    @NotBlank String idiomaId,
    String tiposJson,
    String descricao
) {}
