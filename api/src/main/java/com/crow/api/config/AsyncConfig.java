package com.crow.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Habilita a execução assíncrona e define o pool usado pelo envio de e-mails.
 *
 * <p>O SMTP é lento e pode falhar (rede, autenticação, limite do provedor).
 * Sem o pool, uma ação administrativa como desativar uma conta ficaria presa
 * esperando o servidor de e-mail responder — por isso {@link com.crow.api.service.EmailService}
 * roda fora da thread que atende a requisição HTTP.</p>
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /** Nome do executor referenciado em {@code @Async("emailExecutor")}. */
    public static final String EMAIL_EXECUTOR = "emailExecutor";

    @Bean(EMAIL_EXECUTOR)
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("crow-email-");
        // Se a fila encher, o envio acontece na thread que chamou em vez de ser
        // descartado: o usuário espera um pouco, mas nenhum aviso se perde.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // Deixa os envios pendentes terminarem quando a aplicação for encerrada.
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(15);
        executor.initialize();
        return executor;
    }
}
