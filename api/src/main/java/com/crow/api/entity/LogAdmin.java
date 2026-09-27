package com.crow.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Registro de uma ação administrativa. Além de quem fez e o quê, guarda
 * <b>quem foi afetado</b> — usuário e/ou idioma — para os logs serem
 * rastreáveis sem depender do texto de {@code detalhes}.
 *
 * <p>Usuário afetado: FK real ({@code usuarioAfetado}) mais um retrato em
 * texto (nome e código). Contas nunca são excluídas, então a FK é segura; o
 * retrato preserva o nome da época e dispensa join na listagem.</p>
 *
 * <p>Idioma afetado: <b>sem FK</b>. A ação administrativa típica sobre idioma
 * é a exclusão, e uma FK impediria excluir o idioma (ou seria apagada com
 * ele). Guardam-se apenas id numérico, nome e código como texto.</p>
 *
 * <p>Ações do próprio sistema (ex.: reativação agendada) ficam com
 * {@code admin} nulo — é assim que a listagem as identifica.</p>
 *
 * <p>Todas as colunas novas aceitam nulo: {@code ddl-auto=update} as cria
 * sobre registros históricos que não as têm.</p>
 */
@Entity
@Table(name = "logs_admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private LocalDateTime data;

    /** Administrador responsável; nulo em ações automáticas do sistema. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Usuario admin;

    /** Verbo no passado + objeto (ex.: "Suspendeu conta de usuário"). */
    @Column(length = 200)
    private String acao;

    /** Pares {@code chave: valor} separados por "; " (ver {@code LogAdminService}). */
    @Column(length = 1000)
    private String detalhes;

    @Enumerated(EnumType.STRING)
    private TipoLog tipo;

    // --- Usuário afetado ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_afetado_id")
    private Usuario usuarioAfetado;

    @Column(name = "usuario_afetado_nome")
    private String usuarioAfetadoNome;

    @Column(name = "usuario_afetado_codigo", length = 20)
    private String usuarioAfetadoCodigo;

    // --- Idioma afetado (sem FK: precisa sobreviver à exclusão do idioma) ---

    @Column(name = "idioma_afetado_id")
    private Long idiomaAfetadoId;

    @Column(name = "idioma_afetado_nome")
    private String idiomaAfetadoNome;

    @Column(name = "idioma_afetado_codigo", length = 20)
    private String idiomaAfetadoCodigo;

    @PrePersist
    void prePersist() {
        this.data = LocalDateTime.now();
    }

    /**
     * Domínio da ação. {@code USUARIO} continua existindo para os registros
     * históricos e para consultas de conta; as ações de status de conta
     * passaram a {@code MODERACAO} e o envio de e-mail a {@code EMAIL}.
     */
    public enum TipoLog {
        DENUNCIA, USUARIO, IDIOMA, MODERACAO, EMAIL
    }
}
