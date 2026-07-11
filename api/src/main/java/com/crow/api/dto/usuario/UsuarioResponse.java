package com.crow.api.dto.usuario;

public record UsuarioResponse(
    Long id,
    String codigo,
    String nome,
    String email,
    String telefone,
    String dataEntrada,
    String status,
    String role,
    int quantidadeIdiomas
) {}
