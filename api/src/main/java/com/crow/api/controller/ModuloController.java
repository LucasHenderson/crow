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
    public ResponseEntity<List<ModuloResponse>> listar(@PathVariable String idiomaId) {
        return ResponseEntity.ok(
                moduloService.buscarPorIdioma(idiomaId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<ModuloResponse> criar(
            @PathVariable String idiomaId,
            @Valid @RequestBody ModuloRequest request) {
        Modulo modulo = moduloService.criar(idiomaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(modulo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuloResponse> editar(
            @PathVariable String idiomaId,
            @PathVariable Long id,
            @Valid @RequestBody ModuloRequest request) {
        return ResponseEntity.ok(toResponse(moduloService.editar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable String idiomaId,
            @PathVariable Long id) {
        moduloService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    private ModuloResponse toResponse(Modulo modulo) {
        return new ModuloResponse(
                modulo.getId(),
                modulo.getNome(),
                modulo.getIcone(),
                fraseRepository.countByModuloId(modulo.getId()),
                modulo.getCriadoEm() != null
                        ? modulo.getCriadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null
        );
    }
}
