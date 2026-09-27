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

    /**
     * Ordens/traduções alternativas aceitas como corretas no modo TRADUCAO,
     * além da ordem principal derivada de {@code palavrasJson}. Armazenado como
     * um array JSON de strings (cada string é uma tradução completa válida).
     */
    @Column(name = "traducoes_alternativas_json", columnDefinition = "TEXT")
    private String traducoesAlternativasJson;

    /**
     * Áudio opcional da tradução completa (modo TRADUCAO), tocado no jogo em
     * velocidades de 0,25x a 2x. Guarda o caminho devolvido pelo upload de
     * áudio ({@code /api/uploads/...}); nulo quando não há áudio.
     */
    @Column(name = "audio_traducao_completa")
    private String audioTraducaoCompleta;

    /**
     * Array JSON de {@code {palavra, traducao}}. Cada item pode trazer ainda
     * {@code audioPalavra} e {@code audioTraducao}: caminhos opcionais de áudio,
     * no mesmo formato de {@link #audioTraducaoCompleta}.
     */
    @Column(columnDefinition = "TEXT")
    private String palavrasJson;

    @Column
    private String imagem;

    @Column(length = 500)
    private String observacoes;

    @Column(columnDefinition = "TEXT")
    private String linksJson;

    /**
     * Array JSON de {@code {imagem, palavra, traducao}}. Como nas palavras da
     * tradução direta, cada par pode trazer {@code audioPalavra} e {@code audioTraducao}.
     */
    @Column(columnDefinition = "TEXT")
    private String paresJson;

    @Column(length = 500)
    private String pergunta;

    /** Áudio opcional da pergunta do quiz; mesmo formato de {@link #audioTraducaoCompleta}. */
    @Column(name = "audio_pergunta")
    private String audioPergunta;

    @Column(columnDefinition = "TEXT")
    private String alternativasJson;

    /**
     * Áudios opcionais das alternativas do quiz: array JSON paralelo a
     * {@link #alternativasJson} (mesma ordem), com o caminho do áudio ou
     * {@code null} em cada posição. Nulo quando nenhuma alternativa tem áudio.
     */
    @Column(name = "audios_alternativas_json", columnDefinition = "TEXT")
    private String audiosAlternativasJson;

    @Column(name = "resposta_correta")
    private Integer respostaCorreta;

    @Column(name = "imagem_quiz")
    private String imagemQuiz;

    @Column(name = "video_quiz")
    private String videoQuiz;

    /**
     * Posição da frase dentro do módulo, começando em 1. Fica nullable no
     * mapeamento porque o ddl-auto=update cria a coluna vazia nas linhas já
     * existentes — elas são preenchidas por OrdemBackfill na subida da
     * aplicação. Frases novas recebem a posição em {@code FraseService.criar}.
     */
    @Column
    private Integer ordem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    public enum ModoFrase {
        TRADUCAO, PARES, QUIZ
    }
}
