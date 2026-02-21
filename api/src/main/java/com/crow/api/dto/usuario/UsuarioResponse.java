package com.crow.api.dto.usuario;

public record UsuarioResponse(
    String id,
    String nome,
    String email,
    String telefone,
    String dataEntrada,
    String status,
    String role
) {}
