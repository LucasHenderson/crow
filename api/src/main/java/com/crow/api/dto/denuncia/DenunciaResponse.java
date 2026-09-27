package com.crow.api.dto.denuncia;

public record DenunciaResponse(
    String codigo,
    String codigoIdioma,
    String idiomaNome,
    String codigoUsuario,
    String usuarioNome,
    String data,
    String tiposJson,
    String descricao,
    String status,
    String codigoResponsavel,
    String responsavelNome
) {}
