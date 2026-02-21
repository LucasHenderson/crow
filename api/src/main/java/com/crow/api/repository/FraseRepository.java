package com.crow.api.repository;

import com.crow.api.entity.Frase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FraseRepository extends JpaRepository<Frase, Long> {
    List<Frase> findByModuloId(Long moduloId);
    int countByModuloId(Long moduloId);
}
