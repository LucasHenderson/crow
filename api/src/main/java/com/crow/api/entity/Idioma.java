package com.crow.api.entity;

import com.crow.api.util.CodigoPublico;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identificador público (IDM-XXXXXXXXXXXX). Fica nullable no mapeamento
     * porque o ddl-auto=update cria a coluna vazia nas linhas já existentes —
     * elas são preenchidas por CodigoPublicoBackfill na subida da aplicação.
     */
    @Column(name = "codigo", unique = true, length = 20)
    private String codigo;

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

    /**
     * Momento da última alteração de conteúdo do idioma. Fica nullable porque o
     * ddl-auto=update cria a coluna vazia nas linhas já existentes — elas são
     * preenchidas por IdiomaAtualizadoEmBackfill na subida da aplicação.
     */
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @OneToMany(mappedBy = "idioma", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Modulo> modulosList = new ArrayList<>();

    @PrePersist
    void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
        if (this.codigo == null) {
            this.codigo = CodigoPublico.gerar(CodigoPublico.PREFIXO_IDIOMA);
        }
    }

    @PreUpdate
    void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public enum Proficiencia {
        INICIANTE, BASICO, INTERMEDIARIO, AVANCADO, FLUENTE
    }

    public enum Visibilidade {
        PUBLICO, PRIVADO
    }
}
