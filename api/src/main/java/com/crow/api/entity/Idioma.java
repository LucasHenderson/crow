package com.crow.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "idiomas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Idioma {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100)
    private String idioma;

    @Column
    private String bandeira;

    @Column(length = 500)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criador_id", nullable = false)
    private Usuario criador;

    @Column
    @Builder.Default
    private int modulos = 0;

    @Column
    @Builder.Default
    private double avaliacao = 0;

    @Column(name = "total_avaliacoes")
    @Builder.Default
    private int totalAvaliacoes = 0;

    @Enumerated(EnumType.STRING)
    private Proficiencia proficiencia;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Visibilidade visibilidade = Visibilidade.PUBLICO;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @OneToMany(mappedBy = "idioma", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Modulo> modulosList = new ArrayList<>();

    @PrePersist
    void prePersist() {
        this.criadoEm = LocalDateTime.now();
    }

    public enum Proficiencia {
        INICIANTE, BASICO, INTERMEDIARIO, AVANCADO, FLUENTE
    }

    public enum Visibilidade {
        PUBLICO, PRIVADO
    }
}
