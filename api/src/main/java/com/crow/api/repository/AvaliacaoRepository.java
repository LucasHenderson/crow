package com.crow.api.repository;

import com.crow.api.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    Optional<Avaliacao> findByUsuarioIdAndIdiomaId(Long usuarioId, Long idiomaId);
    List<Avaliacao> findByIdiomaId(Long idiomaId);

    @Modifying
    void deleteByIdiomaId(Long idiomaId);
}
