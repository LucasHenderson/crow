package com.crow.api.controller;

import com.crow.api.dto.denuncia.AlterarStatusDenunciaRequest;
import com.crow.api.dto.denuncia.DenunciaResponse;
import com.crow.api.dto.frase.FraseResponse;
import com.crow.api.dto.idioma.ExcluirIdiomaRequest;
import com.crow.api.dto.idioma.IdiomaCompletoResponse;
import com.crow.api.dto.idioma.IdiomaResponse;
import com.crow.api.dto.log.LogAdminResponse;
import com.crow.api.dto.modulo.ModuloCompletoResponse;
import com.crow.api.dto.modulo.ModuloResponse;
import com.crow.api.dto.usuario.AlterarStatusUsuarioRequest;
import com.crow.api.dto.usuario.EnviarEmailUsuarioRequest;
import com.crow.api.dto.usuario.UsuarioModeracaoResponse;
import com.crow.api.entity.*;
import com.crow.api.service.*;
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

/**
 * Área administrativa. O papel do administrador é de <b>moderação</b>, não de
 * edição de conteúdo alheio: ele lista e consulta usuários e idiomas (somente
 * leitura), altera status de contas e denúncias, envia e-mails a usuários,
 * exclui idiomas (avisando o proprietário) e consulta logs. Não existe rota administrativa que edite
 * dados cadastrais, senha, papel, idioma, módulo ou frase — os corpos aceitos
 * aqui são DTOs fechados (campos desconhecidos são ignorados na
 * desserialização), as rotas comuns de escrita recusam administradores que
 * não sejam donos do conteúdo ({@link IdiomaService#validarProprietario}) e
 * as de criação, importação, avaliação e denúncia recusam qualquer
 * administrador ({@link IdiomaService#exigirUsuarioComum}).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private static final String MOTIVO_CONTA_ADMINISTRATIVA =
            "Contas administrativas não estão sujeitas à moderação";

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
        Denuncia alvo = denunciaService.buscarPorCodigo(codigo);
        Denuncia.StatusDenuncia statusAnterior = alvo.getStatus();
        Denuncia denuncia = denunciaService.alterarStatus(alvo.getId(), request.status(), admin);

        logAdminService.registrar(LogAdminService
                .registro(admin, LogAdmin.TipoLog.DENUNCIA, "Alterou status de denúncia")
                .idiomaAfetado(denuncia.getIdioma())
                .detalhe("denúncia", denuncia.getCodigo())
                .detalhe("status anterior", nomeStatus(statusAnterior))
                .detalhe("novo status", nomeStatus(denuncia.getStatus())));

        return ResponseEntity.ok(toDenunciaResponse(denuncia));
    }

    // === Usuários (somente leitura + status + e-mail) ===

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
        Usuario alvo = usuarioService.buscarPorCodigo(codigo);
        exigirContaModeravel(admin, alvo, LogAdmin.TipoLog.USUARIO, "consultar conta administrativa");
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

        Usuario alvo = usuarioService.buscarPorCodigo(codigo);
        exigirContaModeravel(admin, alvo, LogAdmin.TipoLog.MODERACAO, "alterar status de conta administrativa");

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
        logAdminService.registrar(registroModeracao(admin, atualizado, "Desativou conta de usuário")
                .detalhe("modalidade", "por tempo indeterminado")
                .detalhe("justificativa", justificativaParaLog(atualizado)));
        return atualizado;
    }

    private Usuario suspender(Usuario admin, Usuario alvo, String justificativa,
                              LocalDateTime reativacaoEm) {
        Usuario atualizado = usuarioService.suspender(alvo.getId(), justificativa, reativacaoEm);
        emailService.enviarAvisoContaSuspensa(atualizado, atualizado.getMotivoStatus(),
                atualizado.getSuspensoAte());
        logAdminService.registrar(registroModeracao(admin, atualizado, "Suspendeu conta de usuário")
                .detalhe("modalidade", "temporária")
                .detalhe("reativação prevista", atualizado.getSuspensoAte())
                .detalhe("justificativa", justificativaParaLog(atualizado)));
        return atualizado;
    }

    private Usuario reativar(Usuario admin, Usuario alvo, String justificativa) {
        Usuario atualizado = usuarioService.reativar(alvo.getId(), justificativa);
        emailService.enviarAvisoContaReativada(atualizado);
        logAdminService.registrar(registroModeracao(admin, atualizado, "Reativou conta de usuário")
                .detalhe("modalidade", "manual")
                .detalhe("justificativa", justificativaParaLog(atualizado)));
        return atualizado;
    }

    /** Base comum dos logs de status de conta: tipo MODERACAO com o usuário afetado preenchido. */
    private static LogAdminService.Registro registroModeracao(Usuario admin, Usuario alvo, String acao) {
        return LogAdminService.registro(admin, LogAdmin.TipoLog.MODERACAO, acao).usuarioAfetado(alvo);
    }

    /** Justificativa já normalizada pelo serviço; a ausência também fica registrada. */
    private static String justificativaParaLog(Usuario usuario) {
        return usuario.getMotivoStatus() != null ? usuario.getMotivoStatus() : "não informada";
    }

    /**
     * Mensagem livre do administrador, entregue no e-mail cadastrado do
     * usuário. Contas administrativas não podem ser destinatárias.
     *
     * <p>Responde 202 assim que o pedido é aceito: o envio corre no pool de
     * {@link EmailService} e uma falha de SMTP depois disso fica só no log de
     * erro da aplicação — quem chama não recebe confirmação de entrega. O log
     * administrativo guarda quem enviou, o destinatário, o assunto e a data;
     * o corpo da mensagem nunca vai para o log.</p>
     */
    @PostMapping("/usuarios/{codigo}/email")
    public ResponseEntity<Void> enviarEmailUsuario(
            @PathVariable String codigo,
            @Valid @RequestBody EnviarEmailUsuarioRequest request,
            Authentication authentication) {
        Usuario admin = adminAutenticado(authentication);
        Usuario alvo = usuarioService.buscarPorCodigo(codigo);
        exigirContaModeravel(admin, alvo, LogAdmin.TipoLog.EMAIL, "enviar e-mail a conta administrativa");

        String assunto = request.assunto().trim();
        emailService.enviarEmailPersonalizado(alvo, assunto, request.mensagem());

        logAdminService.registrar(LogAdminService
                .registro(admin, LogAdmin.TipoLog.EMAIL, "Enviou e-mail a usuário")
                .usuarioAfetado(alvo)
                .detalhe("destinatário", alvo.getEmail())
                .detalhe("assunto", assunto));

        return ResponseEntity.accepted().build();
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
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(toIdiomaCompletoResponse(idioma));
    }

    /**
     * Exclui o idioma com módulos, frases, avaliações e vínculos, avisa o
     * proprietário por e-mail e registra o log. O corpo é opcional: quando
     * traz {@code mensagem}, ela substitui o motivo padrão do e-mail
     * ({@link ExcluirIdiomaRequest}).
     *
     * <p>Nome, código e proprietário são lidos antes da exclusão, porque
     * depois dela a entidade some do banco; o e-mail e o log só acontecem se a
     * exclusão tiver dado certo. O envio é assíncrono, como nas demais ações
     * ({@link EmailService}).</p>
     */
    @DeleteMapping("/idiomas/{codigo}")
    public ResponseEntity<Void> excluirIdioma(
            @PathVariable String codigo,
            @Valid @RequestBody(required = false) ExcluirIdiomaRequest request,
            Authentication authentication) {
        Usuario admin = adminAutenticado(authentication);
        Idioma idioma = idiomaService.buscarPorCodigo(codigo);

        // Capturados antes da exclusão — o criador já vem inicializado pelo serviço.
        Long idIdioma = idioma.getId();
        String nomeIdioma = idioma.getNome();
        String codigoIdioma = idioma.getCodigo();
        Usuario proprietario = idioma.getCriador();
        String mensagem = request != null ? request.mensagem() : null;
        boolean mensagemPersonalizada = mensagem != null && !mensagem.isBlank();

        idiomaService.excluirComoAdmin(idIdioma);

        // Aviso e log só depois da exclusão: se ela falhar, nada é comunicado nem registrado.
        emailService.enviarAvisoIdiomaExcluido(proprietario, nomeIdioma, mensagem);

        // O proprietário é o usuário afetado; o idioma vai como retrato em texto, porque já não existe.
        logAdminService.registrar(LogAdminService
                .registro(admin, LogAdmin.TipoLog.IDIOMA, "Excluiu idioma")
                .idiomaAfetado(idIdioma, nomeIdioma, codigoIdioma)
                .usuarioAfetado(proprietario)
                .detalheSe(proprietario == null, "proprietário", "desconhecido")
                .detalhe("aviso ao proprietário", mensagemPersonalizada ? "mensagem personalizada" : "mensagem padrão"));

        return ResponseEntity.noContent().build();
    }

    // === Logs ===

    @GetMapping("/logs")
    public ResponseEntity<List<LogAdminResponse>> listarLogs() {
        return ResponseEntity.ok(
                logAdminService.listarTodos().stream()
                        .map(LogAdminResponse::from)
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
     * @param tipo domínio da ação tentada, para o log ficar na mesma categoria da ação.
     * @param acao infinitivo + objeto (ex.: "consultar conta administrativa"), usado no log.
     */
    private void exigirContaModeravel(Usuario admin, Usuario alvo, LogAdmin.TipoLog tipo, String acao) {
        if (alvo.getRole() != Usuario.Role.ADMIN) {
            return;
        }
        logAdminService.registrarTentativaBloqueada(LogAdminService
                .registro(admin, tipo, acao)
                .usuarioAfetado(alvo)
                .detalhe("motivo", MOTIVO_CONTA_ADMINISTRATIVA));
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, MOTIVO_CONTA_ADMINISTRATIVA);
    }

    /** Nome legível do status de denúncia para o log ("em análise", não "EM_ANALISE"). */
    private static String nomeStatus(Denuncia.StatusDenuncia status) {
        return status != null ? status.name().toLowerCase().replace('_', ' ') : null;
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
                d.getCodigo(),
                d.getIdioma() != null ? d.getIdioma().getCodigo() : null,
                d.getIdioma() != null ? d.getIdioma().getNome() : null,
                d.getUsuario() != null ? d.getUsuario().getCodigo() : null,
                d.getUsuario() != null ? d.getUsuario().getNome() : null,
                d.getData() != null ? d.getData().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null,
                d.getTiposJson(),
                d.getDescricao(),
                d.getStatus() != null ? d.getStatus().name().toLowerCase() : null,
                d.getResponsavel() != null ? d.getResponsavel().getCodigo() : null,
                d.getResponsavel() != null ? d.getResponsavel().getNome() : null
        );
    }
}
