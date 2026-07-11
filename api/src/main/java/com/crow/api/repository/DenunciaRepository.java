package com.crow.api.repository;

import com.crow.api.entity.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {
    List<Denuncia> findByIdiomaId(Long idiomaId);

    /**
     * Todas as denúncias (mais recentes primeiro) com idioma, denunciante e
     * responsável já carregados — evita LazyInitializationException na montagem
     * do DTO, já que open-in-view está desabilitado.
     */
    @Query("SELECT d FROM Denuncia d "
            + "LEFT JOIN FETCH d.idioma "
            + "LEFT JOIN FETCH d.usuario "
            + "LEFT JOIN FETCH d.responsavel "
            + "ORDER BY d.data DESC")
    List<Denuncia> findAllComRelacionamentos();
}
