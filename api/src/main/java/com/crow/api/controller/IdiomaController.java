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

    @GetMapping("/{codigo}")
    public ResponseEntity<IdiomaResponse> buscarPorCodigo(
            @PathVariable String codigo,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);
        idiomaService.validarAcessoLeitura(idioma.getId(), userId);
        return ResponseEntity.ok(IdiomaResponse.from(idioma));
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
        idiomaService.exigirUsuarioComum(criador, "criar idioma", null);
        Idioma idioma = idiomaService.criar(request, criador);
        return ResponseEntity.status(HttpStatus.CREATED).body(IdiomaResponse.from(idioma));
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<IdiomaResponse> editar(
            @PathVariable String codigo,
            Authentication authentication,
            @Valid @RequestBody IdiomaRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(IdiomaResponse.from(idiomaService.editar(idioma.getId(), request, userId)));
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> excluir(
            @PathVariable String codigo,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);
        idiomaService.excluir(idioma.getId(), userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{codigo}/importar")
    public ResponseEntity<IdiomaResponse> importar(
            @PathVariable String codigo,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Usuario usuario = usuarioService.buscarPorId(userId);
        Idioma original = idiomaService.buscarPorCodigo(codigo);
        idiomaService.exigirUsuarioComum(usuario, "importar idioma", original);
        Idioma copia = idiomaService.importar(userId, original.getId(), usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(IdiomaResponse.from(copia));
    }

    @PostMapping("/{codigo}/avaliar")
    public ResponseEntity<AvaliacaoResponse> avaliar(
            @PathVariable String codigo,
            Authentication authentication,
            @Valid @RequestBody AvaliacaoRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);
        idiomaService.exigirUsuarioComum(usuarioService.buscarPorId(userId), "avaliar idioma", idioma);
        return ResponseEntity.ok(avaliacaoService.avaliar(userId, idioma.getId(), request.nota()));
    }

    @PostMapping("/{codigo}/denunciar")
    public ResponseEntity<Void> denunciar(
            @PathVariable String codigo,
            Authentication authentication,
            @Valid @RequestBody DenunciaRequest request) {
        Usuario usuario = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);
        idiomaService.exigirUsuarioComum(usuario, "denunciar idioma", idioma);
        denunciaService.criar(idioma.getId(), request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
