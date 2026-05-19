package com.crow.api.controller;

import com.crow.api.dto.modulo.ModuloRequest;
import com.crow.api.dto.modulo.ModuloResponse;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import com.crow.api.service.ModuloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/idiomas/{idiomaId}/modulos")
@RequiredArgsConstructor
public class ModuloController {

    private final ModuloService moduloService;
    private final FraseRepository fraseRepository;

    @GetMapping
    public ResponseEntity<List<ModuloResponse>> listar(@PathVariable Long idiomaId) {
        return ResponseEntity.ok(
                moduloService.buscarPorIdioma(idiomaId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<ModuloResponse> criar(
            @PathVariable Long idiomaId,
            Authentication authentication,
            @Valid @RequestBody ModuloRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Modulo modulo = moduloService.criar(idiomaId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(modulo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuloResponse> editar(
            @PathVariable Long idiomaId,
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ModuloRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(toResponse(moduloService.editar(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long idiomaId,
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        moduloService.excluir(id, userId);
        return ResponseEntity.noContent().build();
    }

    private ModuloResponse toResponse(Modulo modulo) {
        return new ModuloResponse(
                modulo.getId(),
                "MOD-" + modulo.getId(),
                modulo.getNome(),
                modulo.getIcone(),
                fraseRepository.countByModuloId(modulo.getId()),
                modulo.getCriadoEm() != null
                        ? modulo.getCriadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null,
                modulo.getAtualizadoEm() != null
                        ? modulo.getAtualizadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null
        );
    }
}
