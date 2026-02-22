package com.crow.api.dto.denuncia;

public record DenunciaResponse(
    Long id,
    String codigo,
    Long idiomaId,
    String codigoIdioma,
    String idiomaNome,
    Long usuarioId,
    String codigoUsuario,
    String usuarioNome,
    String data,
    String tiposJson,
    String descricao,
    String status,
    Long responsavelId,
    String codigoResponsavel,
    String responsavelNome
) {}
