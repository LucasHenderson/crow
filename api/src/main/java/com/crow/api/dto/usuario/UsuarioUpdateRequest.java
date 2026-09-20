package com.crow.api.dto.usuario;

import jakarta.validation.constraints.Email;

/**
 * Atualização parcial do próprio perfil (/usuarios/me). Papel e senha não
 * fazem parte deste DTO de propósito: nenhuma rota — administrativa ou não —
 * aceita alteração de {@code role}, e a senha só muda pelos fluxos próprios
 * (/usuarios/me/senha, com a senha atual, e /auth/redefinir-senha, com código
 * verificado por e-mail). Campos desconhecidos no JSON são ignorados.
 */
public record UsuarioUpdateRequest(
    String nome,
    @Email String email,
    String telefone
) {}
