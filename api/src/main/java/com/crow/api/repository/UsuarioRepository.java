package com.crow.api.repository;

import com.crow.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByStatus(Usuario.Status status);
    List<Usuario> findByNomeContainingIgnoreCase(String nome);
}
