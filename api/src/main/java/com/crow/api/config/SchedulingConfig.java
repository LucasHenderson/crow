package com.crow.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Habilita as tarefas agendadas ({@code @Scheduled}) da aplicação.
 *
 * <p>Hoje há uma única tarefa: a reativação automática das contas cuja
 * suspensão temporária venceu
 * ({@link com.crow.api.service.ReativacaoAutomaticaScheduler}). O agendador
 * usa o {@code TaskScheduler} padrão do Spring Boot (uma thread, prefixo
 * {@code scheduling-}), suficiente para tarefas curtas e pouco frequentes.</p>
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
