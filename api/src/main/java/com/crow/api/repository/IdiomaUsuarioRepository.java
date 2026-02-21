package com.crow.api.repository;

import com.crow.api.entity.IdiomaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IdiomaUsuarioRepository extends JpaRepository<IdiomaUsuario, Long> {
    List<IdiomaUsuario> findByUsuarioId(String usuarioId);
    Optional<IdiomaUsuario> findByUsuarioIdAndIdiomaId(String usuarioId, String idiomaId);
    int countByUsuarioId(String usuarioId);
    boolean existsByUsuarioIdAndIdiomaId(String usuarioId, String idiomaId);
}
