package com.crow.api.config;

import jakarta.mail.Address;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Entrega os e-mails por HTTPS a um relay — o Worker do Cloudflare, que faz o
 * SMTP no Gmail.
 *
 * <p>Existe porque o plano gratuito do Render bloqueia a saída nas portas SMTP
 * (25, 465 e 587). A mensagem continua sendo montada pelo JavaMail exatamente
 * como no envio direto (layout, logo embutida, cabeçalhos); só o transporte muda.
 * O relay recebe a mensagem pronta (RFC 822) e a lista de destinatários.</p>
 *
 * <p>Ativo apenas com {@code app.mail.relay.url} definido. Sem ele, o Spring Boot
 * monta o {@link JavaMailSenderImpl} padrão a partir de {@code spring.mail.*}.
 * Falhas viram {@link MailSendException}, como no SMTP, então
 * {@link com.crow.api.service.EmailService} e
 * {@link com.crow.api.service.EmailVerificationService} tratam os dois casos igual.</p>
 */
@Component
@ConditionalOnProperty("app.mail.relay.url")
public class EmailRelaySender extends JavaMailSenderImpl {

    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(TIMEOUT).build();
    private final URI url;
    private final String token;
    private final String remetente;

    public EmailRelaySender(@Value("${app.mail.relay.url}") String url,
                            @Value("${app.mail.relay.token}") String token,
                            @Value("${app.mail.remetente:${spring.mail.username:}}") String remetente) {
        this.url = URI.create(url);
        this.token = token;
        this.remetente = remetente;
    }

    @Override
    protected void doSend(MimeMessage[] mimeMessages, Object[] originalMessages) {
        Map<Object, Exception> falhas = new LinkedHashMap<>();
        for (int i = 0; i < mimeMessages.length; i++) {
            MimeMessage mensagem = mimeMessages[i];
            try {
                entregar(mensagem);
            } catch (Exception e) {
                if (e instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                }
                falhas.put(originalMessages != null ? originalMessages[i] : mensagem, e);
            }
        }
        if (!falhas.isEmpty()) {
            throw new MailSendException(falhas);
        }
    }

    private void entregar(MimeMessage mensagem) throws Exception {
        // O código de verificação não define remetente; no SMTP direto o Gmail
        // completava com a conta autenticada. Aqui o cabeçalho vai explícito.
        if (mensagem.getFrom() == null && !remetente.isBlank()) {
            mensagem.setFrom(new InternetAddress(remetente));
        }
        mensagem.saveChanges();

        List<String> destinatarios = new ArrayList<>();
        Address[] todos = mensagem.getAllRecipients();
        if (todos != null) {
            for (Address endereco : todos) {
                if (endereco instanceof InternetAddress internet) {
                    destinatarios.add(internet.getAddress());
                }
            }
        }
        if (destinatarios.isEmpty()) {
            throw new MessagingException("Mensagem sem destinatários");
        }

        // Bcc fica fora do conteúdo, como faz o transporte SMTP do JavaMail.
        ByteArrayOutputStream conteudo = new ByteArrayOutputStream();
        mensagem.writeTo(conteudo, new String[]{"Bcc", "Content-Length"});

        HttpRequest requisicao = HttpRequest.newBuilder(url)
                .timeout(TIMEOUT)
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "message/rfc822")
                .header("X-Destinatarios", String.join(",", destinatarios))
                .POST(HttpRequest.BodyPublishers.ofByteArray(conteudo.toByteArray()))
                .build();
        HttpResponse<String> resposta = http.send(requisicao, HttpResponse.BodyHandlers.ofString());
        if (resposta.statusCode() / 100 != 2) {
            throw new MessagingException("Relay de e-mail respondeu HTTP " + resposta.statusCode()
                    + ": " + resposta.body());
        }
    }
}
