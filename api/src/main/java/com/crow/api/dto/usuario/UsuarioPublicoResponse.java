package com.crow.api.dto.usuario;

/**
 * Projeção pública de usuário — usada nas telas que qualquer usuário logado
 * pode abrir (busca de usuários e perfil público). Não expõe email, telefone,
 * papel nem status; {@code quantidadeIdiomas} conta apenas idiomas públicos.
 */
public record UsuarioPublicoResponse(
    String codigo,
    String nome,
    String dataEntrada,
    int quantidadeIdiomas
) {}
