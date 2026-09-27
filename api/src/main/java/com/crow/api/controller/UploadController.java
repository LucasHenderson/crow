package com.crow.api.controller;

import com.crow.api.util.FormatoAudio;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        exigirArquivo(file);

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas imagens são permitidas");
        }

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.')).toLowerCase();
        }
        return salvar(file, ext);
    }

    /**
     * Áudio das frases (tradução completa, palavras, pares, pergunta e
     * alternativas do quiz). O formato é conferido pelo conteúdo do arquivo
     * ({@link FormatoAudio#detectar}) e a extensão gravada é a do formato
     * detectado — o nome e o tipo enviados pelo navegador são ignorados.
     */
    @PostMapping("/audio")
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        exigirArquivo(file);

        if (file.getSize() > FormatoAudio.TAMANHO_MAXIMO_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O áudio deve ter no máximo 5 MB");
        }

        byte[] inicio;
        try (InputStream in = file.getInputStream()) {
            inicio = in.readNBytes(FormatoAudio.BYTES_ASSINATURA);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler o arquivo", e);
        }

        FormatoAudio formato = FormatoAudio.detectar(inicio)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Formato de áudio não suportado. Envie " + FormatoAudio.DESCRICAO_ACEITOS));

        return salvar(file, "." + formato.getExtensao());
    }

    private static void exigirArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio");
        }
    }

    /** Grava com nome aleatório (UUID + extensão) e devolve o caminho público. */
    private ResponseEntity<Map<String, String>> salvar(MultipartFile file, String ext) {
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String filename = UUID.randomUUID() + ext;
            Path dest = dir.resolve(filename);
            file.transferTo(dest.toFile());

            return ResponseEntity.ok(Map.of("path", "/api/uploads/" + filename));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao salvar arquivo", e);
        }
    }
}
