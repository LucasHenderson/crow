package com.crow.api.util;

import com.crow.api.util.EmailLayout.Tom;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Textos de todos os e-mails enviados pelo Crow: os avisos da moderação
 * ({@link com.crow.api.service.EmailService}) e os códigos de verificação
 * ({@link com.crow.api.service.EmailVerificationService}).
 *
 * <p>Tudo que o usuário lê está reunido aqui — assuntos, títulos, parágrafos,
 * saudação, assinatura e as mensagens usadas quando a moderação não informa um
 * motivo. Para ajustar a redação basta alterar as constantes desta classe; a
 * apresentação (HTML) fica em {@link EmailLayout} e os serviços cuidam apenas
 * do envio, da validação e do registro em log.</p>
 *
 * <p>Cada construtor devolve um {@link CorpoEmail} com o mesmo conteúdo em
 * texto puro e em HTML. Os textos usam {@code %s} como marcador, na ordem
 * documentada em cada constante.</p>
 */
public final class EmailTemplates {

    private EmailTemplates() {
    }

    // ===================== Estrutura comum =====================

    /** Todo assunto sai prefixado, para o usuário identificar a origem na caixa de entrada. */
    public static final String PREFIXO_ASSUNTO = "Crow - ";

    /** Saudação usada quando o nome do destinatário está disponível (%s = primeiro nome). */
    private static final String SAUDACAO = "Olá, %s!";

    /** Saudação de reserva, usada quando o cadastro não tem nome preenchido. */
    private static final String SAUDACAO_SEM_NOME = "Olá!";

    private static final String ASSINATURA = """
            Atenciosamente,
            Equipe Crow""";

    /**
     * Formato das datas exibidas nos e-mails (ex.: 05/10/2026 às 14:30).
     * Público para que a mensagem de login e o log administrativo mostrem a
     * previsão de reativação exatamente como ela aparece no e-mail.
     */
    public static final DateTimeFormatter FORMATO_DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    // ===================== Assuntos =====================

    /** Usado quando o administrador envia uma mensagem sem preencher o assunto. */
    public static final String ASSUNTO_PERSONALIZADO_PADRAO = "Mensagem da equipe";
    public static final String ASSUNTO_CONTA_DESATIVADA = "Sua conta foi desativada";
    public static final String ASSUNTO_CONTA_SUSPENSA = "Sua conta foi suspensa temporariamente";
    public static final String ASSUNTO_CONTA_REATIVADA = "Sua conta foi reativada";
    public static final String ASSUNTO_IDIOMA_EXCLUIDO = "Um idioma que você criou foi removido";
    public static final String ASSUNTO_CODIGO_VERIFICACAO = "Código de verificação";
    public static final String ASSUNTO_CODIGO_REDEFINICAO = "Redefinição de senha";

    // ===================== Motivos padrão =====================

    /** Usado quando a moderação desativa ou suspende uma conta sem escrever justificativa. */
    public static final String MOTIVO_PADRAO_CONTA =
            "A decisão foi tomada pela equipe de moderação após a análise da sua conta.";

    /** Usado quando um idioma é removido sem mensagem explicativa. */
    public static final String MOTIVO_PADRAO_IDIOMA =
            "O conteúdo não atendia às diretrizes de uso da plataforma.";

    /** Usado quando, por algum motivo, o idioma removido chega sem nome. */
    public static final String IDIOMA_SEM_NOME = "sem nome";

    /** Usado quando a suspensão não tem data de reativação definida. */
    public static final String SEM_PREVISAO_REATIVACAO =
            "A data de reativação ainda será definida pela equipe de moderação.";

    // ===================== Avisos da moderação =====================

    /** Selo acima do título dos avisos de conta e de conteúdo. */
    private static final String SELO_MODERACAO = "Aviso da moderação";

    /** Selo da mensagem livre escrita pelo administrador. */
    private static final String SELO_PERSONALIZADO = "Mensagem da moderação";

    private static final String ROTULO_MOTIVO = "Motivo informado";
    private static final String ROTULO_PREVISAO = "Previsão de reativação";

    private static final String CONTESTAR =
            "Se você acredita que houve um engano, responda a este e-mail para falar com a moderação.";

    /** Acompanha a mensagem escrita pelo administrador. */
    private static final String NOTA_PERSONALIZADO =
            "Esta mensagem foi enviada pela equipe de moderação do Crow. "
                    + "Se precisar de mais informações, responda a este e-mail.";

    private static final String DESATIVADA_ABERTURA =
            "Informamos que sua conta no Crow foi desativada pela equipe de moderação. "
                    + "Enquanto a desativação estiver em vigor, o acesso à plataforma fica indisponível.";
    private static final String DESATIVADA_CONTEUDO =
            "Seu progresso e os conteúdos que você criou continuam guardados.";

    private static final String SUSPENSA_ABERTURA =
            "Informamos que sua conta no Crow foi suspensa temporariamente pela equipe de moderação. "
                    + "Durante a suspensão, o acesso à plataforma fica indisponível.";
    private static final String SUSPENSA_CONTEUDO =
            "Seu progresso e os conteúdos que você criou continuam guardados e voltam a ficar "
                    + "disponíveis assim que a conta for reativada.";

    private static final String REATIVADA_ABERTURA =
            "Sua conta no Crow foi reativada e você já pode acessar a plataforma normalmente.";
    private static final String REATIVADA_CONTEUDO =
            "Seu progresso, seus idiomas e suas avaliações continuam como antes.";
    private static final String REATIVADA_DESPEDIDA = "Bons estudos!";

    /** %s = nome do idioma removido. */
    private static final String IDIOMA_EXCLUIDO_ABERTURA =
            "Informamos que o idioma \"%s\", criado por você, foi removido do Crow pela equipe de moderação.";
    private static final String IDIOMA_EXCLUIDO_CONTA =
            "Sua conta continua ativa e os demais conteúdos que você criou não foram afetados.";

    // ===================== Códigos de verificação =====================

    /** Vale para o cadastro e para a troca de e-mail no perfil. */
    private static final String VERIFICACAO_SELO = "Verificação de e-mail";
    private static final String VERIFICACAO_TITULO = "Confirme seu e-mail";
    private static final String VERIFICACAO_ABERTURA =
            "Use o código abaixo para confirmar seu endereço de e-mail no Crow.";
    private static final String VERIFICACAO_ROTULO_CODIGO = "Código de verificação";
    private static final String VERIFICACAO_NAO_FOI_VOCE =
            "Se você não solicitou este código, pode ignorar este e-mail com segurança.";

    private static final String REDEFINICAO_SELO = "Segurança da conta";
    private static final String REDEFINICAO_TITULO = "Redefinição de senha";
    private static final String REDEFINICAO_ABERTURA =
            "Recebemos um pedido para redefinir a senha da sua conta no Crow. "
                    + "Use o código abaixo para criar uma nova senha.";
    private static final String REDEFINICAO_ROTULO_CODIGO = "Código de redefinição";
    private static final String REDEFINICAO_ROTULO_ALERTA = "Não foi você?";
    private static final String REDEFINICAO_ALERTA =
            "Ignore este e-mail: sua senha continua a mesma. "
                    + "Nunca compartilhe este código — a equipe do Crow nunca vai pedi-lo.";

    /** %s = prazo (ver {@link #PRAZO_MINUTOS}), que sai em negrito no HTML. */
    private static final String CODIGO_VALIDADE = "O código expira em %s e só pode ser usado uma vez.";

    /** %d = minutos de validade do código. */
    private static final String PRAZO_MINUTOS = "%d minutos";

    /** Prévia na caixa de entrada: %s = código; %s = prazo. */
    private static final String CODIGO_RESUMO = "Seu código é %s. Ele expira em %s.";

    // ===================== Construtores de texto =====================

    /** Prefixa o assunto; se vier vazio, usa {@link #ASSUNTO_PERSONALIZADO_PADRAO}. */
    public static String assunto(String assunto) {
        return PREFIXO_ASSUNTO + assuntoOuPadrao(assunto);
    }

    /** Mensagem livre do administrador; o assunto informado vira o título do cartão. */
    public static CorpoEmail personalizado(String primeiroNome, String assunto, String mensagem) {
        return EmailLayout.mensagem()
                .saudacao(saudacao(primeiroNome))
                .citacao(mensagem.trim())
                .nota(NOTA_PERSONALIZADO)
                .montar(Tom.INFO, SELO_PERSONALIZADO, assuntoOuPadrao(assunto), ASSINATURA);
    }

    public static CorpoEmail contaDesativada(String primeiroNome, String justificativa) {
        return EmailLayout.mensagem()
                .saudacao(saudacao(primeiroNome))
                .paragrafo(DESATIVADA_ABERTURA)
                .destaque(ROTULO_MOTIVO, motivo(justificativa, MOTIVO_PADRAO_CONTA), Tom.PERIGO)
                .paragrafo(DESATIVADA_CONTEUDO)
                .paragrafo(CONTESTAR)
                .montar(Tom.PERIGO, SELO_MODERACAO, ASSUNTO_CONTA_DESATIVADA, ASSINATURA);
    }

    /** Sem data de reativação, a previsão informa que ela ainda será definida. */
    public static CorpoEmail contaSuspensa(String primeiroNome, String justificativa,
                                           LocalDateTime reativacaoPrevista) {
        String previsao = reativacaoPrevista != null
                ? FORMATO_DATA.format(reativacaoPrevista)
                : SEM_PREVISAO_REATIVACAO;
        return EmailLayout.mensagem()
                .saudacao(saudacao(primeiroNome))
                .paragrafo(SUSPENSA_ABERTURA)
                .destaque(ROTULO_MOTIVO, motivo(justificativa, MOTIVO_PADRAO_CONTA), Tom.ALERTA)
                .destaque(ROTULO_PREVISAO, previsao, Tom.INFO)
                .paragrafo(SUSPENSA_CONTEUDO)
                .paragrafo(CONTESTAR)
                .montar(Tom.ALERTA, SELO_MODERACAO, ASSUNTO_CONTA_SUSPENSA, ASSINATURA);
    }

    public static CorpoEmail contaReativada(String primeiroNome) {
        return EmailLayout.mensagem()
                .saudacao(saudacao(primeiroNome))
                .paragrafo(REATIVADA_ABERTURA)
                .paragrafo(REATIVADA_CONTEUDO)
                .paragrafo(REATIVADA_DESPEDIDA)
                .montar(Tom.SUCESSO, SELO_MODERACAO, ASSUNTO_CONTA_REATIVADA, ASSINATURA);
    }

    public static CorpoEmail idiomaExcluido(String primeiroNome, String nomeIdioma, String mensagem) {
        String idioma = preenchido(nomeIdioma) ? nomeIdioma.trim() : IDIOMA_SEM_NOME;
        return EmailLayout.mensagem()
                .saudacao(saudacao(primeiroNome))
                .paragrafo(IDIOMA_EXCLUIDO_ABERTURA.formatted(idioma), idioma)
                .destaque(ROTULO_MOTIVO, motivo(mensagem, MOTIVO_PADRAO_IDIOMA), Tom.ALERTA)
                .paragrafo(IDIOMA_EXCLUIDO_CONTA)
                .paragrafo(CONTESTAR)
                .montar(Tom.ALERTA, SELO_MODERACAO, ASSUNTO_IDIOMA_EXCLUIDO, ASSINATURA);
    }

    /** Código que confirma um endereço de e-mail (cadastro ou troca de e-mail no perfil). */
    public static CorpoEmail codigoVerificacaoEmail(String codigo, int minutosValidade) {
        String prazo = PRAZO_MINUTOS.formatted(minutosValidade);
        return EmailLayout.mensagem()
                .saudacao(SAUDACAO_SEM_NOME)
                .paragrafo(VERIFICACAO_ABERTURA)
                .codigo(VERIFICACAO_ROTULO_CODIGO, codigo)
                .paragrafo(CODIGO_VALIDADE.formatted(prazo), prazo)
                .nota(VERIFICACAO_NAO_FOI_VOCE)
                .resumo(CODIGO_RESUMO.formatted(codigo, prazo))
                .montar(Tom.INFO, VERIFICACAO_SELO, VERIFICACAO_TITULO, ASSINATURA);
    }

    /** Código da tela "Esqueci minha senha". */
    public static CorpoEmail codigoRedefinicaoSenha(String codigo, int minutosValidade) {
        String prazo = PRAZO_MINUTOS.formatted(minutosValidade);
        return EmailLayout.mensagem()
                .saudacao(SAUDACAO_SEM_NOME)
                .paragrafo(REDEFINICAO_ABERTURA)
                .codigo(REDEFINICAO_ROTULO_CODIGO, codigo)
                .paragrafo(CODIGO_VALIDADE.formatted(prazo), prazo)
                .destaque(REDEFINICAO_ROTULO_ALERTA, REDEFINICAO_ALERTA, Tom.ALERTA)
                .resumo(CODIGO_RESUMO.formatted(codigo, prazo))
                .montar(Tom.INFO, REDEFINICAO_SELO, REDEFINICAO_TITULO, ASSINATURA);
    }

    /**
     * Extrai o primeiro nome do cadastro para a saudação. Retorna {@code null}
     * quando não há nome utilizável — nesse caso a saudação sai sem nome.
     */
    public static String primeiroNome(String nomeCompleto) {
        if (!preenchido(nomeCompleto)) {
            return null;
        }
        return nomeCompleto.trim().split("\\s+")[0];
    }

    // ===================== Apoio =====================

    private static String saudacao(String primeiroNome) {
        return preenchido(primeiroNome) ? SAUDACAO.formatted(primeiroNome) : SAUDACAO_SEM_NOME;
    }

    private static String assuntoOuPadrao(String assunto) {
        return preenchido(assunto) ? assunto.trim() : ASSUNTO_PERSONALIZADO_PADRAO;
    }

    private static String motivo(String informado, String padrao) {
        return preenchido(informado) ? informado.trim() : padrao;
    }

    public static boolean preenchido(String texto) {
        return texto != null && !texto.isBlank();
    }
}
