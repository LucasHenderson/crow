package com.crow.api.service;

import com.crow.api.dto.auth.AuthResponse;
import com.crow.api.dto.auth.LoginRequest;
import com.crow.api.dto.auth.RegisterRequest;
import com.crow.api.dto.usuario.UsuarioResponse;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.IdiomaUsuarioRepository;
import com.crow.api.repository.UsuarioRepository;
import com.crow.api.util.EmailTemplates;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final IdiomaUsuarioRepository idiomaUsuarioRepository;
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

        // Só depois de conferir a senha: a situação da conta não pode servir
        // para descobrir se um e-mail está cadastrado.
        if (usuario.getStatus() == Usuario.Status.INATIVO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, mensagemContaIndisponivel(usuario));
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name());
        return new AuthResponse(token, toUsuarioResponse(usuario));
    }

    /**
     * Situação de uma conta INATIVO para a tela de login: diz se é desativação
     * ou suspensão e, na suspensão, quando a conta volta. Não expõe a
     * justificativa nem qualquer outro dado do cadastro — o detalhe foi enviado
     * por e-mail ao próprio usuário.
     */
    private String mensagemContaIndisponivel(Usuario usuario) {
        LocalDateTime suspensoAte = usuario.getSuspensoAte();
        if (suspensoAte == null) {
            return "Conta desativada. Entre em contato com a equipe de moderação.";
        }
        if (suspensoAte.isAfter(LocalDateTime.now())) {
            return "Conta suspensa temporariamente. Previsão de reativação: "
                    + EmailTemplates.FORMATO_DATA.format(suspensoAte) + ".";
        }
        // Prazo vencido, mas o agendador (a cada 5 minutos) ainda não passou.
        return "Conta suspensa temporariamente. A reativação automática está em andamento; "
                + "tente novamente em alguns minutos.";
    }

    public UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getCodigo(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getDataEntrada() != null
                        ? usuario.getDataEntrada().format(DateTimeFormatter.ISO_LOCAL_DATE)
                        : null,
                usuario.getStatus().name().toLowerCase(),
                usuario.getRole().name().toLowerCase(),
                idiomaUsuarioRepository.countByUsuarioId(usuario.getId())
        );
    }
}
