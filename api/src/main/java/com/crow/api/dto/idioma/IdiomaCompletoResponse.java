package com.crow.api.dto.idioma;

import com.crow.api.dto.modulo.ModuloCompletoResponse;

import java.util.List;

/**
 * Idioma com todos os módulos e frases, na ordem definida pelo criador.
 * Servido apenas à área administrativa (GET /api/admin/idiomas/{codigo}) para
 * que o moderador avalie o conteúdo denunciado sem poder alterá-lo.
 */
public record IdiomaCompletoResponse(
    IdiomaResponse idioma,
    List<ModuloCompletoResponse> modulos
) {}
