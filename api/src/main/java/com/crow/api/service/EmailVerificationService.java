package com.crow.api.service;

import com.crow.api.dto.auth.FinalidadeCodigo;
import com.crow.api.util.CorpoEmail;
import com.crow.api.util.EmailLayout;
import com.crow.api.util.EmailTemplates;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JavaMailSender mailSender;

    private record CodigoVerificacao(String codigo, LocalDateTime criadoEm) {}

    private final ConcurrentHashMap<String, CodigoVerificacao> codigos = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> emailsVerificados = new ConcurrentHashMap<>();

    private static final int EXPIRACAO_MINUTOS = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Gera e envia um código de 6 dígitos. A finalidade só escolhe o texto do
     * e-mail (verificação de e-mail ou redefinição de senha); nula vale como
     * verificação. Síncrono de propósito: se o envio falhar, o usuário precisa saber.
     */
    public void enviarCodigo(String email, FinalidadeCodigo finalidade) {
        // Limpar códigos expirados
        codigos.entrySet().removeIf(entry ->
                entry.getValue().criadoEm().plusMinutes(EXPIRACAO_MINUTOS).isBefore(LocalDateTime.now()));

        // Gerar código de 6 dígitos (gerador criptograficamente seguro)
        String codigo = String.format("%06d", RANDOM.nextInt(1000000));

        // Armazenar
        codigos.put(email.toLowerCase(), new CodigoVerificacao(codigo, LocalDateTime.now()));

        boolean redefinicao = finalidade == FinalidadeCodigo.REDEFINICAO_SENHA;
        String assunto = EmailTemplates.assunto(redefinicao
                ? EmailTemplates.ASSUNTO_CODIGO_REDEFINICAO
                : EmailTemplates.ASSUNTO_CODIGO_VERIFICACAO);
        CorpoEmail corpo = redefinicao
                ? EmailTemplates.codigoRedefinicaoSenha(codigo, EXPIRACAO_MINUTOS)
                : EmailTemplates.codigoVerificacaoEmail(codigo, EXPIRACAO_MINUTOS);

        try {
            MimeMessage mensagem = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mensagem, MimeMessageHelper.MULTIPART_MODE_RELATED, StandardCharsets.UTF_8.name());
            helper.setTo(email);
            helper.setSubject(assunto);
            EmailLayout.preencher(helper, corpo);

            mailSender.send(mensagem);
        } catch (Exception e) {
            codigos.remove(email.toLowerCase());
            log.error("Falha ao enviar email de verificação para {}", email, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao enviar email. Verifique se o endereço é válido.");
        }
    }

    public boolean verificarCodigo(String email, String codigo) {
        CodigoVerificacao registro = codigos.get(email.toLowerCase());

        if (registro == null) {
            return false;
        }

        // Verificar expiração
        if (registro.criadoEm().plusMinutes(EXPIRACAO_MINUTOS).isBefore(LocalDateTime.now())) {
            codigos.remove(email.toLowerCase());
            return false;
        }

        if (registro.codigo().equals(codigo)) {
            codigos.remove(email.toLowerCase());
            emailsVerificados.put(email.toLowerCase(), LocalDateTime.now());
            return true;
        }

        return false;
    }

    public boolean isEmailVerificado(String email) {
        LocalDateTime verificadoEm = emailsVerificados.get(email.toLowerCase());
        if (verificadoEm == null) {
            return false;
        }
        if (verificadoEm.plusMinutes(EXPIRACAO_MINUTOS).isBefore(LocalDateTime.now())) {
            emailsVerificados.remove(email.toLowerCase());
            return false;
        }
        return true;
    }

    public void consumirVerificacao(String email) {
        emailsVerificados.remove(email.toLowerCase());
    }
}
