package com.crow.api.controller;

import com.crow.api.dto.avaliacao.AvaliacaoRequest;
import com.crow.api.dto.avaliacao.AvaliacaoResponse;
import com.crow.api.dto.denuncia.DenunciaRequest;
import com.crow.api.dto.idioma.IdiomaRequest;
import com.crow.api.dto.idioma.IdiomaResponse;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Usuario;
import com.crow.api.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/idiomas")
@RequiredArgsConstructor
public class IdiomaController {

    private final IdiomaService idiomaService;
    private final UsuarioService usuarioService;
    private final AvaliacaoService avaliacaoService;
    private final DenunciaService denunciaService;

    @GetMapping
    public ResponseEntity<List<IdiomaResponse>> listarPublicos(
            Authentication authentication,
            @RequestParam(required = false) String q) {
        Long userId = Long.valueOf(authentication.getName());
        List<Idioma> idiomas = idiomaService.buscar(q, userId);
        return ResponseEntity.ok(idiomas.stream().map(IdiomaResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IdiomaResponse> buscarPorId(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        idiomaService.validarAcessoLeitura(id, userId);
        return ResponseEntity.ok(IdiomaResponse.from(idiomaService.buscarPorId(id)));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<IdiomaResponse>> meusIdiomas(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(
                idiomaService.getIdiomasDoUsuario(userId).stream()
                        .map(IdiomaResponse::from)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<IdiomaResponse> criar(
            Authentication authentication,
            @Valid @RequestBody IdiomaRequest request) {
        Usuario criador = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        Idioma idioma = idiomaService.criar(request, criador);
        return ResponseEntity.status(HttpStatus.CREATED).body(IdiomaResponse.from(idioma));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IdiomaResponse> editar(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody IdiomaRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(IdiomaResponse.from(idiomaService.editar(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        idiomaService.excluir(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/importar")
    public ResponseEntity<IdiomaResponse> importar(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Usuario usuario = usuarioService.buscarPorId(userId);
        Idioma copia = idiomaService.importar(userId, id, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(IdiomaResponse.from(copia));
    }

    @PostMapping("/{id}/avaliar")
    public ResponseEntity<AvaliacaoResponse> avaliar(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody AvaliacaoRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(avaliacaoService.avaliar(userId, id, request.nota()));
    }

    @PostMapping("/{id}/denunciar")
    public ResponseEntity<Void> denunciar(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody DenunciaRequest request) {
        Usuario usuario = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        denunciaService.criar(id, request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
