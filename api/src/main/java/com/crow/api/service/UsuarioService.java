package com.crow.api.service;

import com.crow.api.dto.usuario.UsuarioUpdateRequest;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public List<Usuario> buscarTodos() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> buscarPorNome(String nome) {
        return usuarioRepository.findByNomeContainingIgnoreCase(nome);
    }

    public Usuario atualizarPerfil(Long id, UsuarioUpdateRequest dto) {
        Usuario usuario = buscarPorId(id);

        if (dto.nome() != null && !dto.nome().isBlank()) {
            usuario.setNome(dto.nome());
        }
        if (dto.email() != null && !dto.email().isBlank()) {
            if (!dto.email().equals(usuario.getEmail()) && usuarioRepository.existsByEmail(dto.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
            }
            usuario.setEmail(dto.email());
        }
        if (dto.telefone() != null) {
            usuario.setTelefone(dto.telefone());
        }

        return usuarioRepository.save(usuario);
    }

    public void alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarPorId(id);

        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    public Usuario alterarStatus(Long id, Usuario.Status novoStatus) {
        Usuario usuario = buscarPorId(id);
        usuario.setStatus(novoStatus);
        return usuarioRepository.save(usuario);
    }

    /**
     * Edição administrativa: além dos dados de perfil, permite alterar o papel
     * (comum/admin) e redefinir a senha do usuário. Esses dois campos são
     * ignorados no fluxo de autoatualização (/usuarios/me).
     */
    public Usuario editarUsuarioAdmin(Long id, UsuarioUpdateRequest dto) {
        Usuario usuario = atualizarPerfil(id, dto);

        if (dto.role() != null && !dto.role().isBlank()) {
            try {
                usuario.setRole(Usuario.Role.valueOf(dto.role().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Papel inválido: " + dto.role());
            }
        }

        if (dto.novaSenha() != null && !dto.novaSenha().isBlank()) {
            if (dto.novaSenha().length() < 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A nova senha deve ter no mínimo 6 caracteres");
            }
            usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        }

        return usuarioRepository.save(usuario);
    }

    public boolean emailCadastrado(String email) {
        if (email == null || email.isBlank()) return false;
        return usuarioRepository.existsByEmail(email);
    }

    public void redefinirSenha(String email, String novaSenha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }
}
