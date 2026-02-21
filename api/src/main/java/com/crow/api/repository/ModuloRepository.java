package com.crow.api.repository;

import com.crow.api.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuloRepository extends JpaRepository<Modulo, Long> {
    List<Modulo> findByIdiomaId(String idiomaId);
    int countByIdiomaId(String idiomaId);
}
