package com.crow.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Pedido de código por e-mail. {@code finalidade} é opcional e só escolhe o
 * texto do e-mail; ausente, vale {@link FinalidadeCodigo#VERIFICACAO_EMAIL}.
 */
public record EnviarCodigoRequest(
        @NotBlank @Email String email,
        FinalidadeCodigo finalidade
) {}
