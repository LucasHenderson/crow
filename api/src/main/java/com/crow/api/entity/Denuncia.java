package com.crow.api.entity;

import com.crow.api.util.CodigoPublico;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "denuncias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identificador público (DEN-XXXXXXXXXXXX). Fica nullable no mapeamento
     * porque o ddl-auto=update cria a coluna vazia nas linhas já existentes —
     * elas são preenchidas por CodigoPublicoBackfill na subida da aplicação.
     */
    @Column(name = "codigo", unique = true, length = 20)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idioma_id")
    private Idioma idioma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column
    private LocalDateTime data;

    @Column(columnDefinition = "TEXT")
    private String tiposJson;

    @Column(length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusDenuncia status = StatusDenuncia.PENDENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    @PrePersist
    void prePersist() {
        this.data = LocalDateTime.now();
        if (this.codigo == null) {
            this.codigo = CodigoPublico.gerar(CodigoPublico.PREFIXO_DENUNCIA);
        }
    }

    public enum StatusDenuncia {
        PENDENTE, ANALISANDO, RESOLVIDA, REJEITADA
    }
}
