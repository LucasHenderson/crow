package com.crow.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 100) String nome,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String senha,
    String telefone
) {}
