package com.crow.api.service;

import com.crow.api.config.AsyncConfig;
import com.crow.api.entity.Usuario;
import com.crow.api.util.EmailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

/**
 * Envia os avisos que acompanham as ações administrativas (mensagem direta,
 * desativação, suspensão, reativação e remoção de idioma).
 *
 * <p>Duas garantias sustentam este serviço:</p>
 * <ul>
 *   <li><b>Assíncrono</b> — cada método roda no pool de {@link AsyncConfig},
 *       então o SMTP nunca segura a resposta HTTP da ação administrativa.</li>
 *   <li><b>Não derruba a ação principal</b> — toda falha vira log de erro.
 *       Desativar uma conta precisa funcionar mesmo com o e-mail fora do ar.
 *       Como consequência, quem chama não recebe confirmação de entrega.</li>
 * </ul>
 *
 * <p>Os textos ficam em {@link EmailTemplates}; aqui só há envio, validação e log.
 * O código de verificação de cadastro continua em {@link EmailVerificationService},
 * que é síncrono de propósito — lá a falha precisa chegar ao usuário.</p>
 *
 * <p>O {@link Usuario} recebido é lido fora da thread da requisição, então passe
 * sempre uma entidade já carregada (nunca uma referência preguiçosa).</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Remetente dos avisos. Por padrão usa a conta configurada em
     * {@code spring.mail.username}; defina {@code app.mail.remetente} para
     * enviar de outro endereço. Vazio deixa o próprio servidor SMTP decidir.
     */
    @Value("${app.mail.remetente:${spring.mail.username:}}")
    private String remetente;

    /** Checagem simples de formato — o objetivo é evitar envio para lixo, não validar RFC. */
    private static final Pattern EMAIL_VALIDO =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}$");

    // ===================== API pública =====================

    /**
     * Mensagem livre escrita por um administrador para um usuário.
     * Nada é enviado se a mensagem vier vazia — não há conteúdo a comunicar.
     */
    @Async(AsyncConfig.EMAIL_EXECUTOR)
    public void enviarEmailPersonalizado(Usuario destinatario, String assunto, String mensagem) {
        if (!podeEnviar(destinatario, "mensagem personalizada")) {
            return;
        }
        if (!EmailTemplates.preenchido(mensagem)) {
            log.warn("E-mail personalizado ignorado: mensagem vazia para o usuário {}",
                    identificacao(destinatario));
            return;
        }
        enviar(destinatario,
                EmailTemplates.assunto(assunto),
                EmailTemplates.personalizado(primeiroNome(destinatario), mensagem),
                "mensagem personalizada");
    }

    /** Aviso de que a conta foi desativada. A justificativa é opcional. */
    @Async(AsyncConfig.EMAIL_EXECUTOR)
    public void enviarAvisoContaDesativada(Usuario destinatario, String justificativa) {
        if (!podeEnviar(destinatario, "aviso de conta desativada")) {
            return;
        }
        enviar(destinatario,
                EmailTemplates.assunto(EmailTemplates.ASSUNTO_CONTA_DESATIVADA),
                EmailTemplates.contaDesativada(primeiroNome(destinatario), justificativa),
                "aviso de conta desativada");
    }

    /**
     * Aviso de suspensão temporária. Justificativa e data de reativação são
     * opcionais; sem data, o texto informa que a previsão ainda será definida.
     */
    @Async(AsyncConfig.EMAIL_EXECUTOR)
    public void enviarAvisoContaSuspensa(Usuario destinatario, String justificativa,
                                         LocalDateTime reativacaoPrevista) {
        if (!podeEnviar(destinatario, "aviso de conta suspensa")) {
            return;
        }
        enviar(destinatario,
                EmailTemplates.assunto(EmailTemplates.ASSUNTO_CONTA_SUSPENSA),
                EmailTemplates.contaSuspensa(primeiroNome(destinatario), justificativa, reativacaoPrevista),
                "aviso de conta suspensa");
    }

    /** Aviso de que a conta voltou a ficar disponível. */
    @Async(AsyncConfig.EMAIL_EXECUTOR)
    public void enviarAvisoContaReativada(Usuario destinatario) {
        if (!podeEnviar(destinatario, "aviso de conta reativada")) {
            return;
        }
        enviar(destinatario,
                EmailTemplates.assunto(EmailTemplates.ASSUNTO_CONTA_REATIVADA),
                EmailTemplates.contaReativada(primeiroNome(destinatario)),
                "aviso de conta reativada");
    }

    /**
     * Aviso ao criador de um idioma removido pela moderação. A mensagem
     * explicativa é opcional; sem ela, o texto usa o motivo padrão.
     */
    @Async(AsyncConfig.EMAIL_EXECUTOR)
    public void enviarAvisoIdiomaExcluido(Usuario destinatario, String nomeIdioma, String mensagem) {
        if (!podeEnviar(destinatario, "aviso de idioma excluído")) {
            return;
        }
        enviar(destinatario,
                EmailTemplates.assunto(EmailTemplates.ASSUNTO_IDIOMA_EXCLUIDO),
                EmailTemplates.idiomaExcluido(primeiroNome(destinatario), nomeIdioma, mensagem),
                "aviso de idioma excluído");
    }

    // ===================== Envio e validação =====================

    /**
     * Ponto único de saída. Qualquer falha de SMTP para aqui: vira log de erro
     * e não volta para quem chamou, porque a ação administrativa já aconteceu.
     */
    private void enviar(Usuario destinatario, String assunto, String corpo, String tipo) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        if (EmailTemplates.preenchido(remetente)) {
            mensagem.setFrom(remetente);
        }
        mensagem.setTo(destinatario.getEmail());
        mensagem.setSubject(assunto);
        mensagem.setText(corpo);

        try {
            mailSender.send(mensagem);
            log.info("E-mail enviado ({}) para o usuário {}", tipo, identificacao(destinatario));
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail ({}) para o usuário {}", tipo,
                    identificacao(destinatario), e);
        }
    }

    /** Recusa o envio, com log, quando não há destinatário ou o e-mail é inutilizável. */
    private boolean podeEnviar(Usuario destinatario, String tipo) {
        if (destinatario == null) {
            log.warn("E-mail ({}) ignorado: destinatário nulo", tipo);
            return false;
        }
        if (!emailValido(destinatario.getEmail())) {
            log.warn("E-mail ({}) ignorado: endereço ausente ou inválido para o usuário {}",
                    tipo, identificacao(destinatario));
            return false;
        }
        return true;
    }

    private boolean emailValido(String email) {
        return EmailTemplates.preenchido(email) && EMAIL_VALIDO.matcher(email.trim()).matches();
    }

    private String primeiroNome(Usuario destinatario) {
        return EmailTemplates.primeiroNome(destinatario.getNome());
    }

    /** Identifica o usuário no log sem expor o e-mail completo. */
    private String identificacao(Usuario destinatario) {
        return destinatario.getCodigo() != null
                ? destinatario.getCodigo()
                : String.valueOf(destinatario.getId());
    }
}
