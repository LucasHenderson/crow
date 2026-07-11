package com.crow.api.service;

import com.crow.api.entity.LogAdmin;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.LogAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogAdminService {

    private final LogAdminRepository logAdminRepository;

    public LogAdmin registrar(Usuario admin, LogAdmin.TipoLog tipo, String acao, String detalhes) {
        LogAdmin log = LogAdmin.builder()
                .admin(admin)
                .tipo(tipo)
                .acao(acao)
                .detalhes(detalhes)
                .build();
        return logAdminRepository.save(log);
    }

    public List<LogAdmin> listarTodos() {
        return logAdminRepository.findAllComAdmin();
    }
}
