package com.crow.api.controller;

import com.crow.api.dto.idioma.IdiomaResponse;
import com.crow.api.dto.usuario.AlterarSenhaRequest;
import com.crow.api.dto.usuario.UsuarioResponse;
import com.crow.api.dto.usuario.UsuarioUpdateRequest;
import com.crow.api.entity.Usuario;
import com.crow.api.service.AuthService;
import com.crow.api.service.EmailVerificationService;
import com.crow.api.service.IdiomaService;
import com.crow.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final IdiomaService idiomaService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(
                usuarioService.buscarTodos().stream()
                        .map(authService::toUsuarioResponse)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(authService.toUsuarioResponse(usuarioService.buscarPorId(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(authService.toUsuarioResponse(usuarioService.buscarPorId(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<?> atualizarPerfil(
            Authentication authentication,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Usuario usuarioAtual = usuarioService.buscarPorId(userId);

        if (request.email() != null && !request.email().isBlank()
                && !request.email().equalsIgnoreCase(usuarioAtual.getEmail())) {
            if (!emailVerificationService.isEmailVerificado(request.email())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Novo email não verificado. Solicite um código de verificação."));
            }
        }

        Usuario atualizado = usuarioService.atualizarPerfil(userId, request);

        if (request.email() != null && !request.email().isBlank()) {
            emailVerificationService.consumirVerificacao(request.email());
        }

        return ResponseEntity.ok(authService.toUsuarioResponse(atualizado));
    }

    @PutMapping("/me/senha")
    public ResponseEntity<Void> alterarSenha(
            Authentication authentication,
            @Valid @RequestBody AlterarSenhaRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        usuarioService.alterarSenha(userId, request.senhaAtual(), request.novaSenha());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<UsuarioResponse>> buscar(@RequestParam(required = false) String q) {
        List<Usuario> usuarios = (q == null || q.isBlank())
                ? usuarioService.buscarTodos()
                : usuarioService.buscarPorNome(q);
        return ResponseEntity.ok(
                usuarios.stream()
                        .map(authService::toUsuarioResponse)
                        .toList()
        );
    }

    /** Idiomas públicos criados pelo usuário — exibidos no perfil público dele. */
    @GetMapping("/{id}/idiomas")
    public ResponseEntity<List<IdiomaResponse>> idiomasPublicos(@PathVariable Long id) {
        usuarioService.buscarPorId(id);
        return ResponseEntity.ok(
                idiomaService.buscarPublicosPorCriador(id).stream()
                        .map(IdiomaResponse::from)
                        .toList()
        );
    }
}
