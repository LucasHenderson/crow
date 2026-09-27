package com.crow.api.dto.usuario;

public record UsuarioResponse(
    String codigo,
    String nome,
    String email,
    String telefone,
    String dataEntrada,
    String status,
    String role,
    int quantidadeIdiomas
) {}
