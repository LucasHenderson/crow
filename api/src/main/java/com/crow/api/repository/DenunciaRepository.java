package com.crow.api.repository;

import com.crow.api.entity.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {
    List<Denuncia> findByStatus(Denuncia.StatusDenuncia status);
    List<Denuncia> findByIdiomaId(String idiomaId);
    List<Denuncia> findByUsuarioId(String usuarioId);
}
