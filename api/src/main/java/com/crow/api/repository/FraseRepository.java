package com.crow.api.repository;

import com.crow.api.entity.Frase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FraseRepository extends JpaRepository<Frase, Long> {

    /**
     * Frases de um módulo na ordem definida pelo criador, com o id como
     * desempate. Garante uma ordem estável e determinística — usada na
     * listagem, na importação e no modo de jogo "Ordem de Cadastro". Registros
     * sem ordem (anteriores ao backfill) ficam no fim.
     */
    List<Frase> findByModuloIdOrderByOrdemAscIdAsc(Long moduloId);

    int countByModuloId(Long moduloId);

    /** Maior posição já usada no módulo — base para a ordem da próxima frase. */
    @Query("SELECT MAX(f.ordem) FROM Frase f WHERE f.modulo.id = :moduloId")
    Integer maiorOrdemDoModulo(@Param("moduloId") Long moduloId);

    /** Módulos com ao menos uma frase sem ordem — pendências do backfill. */
    @Query("SELECT DISTINCT f.modulo.id FROM Frase f WHERE f.ordem IS NULL")
    List<Long> modulosComFraseSemOrdem();

    int countByModuloIdAndOrdemIsNull(Long moduloId);

    /**
     * Ids das frases do módulo na ordem vigente, sem carregar as entidades
     * (que trazem vários campos TEXT). Usado pelo backfill junto de
     * {@link #definirOrdem}.
     */
    @Query("SELECT f.id FROM Frase f WHERE f.modulo.id = :moduloId ORDER BY f.ordem ASC, f.id ASC")
    List<Long> idsNaOrdemVigente(@Param("moduloId") Long moduloId);

    /** Grava a posição direto no banco, sem carregar a frase. */
    @Modifying
    @Query("UPDATE Frase f SET f.ordem = :ordem WHERE f.id = :id")
    void definirOrdem(@Param("id") Long id, @Param("ordem") Integer ordem);
}
