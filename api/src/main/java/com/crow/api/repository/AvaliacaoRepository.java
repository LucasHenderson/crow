package com.crow.api.repository;

import com.crow.api.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    Optional<Avaliacao> findByUsuarioIdAndIdiomaId(String usuarioId, String idiomaId);
    List<Avaliacao> findByIdiomaId(String idiomaId);
}
