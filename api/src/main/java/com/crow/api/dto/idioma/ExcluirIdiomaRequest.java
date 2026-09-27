package com.crow.api.dto.idioma;

import jakarta.validation.constraints.Size;

/**
 * Corpo opcional da exclusão administrativa de um idioma
 * (DELETE /api/admin/idiomas/{codigo}).
 *
 * <p>A mensagem vai no e-mail de aviso ao proprietário do idioma, no lugar
 * do motivo padrão de {@link com.crow.api.util.EmailTemplates}. Sem corpo
 * ou com mensagem em branco, o aviso sai com o texto padrão. O log
 * administrativo registra apenas se houve mensagem personalizada e o seu
 * início, nunca o texto completo.</p>
 */
public record ExcluirIdiomaRequest(
    @Size(max = 1000) String mensagem
) {}
