package com.crow.api.controller;

import com.crow.api.dto.frase.FraseRequest;
import com.crow.api.dto.frase.FraseResponse;
import com.crow.api.entity.Frase;
import com.crow.api.service.FraseService;
import com.crow.api.service.ModuloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/modulos/{moduloId}/frases")
@RequiredArgsConstructor
public class FraseController {

    private final FraseService fraseService;
    private final ModuloService moduloService;

    @GetMapping
    public ResponseEntity<List<FraseResponse>> listar(
            @PathVariable Long moduloId,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        moduloService.validarAcessoLeituraDoModulo(moduloId, userId);
        return ResponseEntity.ok(
                fraseService.buscarPorModulo(moduloId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<FraseResponse> criar(
            @PathVariable Long moduloId,
            Authentication authentication,
            @Valid @RequestBody FraseRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Frase frase = fraseService.criar(moduloId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(frase));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FraseResponse> editar(
            @PathVariable Long moduloId,
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody FraseRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(toResponse(fraseService.editar(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long moduloId,
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        fraseService.excluir(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jogar")
    public ResponseEntity<List<FraseResponse>> jogar(
            @PathVariable Long moduloId,
            Authentication authentication,
            @RequestParam String modulos,
            @RequestParam(defaultValue = "aleatoria") String ordem) {
        Long userId = Long.valueOf(authentication.getName());

        List<Long> moduloIds;
        try {
            moduloIds = Arrays.stream(modulos.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .distinct()
                    .toList();
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lista de módulos inválida");
        }
        if (moduloIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nenhum módulo informado");
        }

        moduloIds.forEach(id -> moduloService.validarAcessoLeituraDoModulo(id, userId));

        return ResponseEntity.ok(
                fraseService.getFrasesParaJogo(moduloIds, ordem).stream()
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
                frase.getTraducoesAlternativasJson(),
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
