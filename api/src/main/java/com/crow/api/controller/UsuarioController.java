package com.crow.api.controller;

import com.crow.api.dto.idioma.IdiomaResponse;
import com.crow.api.dto.usuario.AlterarSenhaRequest;
import com.crow.api.dto.usuario.UsuarioPublicoResponse;
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

    /** Listagem pública: dados reduzidos e sem contas administrativas. */
    @GetMapping
    public ResponseEntity<List<UsuarioPublicoResponse>> listarTodos() {
        return ResponseEntity.ok(
                usuarioService.buscarPublicos(null).stream()
                        .map(usuarioService::toPublicoResponse)
                        .toList()
        );
    }

    /** Perfil público de outro usuário — sem email, telefone, papel ou status. */
    @GetMapping("/{codigo}")
    public ResponseEntity<UsuarioPublicoResponse> buscarPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(usuarioService.toPublicoResponse(usuarioService.resolver(codigo)));
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

    /**
     * Busca da tela pública de usuários: exclui administradores e devolve
     * apenas os campos públicos. A área administrativa usa /api/admin/usuarios.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<UsuarioPublicoResponse>> buscar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(
                usuarioService.buscarPublicos(q).stream()
                        .map(usuarioService::toPublicoResponse)
                        .toList()
        );
    }

    /** Idiomas públicos criados pelo usuário — exibidos no perfil público dele. */
    @GetMapping("/{codigo}/idiomas")
    public ResponseEntity<List<IdiomaResponse>> idiomasPublicos(@PathVariable String codigo) {
        Usuario usuario = usuarioService.resolver(codigo);
        return ResponseEntity.ok(
                idiomaService.buscarPublicosPorCriador(usuario.getId()).stream()
                        .map(IdiomaResponse::from)
                        .toList()
        );
    }
}
