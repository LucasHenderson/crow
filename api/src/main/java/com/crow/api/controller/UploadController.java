package com.crow.api.controller;

import com.crow.api.service.ArmazenamentoService;
import com.crow.api.util.FormatoAudio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final ArmazenamentoService armazenamentoService;

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
        return salvar(file, ext, contentType);
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

        // Mesmo tipo que o disco local usaria ao servir o arquivo pela extensão.
        String tipo = MediaTypeFactory.getMediaType("audio." + formato.getExtensao())
                .orElse(MediaType.APPLICATION_OCTET_STREAM)
                .toString();
        return salvar(file, "." + formato.getExtensao(), tipo);
    }

    private static void exigirArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio");
        }
    }

    /** Grava com nome aleatório (UUID + extensão) e devolve o caminho público. */
    private ResponseEntity<Map<String, String>> salvar(MultipartFile file, String ext, String contentType) {
        try {
            return ResponseEntity.ok(Map.of("path", armazenamentoService.salvar(file, ext, contentType)));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao salvar arquivo", e);
        }
    }
}
