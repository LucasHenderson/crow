package com.crow.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EnviarCodigoRequest(
        @NotBlank @Email String email
) {}
