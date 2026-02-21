package com.crow.api.dto.denuncia;

public record DenunciaResponse(
    Long id,
    String idiomaId,
    String idiomaNome,
    String usuarioId,
    String usuarioNome,
    String data,
    String tiposJson,
    String descricao,
    String status,
    String responsavelId,
    String responsavelNome
) {}
