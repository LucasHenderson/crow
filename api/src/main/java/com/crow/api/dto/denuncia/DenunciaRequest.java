package com.crow.api.dto.denuncia;

/** O idioma denunciado vem do path (/idiomas/{id}/denunciar), não do corpo. */
public record DenunciaRequest(
    String tiposJson,
    String descricao
) {}
