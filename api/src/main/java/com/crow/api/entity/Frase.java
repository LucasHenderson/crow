package com.crow.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "frases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Frase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModoFrase modo;

    @Column(name = "traducao_completa", length = 1000)
    private String traducaoCompleta;

    @Column(columnDefinition = "TEXT")
    private String palavrasJson;

    @Column
    private String imagem;

    @Column(length = 500)
    private String observacoes;

    @Column(columnDefinition = "TEXT")
    private String linksJson;

    @Column(columnDefinition = "TEXT")
    private String paresJson;

    @Column(length = 500)
    private String pergunta;

    @Column(columnDefinition = "TEXT")
    private String alternativasJson;

    @Column(name = "resposta_correta")
    private Integer respostaCorreta;

    @Column(name = "imagem_quiz")
    private String imagemQuiz;

    @Column(name = "video_quiz")
    private String videoQuiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    public enum ModoFrase {
        TRADUCAO, PARES, QUIZ
    }
}
