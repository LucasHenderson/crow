package com.crow.api.service;

import com.crow.api.entity.LogAdmin;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.LogAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogAdminService {

    /** Prefixo que identifica, na listagem de logs, as ações recusadas. */
    public static final String PREFIXO_BLOQUEIO = "Tentativa bloqueada: ";

    /** Prefixo das ações executadas pelo próprio sistema, sem administrador responsável. */
    public static final String PREFIXO_SISTEMA = "Ação automática do sistema: ";

    /** Tamanhos das colunas de {@link LogAdmin} — textos maiores são cortados, nunca recusados. */
    private static final int LIMITE_ACAO = 200;
    private static final int LIMITE_DETALHES = 1000;
    private static final String RETICENCIAS = "…";

    private final LogAdminRepository logAdminRepository;

    /**
     * Registra uma ação administrativa. {@code acao} e {@code detalhes} são
     * cortados no tamanho da coluna: o log é escrito depois de a ação já ter
     * acontecido, então uma justificativa longa não pode transformar um
     * sucesso em erro 500.
     */
    public LogAdmin registrar(Usuario admin, LogAdmin.TipoLog tipo, String acao, String detalhes) {
        LogAdmin log = LogAdmin.builder()
                .admin(admin)
                .tipo(tipo)
                .acao(limitar(acao, LIMITE_ACAO))
                .detalhes(limitar(detalhes, LIMITE_DETALHES))
                .build();
        return logAdminRepository.save(log);
    }

    /**
     * Registra uma ação administrativa que foi recusada (por exemplo, um admin
     * tentando alterar conteúdo de outro usuário ou enviar campos proibidos).
     *
     * <p>Roda em transação própria ({@code REQUIRES_NEW}) porque quem chama
     * lança uma exceção logo em seguida para responder 403/400 — se o registro
     * participasse da transação do chamador, o rollback apagaria o log junto.</p>
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public LogAdmin registrarTentativaBloqueada(Usuario admin, LogAdmin.TipoLog tipo,
                                                String acao, String detalhes) {
        return registrar(admin, tipo, PREFIXO_BLOQUEIO + acao, detalhes);
    }

    /**
     * Registra uma ação executada pelo próprio sistema, sem administrador
     * responsável — por exemplo, a reativação de uma conta cuja suspensão
     * venceu. Fica com {@code admin} nulo e a ação prefixada por
     * {@link #PREFIXO_SISTEMA}, para ser reconhecida na listagem.
     */
    public LogAdmin registrarAcaoSistema(LogAdmin.TipoLog tipo, String acao, String detalhes) {
        return registrar(null, tipo, PREFIXO_SISTEMA + acao, detalhes);
    }

    public List<LogAdmin> listarTodos() {
        return logAdminRepository.findAllComAdmin();
    }

    private static String limitar(String texto, int limite) {
        if (texto == null || texto.length() <= limite) {
            return texto;
        }
        return texto.substring(0, limite - RETICENCIAS.length()) + RETICENCIAS;
    }
}
