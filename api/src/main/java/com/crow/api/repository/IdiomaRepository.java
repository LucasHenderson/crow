package com.crow.api.repository;

import com.crow.api.entity.Idioma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IdiomaRepository extends JpaRepository<Idioma, Long> {
    List<Idioma> findByCriadorId(Long criadorId);
    List<Idioma> findByVisibilidade(Idioma.Visibilidade visibilidade);
    List<Idioma> findByNomeContainingIgnoreCaseOrIdiomaContainingIgnoreCase(String nome, String idioma);
    List<Idioma> findByProficiencia(Idioma.Proficiencia proficiencia);
}
