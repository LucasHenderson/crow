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

import java.time.format.DateTimeFormatter;
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
    public ResponseEntity<List<IdiomaResponse>> listarPublicos(@RequestParam(required = false) String q) {
        List<Idioma> idiomas = (q != null && !q.isBlank())
                ? idiomaService.buscar(q)
                : idiomaService.buscarPublicos();
        return ResponseEntity.ok(idiomas.stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IdiomaResponse> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(toResponse(idiomaService.buscarPorId(id)));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<IdiomaResponse>> meusIdiomas(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(
                idiomaService.getIdiomasDoUsuario(userId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<IdiomaResponse> criar(
            Authentication authentication,
            @Valid @RequestBody IdiomaRequest request) {
        Usuario criador = usuarioService.buscarPorId(authentication.getName());
        Idioma idioma = idiomaService.criar(request, criador);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(idioma));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IdiomaResponse> editar(
            @PathVariable String id,
            @Valid @RequestBody IdiomaRequest request) {
        return ResponseEntity.ok(toResponse(idiomaService.editar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        idiomaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/importar")
    public ResponseEntity<Void> importar(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Usuario usuario = usuarioService.buscarPorId(userId);
        idiomaService.importar(userId, id, usuario);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/avaliar")
    public ResponseEntity<AvaliacaoResponse> avaliar(
            @PathVariable String id,
            Authentication authentication,
            @Valid @RequestBody AvaliacaoRequest request) {
        String userId = authentication.getName();
        return ResponseEntity.ok(avaliacaoService.avaliar(userId, id, request.nota()));
    }

    @PostMapping("/{id}/denunciar")
    public ResponseEntity<Void> denunciar(
            @PathVariable String id,
            Authentication authentication,
            @Valid @RequestBody DenunciaRequest request) {
        Usuario usuario = usuarioService.buscarPorId(authentication.getName());
        denunciaService.criar(request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private IdiomaResponse toResponse(Idioma idioma) {
        return new IdiomaResponse(
                idioma.getId(),
                idioma.getNome(),
                idioma.getIdioma(),
                idioma.getBandeira(),
                idioma.getDescricao(),
                idioma.getCriador() != null ? idioma.getCriador().getId() : null,
                idioma.getCriador() != null ? idioma.getCriador().getNome() : null,
                idioma.getModulos(),
                idioma.getAvaliacao(),
                idioma.getTotalAvaliacoes(),
                idioma.getProficiencia() != null ? idioma.getProficiencia().name().toLowerCase() : null,
                idioma.getVisibilidade() != null ? idioma.getVisibilidade().name().toLowerCase() : null,
                idioma.getCriadoEm() != null
                        ? idioma.getCriadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null
        );
    }
}
