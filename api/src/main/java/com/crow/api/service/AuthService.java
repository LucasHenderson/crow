package com.crow.api.service;

import com.crow.api.dto.auth.AuthResponse;
import com.crow.api.dto.auth.LoginRequest;
import com.crow.api.dto.auth.RegisterRequest;
import com.crow.api.dto.usuario.UsuarioResponse;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse registrar(RegisterRequest dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.nome())
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.senha()))
                .telefone(dto.telefone())
                .build();

        usuario = usuarioRepository.save(usuario);

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name());
        return new AuthResponse(token, toUsuarioResponse(usuario));
    }

    public AuthResponse login(LoginRequest dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha incorretos"));

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha incorretos");
        }

        if (usuario.getStatus() == Usuario.Status.INATIVO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário inativo");
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name());
        return new AuthResponse(token, toUsuarioResponse(usuario));
    }

    public UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getDataEntrada() != null
                        ? usuario.getDataEntrada().format(DateTimeFormatter.ISO_LOCAL_DATE)
                        : null,
                usuario.getStatus().name().toLowerCase(),
                usuario.getRole().name().toLowerCase()
        );
    }
}
