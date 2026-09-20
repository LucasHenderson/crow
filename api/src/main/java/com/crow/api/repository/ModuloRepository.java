package com.crow.api.repository;

import com.crow.api.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ModuloRepository extends JpaRepository<Modulo, Long> {

    /**
     * Módulos de um idioma na ordem definida pelo criador, com o id como
     * desempate. Registros sem ordem (anteriores ao backfill) ficam no fim.
     */
    List<Modulo> findByIdiomaIdOrderByOrdemAscIdAsc(Long idiomaId);

    int countByIdiomaId(Long idiomaId);

    /** Maior posição já usada no idioma — base para a ordem do próximo módulo. */
    @Query("SELECT MAX(m.ordem) FROM Modulo m WHERE m.idioma.id = :idiomaId")
    Integer maiorOrdemDoIdioma(@Param("idiomaId") Long idiomaId);

    /** Idiomas com ao menos um módulo sem ordem — pendências do backfill. */
    @Query("SELECT DISTINCT m.idioma.id FROM Modulo m WHERE m.ordem IS NULL")
    List<Long> idiomasComModuloSemOrdem();

    int countByIdiomaIdAndOrdemIsNull(Long idiomaId);

    /**
     * Ids dos módulos do idioma na ordem vigente, sem carregar as entidades.
     * Usado pelo backfill junto de {@link #definirOrdem}.
     */
    @Query("SELECT m.id FROM Modulo m WHERE m.idioma.id = :idiomaId ORDER BY m.ordem ASC, m.id ASC")
    List<Long> idsNaOrdemVigente(@Param("idiomaId") Long idiomaId);

    /**
     * Grava a posição direto no banco. É um update em massa de propósito:
     * passar pela entidade dispararia o {@code @PreUpdate} do Modulo, que
     * marcaria como "atualizado agora" módulos que o backfill apenas numerou.
     */
    @Modifying
    @Query("UPDATE Modulo m SET m.ordem = :ordem WHERE m.id = :id")
    void definirOrdem(@Param("id") Long id, @Param("ordem") Integer ordem);
}
