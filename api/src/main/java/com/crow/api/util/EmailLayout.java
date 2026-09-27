package com.crow.api.util;

import jakarta.mail.MessagingException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.util.HtmlUtils;

/**
 * Moldura visual (HTML) de todos os e-mails do Crow: cabeçalho com a logo,
 * cartão com o conteúdo e rodapé, nas cores do app — o navy da barra superior
 * (o mesmo fundo da logo) e o azul de destaque.
 *
 * <p>Feita para clientes de e-mail, Gmail incluído: só tabelas e estilos
 * inline, sem CSS externo nem SVG (que o Gmail descarta). A logo vai anexada
 * à própria mensagem e o HTML a referencia por {@code cid:}, então ela aparece
 * sem depender de um servidor público de imagens.</p>
 *
 * <p>Cada e-mail sai em duas versões, texto puro e HTML, montadas juntas por
 * {@link Mensagem} para o conteúdo nunca divergir entre elas. As palavras
 * ficam em {@link EmailTemplates}; aqui só há apresentação.</p>
 */
public final class EmailLayout {

    private EmailLayout() {
    }

    /** Tom do selo, da faixa superior e dos destaques — sinaliza a natureza da mensagem. */
    public enum Tom {
        INFO("#1d4ed8", "#eff6ff", "#bfdbfe"),
        SUCESSO("#047857", "#ecfdf5", "#a7f3d0"),
        ALERTA("#b45309", "#fffbeb", "#fde68a"),
        PERIGO("#b91c1c", "#fef2f2", "#fecaca");

        private final String cor;
        private final String fundo;
        private final String borda;

        Tom(String cor, String fundo, String borda) {
            this.cor = cor;
            this.fundo = fundo;
            this.borda = borda;
        }
    }

    /** Content-ID da logo anexada; o HTML a referencia como {@code cid:logo-crow}. */
    private static final String LOGO_CID = "logo-crow";

    /** 180×180 px, fundo na cor do cabeçalho — a mesma imagem do apple-touch-icon do front. */
    private static final Resource LOGO = new ClassPathResource("email/logo-crow.png");

    private static final String FONTE = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    private static final String FONTE_CODIGO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
    private static final String COR_MARCA = "#15263f";
    private static final String COR_TEXTO = "#0f172a";
    private static final String COR_SUAVE = "#64748b";
    private static final String COR_FUNDO = "#eef2f7";
    private static final String COR_BORDA = "#e2e8f0";

    /**
     * Documento completo. Marcadores: 1 título, 2 cor do fundo, 3 resumo
     * (preheader), 4 cor da marca, 5 cid da logo, 6 fonte, 7 cor do tom,
     * 8 cor do texto, 9 fundo do tom, 10 selo, 11 conteúdo, 12 cor da borda,
     * 13 cor suave. {@code %%} é um {@code %} literal.
     */
    private static final String PAGINA = """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <title>%1$s</title>
            </head>
            <body style="margin:0;padding:0;background-color:%2$s;">
            <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">%3$s</div>
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:%2$s;">
            <tr><td align="center" style="padding:32px 12px;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;border-collapse:separate;">
            <tr><td style="background-color:%4$s;border-radius:16px 16px 0 0;padding:20px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="vertical-align:middle;"><img src="cid:%5$s" width="44" height="44" alt="Crow" style="display:block;border:0;outline:none;text-decoration:none;"></td>
            <td style="vertical-align:middle;padding-left:10px;font-family:%6$s;font-size:22px;font-weight:700;letter-spacing:0.5px;color:#ffffff;">Crow</td>
            </tr></table>
            </td></tr>
            <tr><td style="background-color:%7$s;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
            <tr><td style="background-color:#ffffff;padding:32px 28px 28px;font-family:%6$s;color:%8$s;">
            <span style="display:inline-block;padding:4px 12px;border-radius:999px;background-color:%9$s;color:%7$s;font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">%10$s</span>
            <h1 style="margin:16px 0 20px;font-size:22px;line-height:1.3;font-weight:700;color:%8$s;">%1$s</h1>
            %11$s
            </td></tr>
            <tr><td style="background-color:#f8fafc;border-top:1px solid %12$s;border-radius:0 0 16px 16px;padding:18px 28px;font-family:%6$s;font-size:12px;line-height:1.6;color:%13$s;text-align:center;">
            <strong style="color:%4$s;">Crow</strong> · Plataforma gamificada e colaborativa para estudo de idiomas
            </td></tr>
            </table>
            </td></tr>
            </table>
            </body>
            </html>
            """;

    /** Caixa com rótulo: 1 fonte, 2 fundo do tom, 3 cor do tom, 4 rótulo, 5 cor do texto, 6 conteúdo. */
    private static final String DESTAQUE = """
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;border-collapse:separate;">
            <tr><td style="background-color:%2$s;border-left:4px solid %3$s;border-radius:8px;padding:14px 18px;font-family:%1$s;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:%3$s;">%4$s</p>
            <p style="margin:0;font-size:15px;line-height:1.6;color:%5$s;word-break:break-word;">%6$s</p>
            </td></tr>
            </table>
            """;

    /** Texto livre de outra pessoa: 1 fonte, 2 cor da borda, 3 cor do texto, 4 conteúdo. */
    private static final String CITACAO = """
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;border-collapse:separate;">
            <tr><td style="background-color:#f8fafc;border:1px solid %2$s;border-radius:10px;padding:18px 20px;font-family:%1$s;font-size:15px;line-height:1.7;color:%3$s;word-break:break-word;">%4$s</td></tr>
            </table>
            """;

    /**
     * Código em destaque: 1 fonte, 2 fundo, 3 borda, 4 cor do rótulo, 5 rótulo,
     * 6 fonte monoespaçada, 7 cor do código, 8 código. O recuo à esquerda
     * compensa o espaçamento que o letter-spacing deixa depois do último dígito.
     */
    private static final String CODIGO = """
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;border-collapse:separate;">
            <tr><td align="center" style="background-color:%2$s;border:1px solid %3$s;border-radius:12px;padding:22px 16px;font-family:%1$s;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:%4$s;">%5$s</p>
            <p style="margin:0;padding-left:10px;font-family:%6$s;font-size:34px;line-height:1.2;font-weight:700;letter-spacing:10px;color:%7$s;">%8$s</p>
            </td></tr>
            </table>
            """;

    /**
     * Coloca o corpo na mensagem (texto puro e HTML como alternativas) e embute
     * a logo que o HTML referencia. Crie o helper com
     * {@link MimeMessageHelper#MULTIPART_MODE_RELATED}.
     */
    public static void preencher(MimeMessageHelper helper, CorpoEmail corpo) throws MessagingException {
        helper.setText(corpo.texto(), corpo.html());
        // Só depois do setText: antes dele, alguns leitores não resolvem o cid:.
        helper.addInline(LOGO_CID, LOGO, "image/png");
    }

    /** Começa um e-mail novo; os blocos entram na ordem em que são chamados. */
    public static Mensagem mensagem() {
        return new Mensagem();
    }

    /**
     * Monta as duas versões de um e-mail ao mesmo tempo: cada bloco entra no
     * texto puro e no HTML, separado do anterior por uma linha em branco.
     */
    public static final class Mensagem {

        private final StringBuilder texto = new StringBuilder();
        private final StringBuilder html = new StringBuilder();
        /** Prévia mostrada pela caixa de entrada; por padrão, o primeiro parágrafo. */
        private String resumo;

        private Mensagem() {
        }

        /** Linha de abertura (ex.: "Olá, Ana!"). */
        public Mensagem saudacao(String saudacao) {
            adicionarTexto(saudacao);
            html.append(paragrafoHtml(escapar(saudacao), "font-size:16px;font-weight:600;"));
            return this;
        }

        public Mensagem paragrafo(String paragrafo) {
            return paragrafo(paragrafo, null);
        }

        /** Parágrafo com um trecho em negrito no HTML (ex.: o nome de um idioma). */
        public Mensagem paragrafo(String paragrafo, String trechoEmNegrito) {
            adicionarTexto(paragrafo);
            if (resumo == null) {
                resumo = paragrafo;
            }
            String seguro = comQuebras(paragrafo);
            if (trechoEmNegrito != null && !trechoEmNegrito.isBlank()) {
                String alvo = escapar(trechoEmNegrito);
                int inicio = seguro.indexOf(alvo);
                if (inicio >= 0) {
                    seguro = seguro.substring(0, inicio) + "<strong>" + alvo + "</strong>"
                            + seguro.substring(inicio + alvo.length());
                }
            }
            html.append(paragrafoHtml(seguro, ""));
            return this;
        }

        /** Parágrafo discreto, para observações. */
        public Mensagem nota(String nota) {
            adicionarTexto(nota);
            html.append(paragrafoHtml(comQuebras(nota), "font-size:13px;line-height:1.6;color:" + COR_SUAVE + ";"));
            return this;
        }

        /** Caixa colorida com rótulo (motivo, previsão, alerta de segurança). */
        public Mensagem destaque(String rotulo, String conteudo, Tom tom) {
            adicionarTexto(rotuloTexto(rotulo) + "\n" + conteudo);
            html.append(DESTAQUE.formatted(FONTE, tom.fundo, tom.cor, escapar(rotulo), COR_TEXTO, comQuebras(conteudo)));
            return this;
        }

        /** Texto livre escrito por alguém (ex.: a mensagem do administrador), em bloco próprio. */
        public Mensagem citacao(String conteudo) {
            adicionarTexto(conteudo);
            if (resumo == null) {
                resumo = conteudo;
            }
            html.append(CITACAO.formatted(FONTE, COR_BORDA, COR_TEXTO, comQuebras(conteudo)));
            return this;
        }

        /** Código de verificação em destaque, grande e fácil de copiar. */
        public Mensagem codigo(String rotulo, String codigo) {
            adicionarTexto(rotuloTexto(rotulo) + "\n" + codigo);
            Tom tom = Tom.INFO;
            html.append(CODIGO.formatted(FONTE, tom.fundo, tom.borda, tom.cor, escapar(rotulo),
                    FONTE_CODIGO, COR_MARCA, escapar(codigo)));
            return this;
        }

        /** Substitui a prévia da caixa de entrada (padrão: o primeiro parágrafo). */
        public Mensagem resumo(String resumo) {
            this.resumo = resumo;
            return this;
        }

        /**
         * Fecha o e-mail com a assinatura e aplica a moldura.
         *
         * @param tom        cor do selo e da faixa sob o cabeçalho
         * @param selo       rótulo curto acima do título (ex.: "Aviso da moderação")
         * @param titulo     título do cartão (e do documento HTML)
         * @param assinatura despedida; a última linha sai em negrito no HTML
         */
        public CorpoEmail montar(Tom tom, String selo, String titulo, String assinatura) {
            adicionarTexto(assinatura);
            int quebra = assinatura.lastIndexOf('\n');
            String assinaturaHtml = quebra < 0
                    ? escapar(assinatura)
                    : comQuebras(assinatura.substring(0, quebra)) + "<br><strong>"
                            + escapar(assinatura.substring(quebra + 1)) + "</strong>";
            html.append(paragrafoHtml(assinaturaHtml, "margin-top:8px;margin-bottom:0;"));

            String pagina = PAGINA.formatted(escapar(titulo), COR_FUNDO, escapar(resumo == null ? "" : resumo),
                    COR_MARCA, LOGO_CID, FONTE, tom.cor, COR_TEXTO, tom.fundo, escapar(selo), html,
                    COR_BORDA, COR_SUAVE);
            return new CorpoEmail(texto.toString(), pagina);
        }

        private void adicionarTexto(String bloco) {
            if (!texto.isEmpty()) {
                texto.append("\n\n");
            }
            texto.append(bloco);
        }
    }

    // ===================== Apoio =====================

    /** {@code conteudoSeguro} já precisa estar escapado. */
    private static String paragrafoHtml(String conteudoSeguro, String estiloExtra) {
        return "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.65;color:" + COR_TEXTO + ";"
                + estiloExtra + "\">" + conteudoSeguro + "</p>\n";
    }

    /** Rótulo no texto puro: ganha dois-pontos, a menos que já termine em pontuação ("Não foi você?"). */
    private static String rotuloTexto(String rotulo) {
        return rotulo.matches(".*[?!:.]$") ? rotulo : rotulo + ":";
    }

    /** Escapa só o necessário (&lt; &gt; &amp; aspas); acentos seguem em UTF-8. */
    private static String escapar(String texto) {
        return HtmlUtils.htmlEscape(texto, "UTF-8");
    }

    /** Escapa e preserva as quebras de linha digitadas (ex.: na mensagem do administrador). */
    private static String comQuebras(String texto) {
        return escapar(texto.replace("\r\n", "\n")).replace("\n", "<br>");
    }
}
