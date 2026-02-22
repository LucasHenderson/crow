package com.crow.api.controller;

import com.crow.api.dto.frase.FraseRequest;
import com.crow.api.dto.frase.FraseResponse;
import com.crow.api.entity.Frase;
import com.crow.api.service.FraseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/modulos/{moduloId}/frases")
@RequiredArgsConstructor
public class FraseController {

    private final FraseService fraseService;

    @GetMapping
    public ResponseEntity<List<FraseResponse>> listar(@PathVariable Long moduloId) {
        return ResponseEntity.ok(
                fraseService.buscarPorModulo(moduloId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<FraseResponse> criar(
            @PathVariable Long moduloId,
            @Valid @RequestBody FraseRequest request) {
        Frase frase = fraseService.criar(moduloId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(frase));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FraseResponse> editar(
            @PathVariable Long moduloId,
            @PathVariable Long id,
            @Valid @RequestBody FraseRequest request) {
        return ResponseEntity.ok(toResponse(fraseService.editar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long moduloId,
            @PathVariable Long id) {
        fraseService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jogar")
    public ResponseEntity<List<FraseResponse>> jogar(
            @PathVariable Long moduloId,
            @RequestParam String modulos) {
        List<Long> moduloIds = Arrays.stream(modulos.split(","))
                .map(String::trim)
                .map(Long::parseLong)
                .toList();
        return ResponseEntity.ok(
                fraseService.getFrasesParaJogo(moduloIds).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    private FraseResponse toResponse(Frase frase) {
        return new FraseResponse(
                frase.getId(),
                "FRS-" + frase.getId(),
                frase.getModo() != null ? frase.getModo().name().toLowerCase() : null,
                frase.getTraducaoCompleta(),
                frase.getPalavrasJson(),
                frase.getImagem(),
                frase.getObservacoes(),
                frase.getLinksJson(),
                frase.getParesJson(),
                frase.getPergunta(),
                frase.getAlternativasJson(),
                frase.getRespostaCorreta(),
                frase.getImagemQuiz(),
                frase.getVideoQuiz()
        );
    }
}
