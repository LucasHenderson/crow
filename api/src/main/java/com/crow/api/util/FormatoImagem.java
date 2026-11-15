package com.crow.api.util;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;

/**
 * Formatos de imagem aceitos no upload (imagens das frases, dos pares e do quiz).
 *
 * <p>O formato é reconhecido pela <b>assinatura dos primeiros bytes</b> do
 * arquivo, nunca pelo nome ou pelo tipo informado pelo navegador — ambos vêm
 * do cliente. O arquivo é gravado com a extensão do formato detectado, então
 * o que o servidor devolve em {@code /api/uploads} sempre é servido como
 * imagem, mesmo que alguém envie outro conteúdo renomeado (um {@code .html}
 * com extensão {@code .png}, por exemplo).</p>
 *
 * <p>SVG não é aceito: é texto e pode conter {@code <script>}, que rodaria
 * ao abrir o arquivo diretamente no navegador.</p>
 */
public enum FormatoImagem {

    PNG("png"),
    JPEG("jpg"),
    GIF("gif"),
    WEBP("webp");

    /** Quantos bytes do início do arquivo bastam para reconhecer qualquer formato aceito. */
    public static final int BYTES_ASSINATURA = 12;

    /** Formatos aceitos, para mensagens de erro. */
    public static final String DESCRICAO_ACEITOS = "PNG, JPEG, GIF ou WEBP";

    private static final int[] ASSINATURA_PNG = {0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    private final String extensao;

    FormatoImagem(String extensao) {
        this.extensao = extensao;
    }

    public String getExtensao() {
        return extensao;
    }

    /**
     * Reconhece o formato pelos primeiros bytes do arquivo.
     *
     * @param inicio ao menos {@link #BYTES_ASSINATURA} bytes do começo do arquivo
     *               (menos, se o arquivo for menor).
     * @return vazio quando o conteúdo não é de um formato aceito.
     */
    public static Optional<FormatoImagem> detectar(byte[] inicio) {
        if (inicio == null || inicio.length < 3) {
            return Optional.empty();
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (comecaComBytes(inicio, ASSINATURA_PNG)) return Optional.of(PNG);
        // JPEG: marcador SOI (FF D8) seguido do início do próximo marcador (FF)
        if (byteSemSinal(inicio[0]) == 0xFF && byteSemSinal(inicio[1]) == 0xD8
                && byteSemSinal(inicio[2]) == 0xFF) {
            return Optional.of(JPEG);
        }
        // GIF: versões 87a e 89a
        if (comecaCom(inicio, 0, "GIF87a") || comecaCom(inicio, 0, "GIF89a")) return Optional.of(GIF);
        // WEBP: contêiner RIFF do tipo WEBP
        if (comecaCom(inicio, 0, "RIFF") && comecaCom(inicio, 8, "WEBP")) return Optional.of(WEBP);
        return Optional.empty();
    }

    private static boolean comecaComBytes(byte[] dados, int[] esperado) {
        if (dados.length < esperado.length) {
            return false;
        }
        for (int i = 0; i < esperado.length; i++) {
            if (byteSemSinal(dados[i]) != esperado[i]) {
                return false;
            }
        }
        return true;
    }

    private static boolean comecaCom(byte[] dados, int deslocamento, String ascii) {
        byte[] esperado = ascii.getBytes(StandardCharsets.US_ASCII);
        if (dados.length < deslocamento + esperado.length) {
            return false;
        }
        return Arrays.equals(dados, deslocamento, deslocamento + esperado.length,
                esperado, 0, esperado.length);
    }

    private static int byteSemSinal(byte b) {
        return b & 0xFF;
    }
}
