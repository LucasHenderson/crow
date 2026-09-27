package com.crow.api.service;

import com.crow.api.config.SchedulingConfig;
import com.crow.api.entity.LogAdmin;
import com.crow.api.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Encerra as suspensões temporárias vencidas: a cada 5 minutos procura contas
 * INATIVO com {@code suspensoAte} no passado, devolve cada uma a ATIVO, avisa
 * o usuário por e-mail e registra a ação no log administrativo como ação
 * automática do sistema (sem administrador). Habilitado por {@link SchedulingConfig}.
 *
 * <p>Cada conta é tratada na sua própria transação
 * ({@link UsuarioService#reativarSuspensaoVencida}) e dentro de um
 * {@code try/catch}: uma falha — banco, e-mail, log — é registrada e o
 * processamento segue para a próxima conta. Como a condição é reconferida
 * dentro da transação, uma conta que o administrador já tenha mexido entre a
 * listagem e a reativação é simplesmente pulada.</p>
 *
 * <p>{@code fixedDelay} conta a partir do fim da execução anterior, então duas
 * rodadas nunca se sobrepõem.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReativacaoAutomaticaScheduler {

    private final UsuarioService usuarioService;
    private final EmailService emailService;
    private final LogAdminService logAdminService;

    @Scheduled(fixedDelay = 5, timeUnit = TimeUnit.MINUTES)
    public void reativarSuspensoesVencidas() {
        List<Usuario> vencidas = usuarioService.buscarSuspensoesVencidas();
        if (vencidas.isEmpty()) {
            return;
        }
        log.info("Reativação automática: {} conta(s) com suspensão vencida", vencidas.size());

        for (Usuario candidata : vencidas) {
            try {
                // A reativação zera suspensoAte; o prazo vencido é guardado antes, para o log.
                LocalDateTime prazo = candidata.getSuspensoAte();
                usuarioService.reativarSuspensaoVencida(candidata.getId())
                        .ifPresent(reativada -> avisarReativacao(reativada, prazo));
            } catch (Exception e) {
                log.error("Reativação automática: falha ao reativar a conta {}",
                        candidata.getCodigo(), e);
            }
        }
    }

    /** E-mail e log de uma conta já reativada (transação da reativação já confirmada). */
    private void avisarReativacao(Usuario usuario, LocalDateTime prazo) {
        emailService.enviarAvisoContaReativada(usuario);
        logAdminService.registrarAcaoSistema(LogAdminService
                .registroSistema(LogAdmin.TipoLog.MODERACAO, "Reativou conta de usuário")
                .usuarioAfetado(usuario)
                .detalhe("modalidade", "automática")
                .detalhe("motivo", "fim da suspensão temporária")
                .detalhe("prazo vencido em", prazo));
        log.info("Reativação automática: conta {} reativada", usuario.getCodigo());
    }
}
