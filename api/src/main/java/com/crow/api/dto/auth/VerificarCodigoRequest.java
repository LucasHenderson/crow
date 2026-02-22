package com.crow.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerificarCodigoRequest(
        @NotBlank @Email String email,
        @NotBlank String codigo
) {}
