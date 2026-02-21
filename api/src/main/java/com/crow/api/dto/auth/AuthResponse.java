package com.crow.api.dto.auth;

import com.crow.api.dto.usuario.UsuarioResponse;

public record AuthResponse(
    String token,
    UsuarioResponse usuario
) {}
