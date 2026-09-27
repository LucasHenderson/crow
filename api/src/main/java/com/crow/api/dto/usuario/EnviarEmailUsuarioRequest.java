package com.crow.api.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Mensagem livre do administrador para um usuário
 * (POST /api/admin/usuarios/{codigo}/email).
 *
 * <p>O texto vai no corpo do e-mail enviado ao endereço cadastrado do
 * usuário, entre a saudação e a assinatura padrão de
 * {@link com.crow.api.util.EmailTemplates}. O assunto recebe o prefixo
 * "Crow - ". O log administrativo guarda o assunto e só o início da
 * mensagem, nunca o texto completo.</p>
 */
public record EnviarEmailUsuarioRequest(
    @NotBlank @Size(max = 150) String assunto,
    @NotBlank @Size(max = 5000) String mensagem
) {}
