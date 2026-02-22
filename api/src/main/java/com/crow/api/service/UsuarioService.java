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

    public Usuario editarUsuarioAdmin(Long id, UsuarioUpdateRequest dto) {
        return atualizarPerfil(id, dto);
    }
}
