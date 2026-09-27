package com.crow.api.util;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Formatos de áudio aceitos nas frases e as regras que valem para eles.
 *
 * <p>O formato é reconhecido pela <b>assinatura dos primeiros bytes</b> do
 * arquivo, nunca pelo nome ou pelo tipo informado pelo navegador — ambos vêm
 * do cliente. O arquivo é gravado com a extensão do formato detectado, então
 * o que o servidor devolve em {@code /api/uploads} sempre é servido como
 * áudio, mesmo que alguém envie outro conteúdo renomeado.</p>
 *
 * <p>As frases guardam apenas o caminho do arquivo enviado; {@link #referenciaValida}
 * confere que o caminho aponta para um áudio gravado por este servidor.</p>
 */
public enum FormatoAudio {

    MP3("mp3"),
    M4A("m4a"),
    AAC("aac"),
    WAV("wav"),
    OGG("ogg"),
    WEBM("webm");

    /** Tamanho máximo de um áudio. Folga para frases curtas até em WAV. */
    public static final long TAMANHO_MAXIMO_BYTES = 5L * 1024 * 1024;

    /** Quantos bytes do início do arquivo bastam para reconhecer qualquer formato aceito. */
    public static final int BYTES_ASSINATURA = 12;

    /** Formatos aceitos, para mensagens de erro. */
    public static final String DESCRICAO_ACEITOS = "MP3, M4A, AAC, WAV, OGG ou WEBM";

    /**
     * Caminho devolvido pelo upload: {@code /api/uploads/<uuid>.<extensão de áudio>}.
     * Qualquer outro valor (URL externa, {@code blob:}, imagem) é recusado.
     */
    private static final Pattern REFERENCIA = Pattern.compile(
            "^/api/uploads/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(mp3|m4a|aac|wav|ogg|webm)$");

    private final String extensao;

    FormatoAudio(String extensao) {
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
    public static Optional<FormatoAudio> detectar(byte[] inicio) {
        if (inicio == null || inicio.length < 4) {
            return Optional.empty();
        }
        // MP3 com etiqueta ID3v2 no início (o caso mais comum)
        if (comecaCom(inicio, 0, "ID3")) return Optional.of(MP3);
        // WAV: contêiner RIFF do tipo WAVE
        if (comecaCom(inicio, 0, "RIFF") && comecaCom(inicio, 8, "WAVE")) return Optional.of(WAV);
        // OGG (Vorbis ou Opus)
        if (comecaCom(inicio, 0, "OggS")) return Optional.of(OGG);
        // M4A: contêiner MP4, caixa "ftyp" logo após o tamanho
        if (comecaCom(inicio, 4, "ftyp")) return Optional.of(M4A);
        // WEBM: cabeçalho EBML
        if (byteSemSinal(inicio[0]) == 0x1A && byteSemSinal(inicio[1]) == 0x45
                && byteSemSinal(inicio[2]) == 0xDF && byteSemSinal(inicio[3]) == 0xA3) {
            return Optional.of(WEBM);
        }
        // Quadros sem cabeçalho de contêiner: começam pela palavra de sincronismo
        if (byteSemSinal(inicio[0]) == 0xFF) {
            int segundo = byteSemSinal(inicio[1]);
            // AAC em ADTS: sincronismo de 12 bits e camada 00
            if ((segundo & 0xF6) == 0xF0) return Optional.of(AAC);
            // MPEG áudio camada III (MP3 sem etiqueta ID3)
            if ((segundo & 0xE0) == 0xE0 && (segundo & 0x06) == 0x02) return Optional.of(MP3);
        }
        return Optional.empty();
    }

    /** True quando o caminho aponta para um áudio enviado pelo endpoint de upload. */
    public static boolean referenciaValida(String caminho) {
        return caminho != null && REFERENCIA.matcher(caminho).matches();
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
