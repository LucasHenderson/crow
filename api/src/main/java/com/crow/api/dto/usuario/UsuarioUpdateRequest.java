package com.crow.api.dto.usuario;

import jakarta.validation.constraints.Email;

/**
 * Atualização parcial de usuário. {@code role} e {@code novaSenha} são
 * aplicados apenas pelo fluxo administrativo — o endpoint de perfil
 * (/usuarios/me) ignora esses campos.
 */
public record UsuarioUpdateRequest(
    String nome,
    @Email String email,
    String telefone,
    String role,
    String novaSenha
) {}
