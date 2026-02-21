package com.crow.api.dto.usuario;

public record UsuarioUpdateRequest(
    String nome,
    String email,
    String telefone
) {}
