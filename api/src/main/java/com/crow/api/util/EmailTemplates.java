package com.crow.api.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Textos de todos os e-mails enviados pelo {@link com.crow.api.service.EmailService}.
 *
 * <p>Tudo que o usuário lê está reunido aqui — assuntos, corpos, saudação,
 * assinatura e as mensagens usadas quando a moderação não informa um motivo.
 * Para ajustar a redação basta alterar as constantes desta classe; o serviço
 * cuida apenas do envio, da validação e do registro em log.</p>
 *
 * <p>Os corpos usam {@code %s} como marcador, na ordem documentada em cada
 * construtor de texto. O serviço nunca monta texto por conta própria.</p>
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

    // ===================== Corpos =====================

    /** %s = mensagem escrita pelo administrador. */
    private static final String CORPO_PERSONALIZADO = """
            %s

            Esta mensagem foi enviada pela equipe de moderação do Crow. \
            Se precisar de mais informações, responda a este e-mail.""";

    /** %s = motivo da desativação. */
    private static final String CORPO_CONTA_DESATIVADA = """
            Informamos que sua conta no Crow foi desativada pela equipe de moderação. \
            Enquanto a desativação estiver em vigor, o acesso à plataforma fica indisponível.

            Motivo informado:
            %s

            Seu progresso e os conteúdos que você criou continuam guardados.

            Se você acredita que houve um engano, responda a este e-mail para falar com a moderação.""";

    /** %s = motivo da suspensão; %s = frase sobre a previsão de reativação. */
    private static final String CORPO_CONTA_SUSPENSA = """
            Informamos que sua conta no Crow foi suspensa temporariamente pela equipe de moderação. \
            Durante a suspensão, o acesso à plataforma fica indisponível.

            Motivo informado:
            %s

            %s

            Seu progresso e os conteúdos que você criou continuam guardados e voltam a ficar \
            disponíveis assim que a conta for reativada.

            Se você acredita que houve um engano, responda a este e-mail para falar com a moderação.""";

    /** Frase da previsão de reativação quando há data definida (%s = data já formatada). */
    private static final String PREVISAO_REATIVACAO = "Previsão de reativação: %s.";

    private static final String CORPO_CONTA_REATIVADA = """
            Sua conta no Crow foi reativada e você já pode acessar a plataforma normalmente.

            Seu progresso, seus idiomas e suas avaliações continuam como antes.

            Bons estudos!""";

    /** %s = nome do idioma removido; %s = motivo da remoção. */
    private static final String CORPO_IDIOMA_EXCLUIDO = """
            Informamos que o idioma "%s", criado por você, foi removido do Crow \
            pela equipe de moderação.

            Motivo informado:
            %s

            Sua conta continua ativa e os demais conteúdos que você criou não foram afetados.

            Se você acredita que houve um engano, responda a este e-mail para falar com a moderação.""";

    // ===================== Construtores de texto =====================

    /** Prefixa o assunto; se vier vazio, usa {@link #ASSUNTO_PERSONALIZADO_PADRAO}. */
    public static String assunto(String assunto) {
        return PREFIXO_ASSUNTO + (preenchido(assunto) ? assunto.trim() : ASSUNTO_PERSONALIZADO_PADRAO);
    }

    public static String personalizado(String primeiroNome, String mensagem) {
        return montar(primeiroNome, CORPO_PERSONALIZADO.formatted(mensagem.trim()));
    }

    public static String contaDesativada(String primeiroNome, String justificativa) {
        return montar(primeiroNome,
                CORPO_CONTA_DESATIVADA.formatted(motivo(justificativa, MOTIVO_PADRAO_CONTA)));
    }

    public static String contaSuspensa(String primeiroNome, String justificativa,
                                       LocalDateTime reativacaoPrevista) {
        String previsao = reativacaoPrevista != null
                ? PREVISAO_REATIVACAO.formatted(FORMATO_DATA.format(reativacaoPrevista))
                : SEM_PREVISAO_REATIVACAO;
        return montar(primeiroNome,
                CORPO_CONTA_SUSPENSA.formatted(motivo(justificativa, MOTIVO_PADRAO_CONTA), previsao));
    }

    public static String contaReativada(String primeiroNome) {
        return montar(primeiroNome, CORPO_CONTA_REATIVADA);
    }

    public static String idiomaExcluido(String primeiroNome, String nomeIdioma, String mensagem) {
        String idioma = preenchido(nomeIdioma) ? nomeIdioma.trim() : IDIOMA_SEM_NOME;
        return montar(primeiroNome,
                CORPO_IDIOMA_EXCLUIDO.formatted(idioma, motivo(mensagem, MOTIVO_PADRAO_IDIOMA)));
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

    /** Junta saudação, corpo e assinatura no formato único de todos os e-mails. */
    private static String montar(String primeiroNome, String corpo) {
        String saudacao = preenchido(primeiroNome)
                ? SAUDACAO.formatted(primeiroNome)
                : SAUDACAO_SEM_NOME;
        return saudacao + "\n\n" + corpo + "\n\n" + ASSINATURA;
    }

    private static String motivo(String informado, String padrao) {
        return preenchido(informado) ? informado.trim() : padrao;
    }

    public static boolean preenchido(String texto) {
        return texto != null && !texto.isBlank();
    }
}
