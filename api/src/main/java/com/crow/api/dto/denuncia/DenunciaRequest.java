package com.crow.api.dto.denuncia;

import jakarta.validation.constraints.NotNull;

public record DenunciaRequest(
    @NotNull Long idiomaId,
    String tiposJson,
    String descricao
) {}
