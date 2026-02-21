package com.crow.api.dto.denuncia;

import jakarta.validation.constraints.NotBlank;

public record AlterarStatusDenunciaRequest(
    @NotBlank String status
) {}
