package com.crow.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logs_admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column
    private LocalDateTime data;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Usuario admin;

    @Column(length = 200)
    private String acao;

    @Column(length = 1000)
    private String detalhes;

    @Enumerated(EnumType.STRING)
    private TipoLog tipo;

    @PrePersist
    void prePersist() {
        this.data = LocalDateTime.now();
    }

    public enum TipoLog {
        DENUNCIA, USUARIO, IDIOMA
    }
}
