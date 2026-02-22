package com.crow.api.repository;

import com.crow.api.entity.IdiomaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IdiomaUsuarioRepository extends JpaRepository<IdiomaUsuario, Long> {
    List<IdiomaUsuario> findByUsuarioId(Long usuarioId);
    Optional<IdiomaUsuario> findByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);
    int countByUsuarioId(Long usuarioId);
    boolean existsByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);
}
