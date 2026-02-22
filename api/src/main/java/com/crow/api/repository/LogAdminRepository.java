package com.crow.api.repository;

import com.crow.api.entity.LogAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogAdminRepository extends JpaRepository<LogAdmin, Long> {
    List<LogAdmin> findByTipo(LogAdmin.TipoLog tipo);
    List<LogAdmin> findByAdminId(Long adminId);
    List<LogAdmin> findAllByOrderByDataDesc();
}
