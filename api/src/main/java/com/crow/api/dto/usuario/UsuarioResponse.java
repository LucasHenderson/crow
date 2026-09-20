package com.crow.api.dto.usuario;

public record UsuarioResponse(
    // TODO Fase 21: remover o id numérico — mantido apenas enquanto o frontend depende dele
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
