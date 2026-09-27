package com.crow.api.dto.log;

import com.crow.api.entity.LogAdmin;
import com.crow.api.service.LogAdminService;

import java.time.format.DateTimeFormatter;

/**
 * Log administrativo como a aba de Logs o consome. {@code acaoSistema} e
 * {@code bloqueada} são derivados aqui (admin nulo / prefixo de {@code acao})
 * para o frontend não repetir essas regras; os prefixos antigos continuam
 * reconhecidos por causa dos registros históricos.
 */
public record LogAdminResponse(
    String codigo,
    String data,
    String codigoAdmin,
    String adminNome,
    /** Sem administrador responsável: executada pelo próprio sistema (ex.: reativação agendada). */
    boolean acaoSistema,
    /** Tentativa recusada pelo backend, registrada para auditoria. */
    boolean bloqueada,
    String acao,
    String detalhes,
    String tipo,
    EntidadeAfetada usuarioAfetado,
    EntidadeAfetada idiomaAfetado
) {

    /** Retrato de quem foi afetado, como estava na hora da ação. */
    public record EntidadeAfetada(String codigo, String nome) {}

    public static LogAdminResponse from(LogAdmin log) {
        var admin = log.getAdmin();
        String acao = log.getAcao() != null ? log.getAcao() : "";
        return new LogAdminResponse(
                "LOG-" + log.getId(),
                log.getData() != null ? log.getData().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "",
                admin != null ? admin.getCodigo() : null,
                admin != null ? admin.getNome() : null,
                admin == null,
                acao.startsWith(LogAdminService.PREFIXO_TENTATIVA)
                        || acao.startsWith(LogAdminService.PREFIXO_BLOQUEIO_LEGADO),
                acao,
                log.getDetalhes(),
                log.getTipo() != null ? log.getTipo().name().toLowerCase() : "",
                usuarioAfetado(log),
                idiomaAfetado(log)
        );
    }

    private static EntidadeAfetada usuarioAfetado(LogAdmin log) {
        var usuario = log.getUsuarioAfetado();
        if (usuario == null && log.getUsuarioAfetadoCodigo() == null) {
            return null;
        }
        // O retrato em texto prevalece: é o nome da época; a FK só cobre registros sem ele.
        return new EntidadeAfetada(
                log.getUsuarioAfetadoCodigo() != null ? log.getUsuarioAfetadoCodigo()
                        : usuario != null ? usuario.getCodigo() : null,
                log.getUsuarioAfetadoNome() != null ? log.getUsuarioAfetadoNome()
                        : usuario != null ? usuario.getNome() : null
        );
    }

    private static EntidadeAfetada idiomaAfetado(LogAdmin log) {
        if (log.getIdiomaAfetadoId() == null && log.getIdiomaAfetadoCodigo() == null
                && log.getIdiomaAfetadoNome() == null) {
            return null;
        }
        return new EntidadeAfetada(log.getIdiomaAfetadoCodigo(), log.getIdiomaAfetadoNome());
    }
}
