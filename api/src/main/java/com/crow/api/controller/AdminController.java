package com.crow.api.controller;

import com.crow.api.dto.denuncia.AlterarStatusDenunciaRequest;
import com.crow.api.dto.denuncia.DenunciaResponse;
import com.crow.api.dto.idioma.IdiomaResponse;
import com.crow.api.dto.usuario.UsuarioResponse;
import com.crow.api.dto.usuario.UsuarioUpdateRequest;
import com.crow.api.entity.*;
import com.crow.api.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DenunciaService denunciaService;
    private final UsuarioService usuarioService;
    private final IdiomaService idiomaService;
    private final LogAdminService logAdminService;
    private final AuthService authService;

    // === Denúncias ===

    @GetMapping("/denuncias")
    public ResponseEntity<List<DenunciaResponse>> listarDenuncias() {
        return ResponseEntity.ok(
                denunciaService.buscarTodas().stream()
                        .map(this::toDenunciaResponse)
                        .toList()
        );
    }

    @PutMapping("/denuncias/{id}/status")
    public ResponseEntity<DenunciaResponse> alterarStatusDenuncia(
            @PathVariable Long id,
            @Valid @RequestBody AlterarStatusDenunciaRequest request,
            Authentication authentication) {
        Usuario admin = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        Denuncia denuncia = denunciaService.alterarStatus(id, request.status(), admin);

        logAdminService.registrar(admin, LogAdmin.TipoLog.DENUNCIA,
                "Alterou status da denúncia #" + id,
                "Novo status: " + request.status());

        return ResponseEntity.ok(toDenunciaResponse(denuncia));
    }

    // === Usuários ===

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        return ResponseEntity.ok(
                usuarioService.buscarTodos().stream()
                        .map(authService::toUsuarioResponse)
                        .toList()
        );
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioResponse> editarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioUpdateRequest request,
            Authentication authentication) {
        Usuario admin = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        Usuario atualizado = usuarioService.editarUsuarioAdmin(id, request);

        logAdminService.registrar(admin, LogAdmin.TipoLog.USUARIO,
                "Editou usuário " + atualizado.getNome(),
                "ID: " + id);

        return ResponseEntity.ok(authService.toUsuarioResponse(atualizado));
    }

    @PutMapping("/usuarios/{id}/status")
    public ResponseEntity<UsuarioResponse> alterarStatusUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Usuario admin = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        String novoStatus = body.get("status");
        Usuario atualizado = usuarioService.alterarStatus(id, Usuario.Status.valueOf(novoStatus.toUpperCase()));

        logAdminService.registrar(admin, LogAdmin.TipoLog.USUARIO,
                "Alterou status do usuário " + atualizado.getNome(),
                "Novo status: " + novoStatus);

        return ResponseEntity.ok(authService.toUsuarioResponse(atualizado));
    }

    // === Idiomas ===

    @GetMapping("/idiomas")
    public ResponseEntity<List<IdiomaResponse>> listarIdiomas() {
        return ResponseEntity.ok(
                idiomaService.buscarTodos().stream()
                        .map(this::toIdiomaResponse)
                        .toList()
        );
    }

    @DeleteMapping("/idiomas/{id}")
    public ResponseEntity<Void> excluirIdioma(
            @PathVariable Long id,
            Authentication authentication) {
        Usuario admin = usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
        Idioma idioma = idiomaService.buscarPorId(id);

        logAdminService.registrar(admin, LogAdmin.TipoLog.IDIOMA,
                "Excluiu idioma " + idioma.getNome(),
                "ID: " + id);

        idiomaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    // === Logs ===

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> listarLogs() {
        return ResponseEntity.ok(
                logAdminService.listarTodos().stream()
                        .map(log -> Map.<String, Object>of(
                                "id", log.getId(),
                                "codigo", "LOG-" + log.getId(),
                                "data", log.getData() != null ? log.getData().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "",
                                "adminId", log.getAdmin() != null ? log.getAdmin().getId() : "",
                                "codigoAdmin", log.getAdmin() != null ? "USR-" + log.getAdmin().getId() : "",
                                "adminNome", log.getAdmin() != null ? log.getAdmin().getNome() : "",
                                "acao", log.getAcao(),
                                "detalhes", log.getDetalhes(),
                                "tipo", log.getTipo().name().toLowerCase()
                        ))
                        .toList()
        );
    }

    // === Helpers ===

    private DenunciaResponse toDenunciaResponse(Denuncia d) {
        return new DenunciaResponse(
                d.getId(),
                "DEN-" + d.getId(),
                d.getIdioma() != null ? d.getIdioma().getId() : null,
                d.getIdioma() != null ? "IDM-" + d.getIdioma().getId() : null,
                d.getIdioma() != null ? d.getIdioma().getNome() : null,
                d.getUsuario() != null ? d.getUsuario().getId() : null,
                d.getUsuario() != null ? "USR-" + d.getUsuario().getId() : null,
                d.getUsuario() != null ? d.getUsuario().getNome() : null,
                d.getData() != null ? d.getData().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null,
                d.getTiposJson(),
                d.getDescricao(),
                d.getStatus() != null ? d.getStatus().name().toLowerCase() : null,
                d.getResponsavel() != null ? d.getResponsavel().getId() : null,
                d.getResponsavel() != null ? "USR-" + d.getResponsavel().getId() : null,
                d.getResponsavel() != null ? d.getResponsavel().getNome() : null
        );
    }

    private IdiomaResponse toIdiomaResponse(Idioma idioma) {
        return new IdiomaResponse(
                idioma.getId(),
                "IDM-" + idioma.getId(),
                idioma.getNome(),
                idioma.getIdioma(),
                idioma.getBandeira(),
                idioma.getDescricao(),
                idioma.getCriador() != null ? idioma.getCriador().getId() : null,
                idioma.getCriador() != null ? "USR-" + idioma.getCriador().getId() : null,
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
