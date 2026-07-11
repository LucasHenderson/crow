package com.crow.api.repository;

import com.crow.api.entity.IdiomaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IdiomaUsuarioRepository extends JpaRepository<IdiomaUsuario, Long> {

    @Query("SELECT iu FROM IdiomaUsuario iu " +
           "JOIN FETCH iu.idioma i " +
           "LEFT JOIN FETCH i.criador " +
           "WHERE iu.usuario.id = :usuarioId")
    List<IdiomaUsuario> findByUsuarioIdFetchIdioma(@Param("usuarioId") Long usuarioId);

    int countByUsuarioId(Long usuarioId);

    @Modifying
    void deleteByIdiomaId(Long idiomaId);

    @Modifying
    void deleteByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);
}
