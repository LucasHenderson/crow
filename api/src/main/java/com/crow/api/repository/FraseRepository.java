package com.crow.api.repository;

import com.crow.api.entity.Frase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FraseRepository extends JpaRepository<Frase, Long> {

    /**
     * Frases de um módulo na ordem de cadastro (id crescente). Garante uma
     * ordem estável e determinística — usada na listagem, na importação e no
     * modo de jogo "Ordem de Cadastro".
     */
    List<Frase> findByModuloIdOrderByIdAsc(Long moduloId);

    int countByModuloId(Long moduloId);
}
