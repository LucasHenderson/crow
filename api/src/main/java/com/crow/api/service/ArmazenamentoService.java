package com.crow.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.UUID;

/**
 * Guarda os arquivos enviados (imagens e áudios) com nome aleatório e devolve o
 * caminho público {@code /api/uploads/<uuid>.<extensão>} — o mesmo nos dois destinos:
 * <ul>
 *   <li><b>Disco local</b> ({@code app.upload-dir}) — desenvolvimento. Os arquivos
 *       são servidos pelo {@link com.crow.api.config.WebConfig}.</li>
 *   <li><b>Supabase Storage</b> — produção, ativado por {@code app.supabase.url}.
 *       O disco do servidor de produção é apagado a cada deploy, então os arquivos
 *       vão para um bucket público; o Worker do Cloudflare atende
 *       {@code /api/uploads/**} lendo direto do bucket.</li>
 * </ul>
 */
@Slf4j
@Service
public class ArmazenamentoService {

    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    /** Os nomes são UUIDs e nunca são reaproveitados, então o arquivo pode ficar em cache por um ano. */
    private static final String CACHE_CONTROL = "max-age=31536000";

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Value("${app.supabase.url:}")
    private String supabaseUrl;

    /** Chave secreta (ou service_role) do projeto; nunca vai para o frontend. */
    @Value("${app.supabase.chave:}")
    private String supabaseChave;

    @Value("${app.supabase.bucket:uploads}")
    private String supabaseBucket;

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(TIMEOUT).build();

    /**
     * @param extensao    extensão com o ponto (ex.: {@code ".png"}), ou vazia
     * @param contentType tipo gravado junto do arquivo no Supabase, que é o tipo
     *                    com que ele será servido
     */
    public String salvar(MultipartFile file, String extensao, String contentType) throws IOException {
        String nome = UUID.randomUUID() + extensao;
        if (supabaseUrl.isBlank()) {
            salvarNoDisco(file, nome);
        } else {
            salvarNoSupabase(file, nome, contentType);
        }
        return "/api/uploads/" + nome;
    }

    private void salvarNoDisco(MultipartFile file, String nome) throws IOException {
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        file.transferTo(dir.resolve(nome).toFile());
    }

    private void salvarNoSupabase(MultipartFile file, String nome, String contentType) throws IOException {
        HttpRequest.Builder requisicao = HttpRequest.newBuilder(URI.create(
                        supabaseUrl.replaceAll("/+$", "") + "/storage/v1/object/" + supabaseBucket + "/" + nome))
                .timeout(TIMEOUT)
                .header("apikey", supabaseChave)
                .header("Content-Type", contentType)
                .header("Cache-Control", CACHE_CONTROL)
                .header("x-upsert", "false")
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()));
        // As chaves antigas (service_role) são JWTs e também vão no Authorization;
        // as novas (sb_secret_...) só são aceitas no cabeçalho apikey.
        if (supabaseChave.startsWith("eyJ")) {
            requisicao.header("Authorization", "Bearer " + supabaseChave);
        }

        HttpResponse<String> resposta;
        try {
            resposta = http.send(requisicao.build(), HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Envio ao Supabase Storage interrompido", e);
        }
        if (resposta.statusCode() / 100 != 2) {
            log.error("Supabase Storage recusou o arquivo {}: HTTP {} {}", nome, resposta.statusCode(), resposta.body());
            throw new IOException("Supabase Storage respondeu HTTP " + resposta.statusCode());
        }
    }
}
