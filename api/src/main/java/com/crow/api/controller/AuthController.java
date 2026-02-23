package com.crow.api.controller;

import com.crow.api.dto.auth.*;
import com.crow.api.service.AuthService;
import com.crow.api.service.EmailVerificationService;
import com.crow.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    @PostMapping("/enviar-codigo")
    public ResponseEntity<Map<String, String>> enviarCodigo(@Valid @RequestBody EnviarCodigoRequest request) {
        emailVerificationService.enviarCodigo(request.email());
        return ResponseEntity.ok(Map.of("mensagem", "Código enviado para " + request.email()));
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<Map<String, Boolean>> verificarCodigo(@Valid @RequestBody VerificarCodigoRequest request) {
        boolean valido = emailVerificationService.verificarCodigo(request.email(), request.codigo());
        return ResponseEntity.ok(Map.of("valido", valido));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        if (!emailVerificationService.isEmailVerificado(request.email())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Email não verificado. Solicite um novo código."));
        }

        usuarioService.redefinirSenha(request.email(), request.novaSenha());
        emailVerificationService.consumirVerificacao(request.email());

        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso."));
    }
}
