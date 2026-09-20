package com.crow.api.entity;

import com.crow.api.util.CodigoPublico;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identificador público (USR-XXXXXXXXXXXX). Fica nullable no mapeamento
     * porque o ddl-auto=update cria a coluna vazia nas linhas já existentes —
     * elas são preenchidas por CodigoPublicoBackfill na subida da aplicação.
     */
    @Column(name = "codigo", unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(length = 20)
    private String telefone;

    @Column(name = "data_entrada")
    private LocalDateTime dataEntrada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ATIVO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.COMUM;

    /**
     * Fim de uma suspensão temporária: enquanto {@code status} for INATIVO e
     * este instante ainda não tiver chegado, a conta está suspensa; ao ser
     * atingido, a reativação automática devolve o status para ATIVO e zera o
     * campo. Nulo quando a conta está ativa ou desativada por tempo
     * indeterminado (que só volta por ação manual do administrador).
     */
    @Column(name = "suspenso_ate")
    private LocalDateTime suspensoAte;

    /** Justificativa da última ação de moderação sobre a conta (opcional). */
    @Column(name = "motivo_status", length = 1000)
    private String motivoStatus;

    /** Momento da última ação de moderação (manual ou automática) sobre o status. */
    @Column(name = "status_alterado_em")
    private LocalDateTime statusAlteradoEm;

    @PrePersist
    void prePersist() {
        this.dataEntrada = LocalDateTime.now();
        if (this.codigo == null) {
            this.codigo = CodigoPublico.gerar(CodigoPublico.PREFIXO_USUARIO);
        }
    }

    public enum Status {
        ATIVO, INATIVO
    }

    public enum Role {
        COMUM, ADMIN
    }
}
