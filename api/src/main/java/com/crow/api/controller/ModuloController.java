package com.crow.api.controller;

import com.crow.api.dto.modulo.ModuloRequest;
import com.crow.api.dto.modulo.ModuloResponse;
import com.crow.api.dto.modulo.ReordenarModulosRequest;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import com.crow.api.service.IdiomaService;
import com.crow.api.service.ModuloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Módulos de um idioma. O idioma é sempre identificado pelo código público
 * ({@code IDM-...}) — o id numérico é resolvido aqui e nunca sai da API.
 * O id do módulo em si segue numérico nesta fase.
 */
@RestController
@RequestMapping("/api/idiomas/{codigoIdioma}/modulos")
@RequiredArgsConstructor
public class ModuloController {

    private final ModuloService moduloService;
    private final IdiomaService idiomaService;
    private final FraseRepository fraseRepository;

    @GetMapping
    public ResponseEntity<List<ModuloResponse>> listar(
            @PathVariable String codigoIdioma,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Long idiomaId = idiomaService.buscarPorCodigo(codigoIdioma).getId();
        idiomaService.validarAcessoLeitura(idiomaId, userId);
        return ResponseEntity.ok(
                moduloService.buscarPorIdioma(idiomaId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<ModuloResponse> criar(
            @PathVariable String codigoIdioma,
            Authentication authentication,
            @Valid @RequestBody ModuloRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Long idiomaId = idiomaService.buscarPorCodigo(codigoIdioma).getId();
        Modulo modulo = moduloService.criar(idiomaId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(modulo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuloResponse> editar(
            @PathVariable String codigoIdioma,
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ModuloRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(toResponse(moduloService.editar(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable String codigoIdioma,
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        moduloService.excluir(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Persiste a nova ordem dos módulos do idioma. Recebe a lista completa de
     * ids na ordem desejada e devolve os módulos já reordenados.
     */
    @PutMapping("/ordem")
    public ResponseEntity<List<ModuloResponse>> reordenar(
            @PathVariable String codigoIdioma,
            Authentication authentication,
            @Valid @RequestBody ReordenarModulosRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Long idiomaId = idiomaService.buscarPorCodigo(codigoIdioma).getId();
        return ResponseEntity.ok(
                moduloService.reordenar(idiomaId, request.ids(), userId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    private ModuloResponse toResponse(Modulo modulo) {
        return ModuloResponse.from(modulo, fraseRepository.countByModuloId(modulo.getId()));
    }
}
