package com.crow.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JavaMailSender mailSender;

    private record CodigoVerificacao(String codigo, LocalDateTime criadoEm) {}

    private final ConcurrentHashMap<String, CodigoVerificacao> codigos = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> emailsVerificados = new ConcurrentHashMap<>();

    private static final int EXPIRACAO_MINUTOS = 10;

    public void enviarCodigo(String email) {
        // Limpar códigos expirados
        codigos.entrySet().removeIf(entry ->
                entry.getValue().criadoEm().plusMinutes(EXPIRACAO_MINUTOS).isBefore(LocalDateTime.now()));

        // Gerar código de 6 dígitos
        String codigo = String.format("%06d", new Random().nextInt(1000000));

        // Armazenar
        codigos.put(email.toLowerCase(), new CodigoVerificacao(codigo, LocalDateTime.now()));

        // Enviar email
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(email);
        mensagem.setSubject("Crow - Código de Verificação");
        mensagem.setText(
                "Olá!\n\n" +
                "Seu código de verificação para o Crow é:\n\n" +
                "    " + codigo + "\n\n" +
                "Este código expira em " + EXPIRACAO_MINUTOS + " minutos.\n\n" +
                "Se você não solicitou este código, ignore este email.\n\n" +
                "- Equipe Crow"
        );

        try {
            mailSender.send(mensagem);
        } catch (Exception e) {
            codigos.remove(email.toLowerCase());
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
