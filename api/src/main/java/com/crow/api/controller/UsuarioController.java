package com.crow.api.controller;

import com.crow.api.dto.usuario.AlterarSenhaRequest;
import com.crow.api.dto.usuario.UsuarioResponse;
import com.crow.api.dto.usuario.UsuarioUpdateRequest;
import com.crow.api.entity.Usuario;
import com.crow.api.service.AuthService;
import com.crow.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;

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
    public ResponseEntity<UsuarioResponse> atualizarPerfil(
            Authentication authentication,
            @RequestBody UsuarioUpdateRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Usuario atualizado = usuarioService.atualizarPerfil(userId, request);
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
    public ResponseEntity<List<UsuarioResponse>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(
                usuarioService.buscarPorNome(q).stream()
                        .map(authService::toUsuarioResponse)
                        .toList()
        );
    }
}
