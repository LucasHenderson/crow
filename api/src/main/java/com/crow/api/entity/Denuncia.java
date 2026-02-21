package com.crow.api.entity;

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
    }

    public enum StatusDenuncia {
        PENDENTE, ANALISANDO, RESOLVIDA, REJEITADA
    }
}
