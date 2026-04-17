package com.crow.api.repository;

import com.crow.api.entity.IdiomaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IdiomaUsuarioRepository extends JpaRepository<IdiomaUsuario, Long> {
    List<IdiomaUsuario> findByUsuarioId(Long usuarioId);

    @Query("SELECT iu FROM IdiomaUsuario iu " +
           "JOIN FETCH iu.idioma i " +
           "LEFT JOIN FETCH i.criador " +
           "WHERE iu.usuario.id = :usuarioId")
    List<IdiomaUsuario> findByUsuarioIdFetchIdioma(@Param("usuarioId") Long usuarioId);

    Optional<IdiomaUsuario> findByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);
    int countByUsuarioId(Long usuarioId);
    boolean existsByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);

    @Modifying
    void deleteByIdiomaId(Long idiomaId);

    @Modifying
    void deleteByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);
}
