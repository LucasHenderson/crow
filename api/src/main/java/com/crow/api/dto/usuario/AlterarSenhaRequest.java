package com.crow.api.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaRequest(
    @NotBlank String senhaAtual,
    @NotBlank @Size(min = 6) String novaSenha
) {}
