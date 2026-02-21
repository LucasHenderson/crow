package com.crow.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "idiomas_usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdiomaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idioma_id", nullable = false)
    private Idioma idioma;

    @Column(name = "adicionado_em")
    private LocalDateTime adicionadoEm;

    @PrePersist
    void prePersist() {
        this.adicionadoEm = LocalDateTime.now();
    }
}
