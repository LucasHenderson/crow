package com.crow.api.repository;

import com.crow.api.entity.LogAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LogAdminRepository extends JpaRepository<LogAdmin, Long> {

    /**
     * Todos os logs (mais recentes primeiro) com o admin e o usuário afetado
     * já carregados — evita LazyInitializationException na montagem da
     * resposta, já que open-in-view está desabilitado.
     */
    @Query("SELECT l FROM LogAdmin l LEFT JOIN FETCH l.admin LEFT JOIN FETCH l.usuarioAfetado ORDER BY l.data DESC")
    List<LogAdmin> findAllComAdmin();
}
