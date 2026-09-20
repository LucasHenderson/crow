package com.crow.api.controller;

import com.crow.api.dto.denuncia.AlterarStatusDenunciaRequest;
import com.crow.api.dto.denuncia.DenunciaResponse;
import com.crow.api.dto.frase.FraseResponse;
import com.crow.api.dto.idioma.IdiomaCompletoResponse;
import com.crow.api.dto.idioma.IdiomaResponse;
import com.crow.api.dto.modulo.ModuloCompletoResponse;
import com.crow.api.dto.modulo.ModuloResponse;
import com.crow.api.dto.usuario.AlterarStatusUsuarioRequest;
import com.crow.api.dto.usuario.UsuarioModeracaoResponse;
import com.crow.api.entity.*;
import com.crow.api.service.*;
import com.crow.api.util.EmailTemplates;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Área administrativa. O papel do administrador é de <b>moderação</b>, não de
 * edição de conteúdo alheio: ele lista e consulta usuários e idiomas (somente
 * leitura), altera status de contas e denúncias, exclui idiomas e consulta
 * logs. Não existe rota administrativa que edite dados cadastrais, senha,
 * papel, idioma, módulo ou frase — os corpos aceitos aqui são DTOs fechados
 * (campos desconhecidos são ignorados na desserialização) e as rotas comuns
 * de escrita recusam administradores que não sejam donos do conteúdo
 * ({@link IdiomaService#validarProprietario}).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DenunciaService denunciaService;
    private final UsuarioService usuarioService;
    private final IdiomaService idiomaService;
    private final ModuloService moduloService;
    private final FraseService fraseService;
    private final LogAdminService logAdminService;
    private final EmailService emailService;

    // === Denúncias ===

    @GetMapping("/denuncias")
    public ResponseEntity<List<DenunciaResponse>> listarDenuncias() {
        return ResponseEntity.ok(
                denunciaService.buscarTodas().stream()
                        .map(this::toDenunciaResponse)
                        .toList()
        );
    }

    @PutMapping("/denuncias/{codigo}/status")
    public ResponseEntity<DenunciaResponse> alterarStatusDenuncia(
            @PathVariable String codigo,
            @Valid @RequestBody AlterarStatusDenunciaRequest request,
            Authentication authentication) {
        Usuario admin = adminAutenticado(authentication);
        Denuncia alvo = denunciaService.resolver(codigo);
        Denuncia denuncia = denunciaService.alterarStatus(alvo.getId(), request.status(), admin);

        logAdminService.registrar(admin, LogAdmin.TipoLog.DENUNCIA,
                "Alterou status da denúncia " + denuncia.getCodigo(),
                "Novo status: " + request.status());

        return ResponseEntity.ok(toDenunciaResponse(denuncia));
    }

    // === Usuários (somente leitura + status) ===

    /** Contas sujeitas à moderação — administradores não aparecem. */
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioModeracaoResponse>> listarUsuarios() {
        return ResponseEntity.ok(
                usuarioService.buscarModeraveis().stream()
                        .map(usuarioService::toModeracaoResponse)
                        .toList()
        );
    }

    /** Consulta de um usuário para moderação — sem senha e sem telefone. */
    @GetMapping("/usuarios/{codigo}")
    public ResponseEntity<UsuarioModeracaoResponse> visualizarUsuario(
            @PathVariable String codigo,
            Authentication authentication) {
        Usuario admin = adminAutenticado(authentication);
        Usuario alvo = usuarioService.resolver(codigo);
        exigirContaModeravel(admin, alvo, "consulta");
        return ResponseEntity.ok(usuarioService.toModeracaoResponse(alvo));
    }

    /**
     * Desativa, suspende ou reativa uma conta — ver {@link AlterarStatusUsuarioRequest}.
     * Cada ação avisa o usuário por e-mail e gera log administrativo; contas
     * administrativas não podem ser alvo. As transições em si ficam em
     * {@link UsuarioService}; aqui só há validação da forma da requisição,
     * aviso e registro.
     */
    @PutMapping("/usuarios/{codigo}/status")
    public ResponseEntity<UsuarioModeracaoResponse> alterarStatusUsuario(
            @PathVariable String codigo,
            @Valid @RequestBody AlterarStatusUsuarioRequest request,
            Authentication authentication) {
        Usuario admin = adminAutenticado(authentication);
        AlterarStatusUsuarioRequest.Acao acao = parseAcao(request.acao());
        if (acao != AlterarStatusUsuarioRequest.Acao.SUSPENDER && request.reativacaoEm() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data de reativação só se aplica à suspensão temporária");
        }

        Usuario alvo = usuarioService.resolver(codigo);
        exigirContaModeravel(admin, alvo, "alteração de status");

        Usuario atualizado = switch (acao) {
            case DESATIVAR -> desativar(admin, alvo, request.justificativa());
            case SUSPENDER -> suspender(admin, alvo, request.justificativa(), request.reativacaoEm());
            case REATIVAR -> reativar(admin, alvo, request.justificativa());
        };

        return ResponseEntity.ok(usuarioService.toModeracaoResponse(atualizado));
    }

    private Usuario desativar(Usuario admin, Usuario alvo, String justificativa) {
        Usuario atualizado = usuarioService.desativar(alvo.getId(), justificativa);
        emailService.enviarAvisoContaDesativada(atualizado, atualizado.getMotivoStatus());
        logAdminService.registrar(admin, LogAdmin.TipoLog.USUARIO,
                "Desativou a conta do usuário " + atualizado.getNome(),
                "Código: " + atualizado.getCodigo() + " — por tempo indeterminado"
                        + detalheJustificativa(atualizado));
        return atualizado;
    }

    private Usuario suspender(Usuario admin, Usuario alvo, String justificativa,
                              LocalDateTime reativacaoEm) {
        Usuario atualizado = usuarioService.suspender(alvo.getId(), justificativa, reativacaoEm);
        emailService.enviarAvisoContaSuspensa(atualizado, atualizado.getMotivoStatus(),
                atualizado.getSuspensoAte());
        logAdminService.registrar(admin, LogAdmin.TipoLog.USUARIO,
                "Suspendeu temporariamente a conta do usuário " + atualizado.getNome(),
                "Código: " + atualizado.getCodigo()
                        + " — reativação prevista: " + EmailTemplates.FORMATO_DATA.format(atualizado.getSuspensoAte())
                        + detalheJustificativa(atualizado));
        return atualizado;
    }

    private Usuario reativar(Usuario admin, Usuario alvo, String justificativa) {
        Usuario atualizado = usuarioService.reativar(alvo.getId(), justificativa);
        emailService.enviarAvisoContaReativada(atualizado);
        logAdminService.registrar(admin, LogAdmin.TipoLog.USUARIO,
                "Reativou a conta do usuário " + atualizado.getNome(),
                "Código: " + atualizado.getCodigo() + " — reativação manual"
                        + detalheJustificativa(atualizado));
        return atualizado;
    }

    /** Trecho do log com a justificativa já normalizada pelo serviço (ou a ausência dela). */
    private static String detalheJustificativa(Usuario usuario) {
        return usuario.getMotivoStatus() != null
                ? " — justificativa: " + usuario.getMotivoStatus()
                : " — sem justificativa";
    }

    // === Idiomas (somente leitura + exclusão) ===

    @GetMapping("/idiomas")
    public ResponseEntity<List<IdiomaResponse>> listarIdiomas() {
        return ResponseEntity.ok(
                idiomaService.buscarTodos().stream()
                        .map(IdiomaResponse::from)
                        .toList()
        );
    }

    /** Idioma completo (módulos e frases) para avaliação do conteúdo — somente leitura. */
    @GetMapping("/idiomas/{codigo}")
    public ResponseEntity<IdiomaCompletoResponse> visualizarIdioma(@PathVariable String codigo) {
        Idioma idioma = idiomaService.resolver(codigo);
        return ResponseEntity.ok(toIdiomaCompletoResponse(idioma));
    }

    @DeleteMapping("/idiomas/{codigo}")
    public ResponseEntity<Void> excluirIdioma(
            @PathVariable String codigo,
            Authentication authentication) {
        Usuario admin = adminAutenticado(authentication);
        Idioma idioma = idiomaService.resolver(codigo);
        String criador = idioma.getCriador() != null ? idioma.getCriador().getCodigo() : "desconhecido";

        idiomaService.excluirComoAdmin(idioma.getId());

        // Registrado depois da exclusão: se ela falhar, não fica log de algo que não aconteceu.
        logAdminService.registrar(admin, LogAdmin.TipoLog.IDIOMA,
                "Excluiu idioma " + idioma.getNome(),
                "Código: " + idioma.getCodigo() + " — criador: " + criador);

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
                                "codigoAdmin", log.getAdmin() != null && log.getAdmin().getCodigo() != null
                                        ? log.getAdmin().getCodigo() : "",
                                "adminNome", log.getAdmin() != null ? log.getAdmin().getNome() : "",
                                "acao", log.getAcao(),
                                "detalhes", log.getDetalhes(),
                                "tipo", log.getTipo().name().toLowerCase()
                        ))
                        .toList()
        );
    }

    // === Blindagem ===

    private Usuario adminAutenticado(Authentication authentication) {
        return usuarioService.buscarPorId(Long.valueOf(authentication.getName()));
    }

    /**
     * Contas administrativas ficam fora da moderação: não aparecem na listagem
     * e nenhuma ação administrativa pode ter uma delas como alvo — inclusive o
     * próprio admin sobre si mesmo. A tentativa é registrada e recusada.
     *
     * @param acao substantivo da operação (ex.: "consulta"), usado no log.
     */
    private void exigirContaModeravel(Usuario admin, Usuario alvo, String acao) {
        if (alvo.getRole() != Usuario.Role.ADMIN) {
            return;
        }
        logAdminService.registrarTentativaBloqueada(admin, LogAdmin.TipoLog.USUARIO,
                acao + " de conta administrativa",
                "Alvo: " + alvo.getNome() + " (" + alvo.getCodigo() + ")");
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Contas administrativas não estão sujeitas à moderação");
    }

    /** Aceita a ação em qualquer caixa ("desativar", "SUSPENDER"); o {@code @NotBlank} do DTO já barrou vazio. */
    private AlterarStatusUsuarioRequest.Acao parseAcao(String acao) {
        try {
            return AlterarStatusUsuarioRequest.Acao.valueOf(acao.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ação inválida: " + acao + " (use desativar, suspender ou reativar)");
        }
    }

    // === Helpers ===

    private IdiomaCompletoResponse toIdiomaCompletoResponse(Idioma idioma) {
        List<ModuloCompletoResponse> modulos = moduloService.buscarPorIdioma(idioma.getId()).stream()
                .map(modulo -> {
                    List<FraseResponse> frases = fraseService.buscarPorModulo(modulo.getId()).stream()
                            .map(FraseResponse::from)
                            .toList();
                    return new ModuloCompletoResponse(ModuloResponse.from(modulo, frases.size()), frases);
                })
                .toList();
        return new IdiomaCompletoResponse(IdiomaResponse.from(idioma), modulos);
    }

    private DenunciaResponse toDenunciaResponse(Denuncia d) {
        return new DenunciaResponse(
                d.getId(),
                d.getCodigo(),
                d.getIdioma() != null ? d.getIdioma().getId() : null,
                d.getIdioma() != null ? d.getIdioma().getCodigo() : null,
                d.getIdioma() != null ? d.getIdioma().getNome() : null,
                d.getUsuario() != null ? d.getUsuario().getId() : null,
                d.getUsuario() != null ? d.getUsuario().getCodigo() : null,
                d.getUsuario() != null ? d.getUsuario().getNome() : null,
                d.getData() != null ? d.getData().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null,
                d.getTiposJson(),
                d.getDescricao(),
                d.getStatus() != null ? d.getStatus().name().toLowerCase() : null,
                d.getResponsavel() != null ? d.getResponsavel().getId() : null,
                d.getResponsavel() != null ? d.getResponsavel().getCodigo() : null,
                d.getResponsavel() != null ? d.getResponsavel().getNome() : null
        );
    }
}
