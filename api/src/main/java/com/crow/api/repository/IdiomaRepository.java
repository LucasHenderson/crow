package com.crow.api.repository;

import com.crow.api.entity.Idioma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IdiomaRepository extends JpaRepository<Idioma, Long> {

    /** Busca pelo identificador público (codigo), usado nas rotas no lugar do id. */
    Optional<Idioma> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    /** Registros anteriores à criação da coluna — preenchidos pelo backfill. */
    List<Idioma> findByCodigoIsNull();

    /**
     * Backfill de {@code atualizadoEm} nos registros anteriores à criação da
     * coluna. É um update em massa de propósito: passar pelas entidades
     * dispararia o {@code @PreUpdate} do Idioma, que sobrescreveria o valor
     * copiado de {@code criadoEm} pelo instante atual.
     */
    @Modifying
    @Query("UPDATE Idioma i SET i.atualizadoEm = i.criadoEm "
            + "WHERE i.atualizadoEm IS NULL AND i.criadoEm IS NOT NULL")
    int preencherAtualizadoEmComCriadoEm();

    List<Idioma> findByCriadorId(Long criadorId);

    /** Idiomas de um criador filtrados por visibilidade (perfil público de usuário). */
    List<Idioma> findByVisibilidadeAndCriadorId(Idioma.Visibilidade visibilidade, Long criadorId);

    /** Idiomas públicos que NÃO pertencem ao usuário informado. */
    List<Idioma> findByVisibilidadeAndCriadorIdNot(Idioma.Visibilidade visibilidade, Long criadorId);

    /** Busca por termo restrita a idiomas públicos de outros usuários. */
    @Query("SELECT i FROM Idioma i WHERE i.visibilidade = :vis AND i.criador.id <> :userId "
            + "AND (LOWER(i.nome) LIKE LOWER(CONCAT('%', :termo, '%')) "
            + "OR LOWER(i.idioma) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Idioma> buscarPublicosPorTermo(@Param("vis") Idioma.Visibilidade vis,
                                        @Param("userId") Long userId,
                                        @Param("termo") String termo);
}
