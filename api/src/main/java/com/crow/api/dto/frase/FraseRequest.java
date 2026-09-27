package com.crow.api.dto.frase;

import jakarta.validation.constraints.NotBlank;

/**
 * Os campos de áudio guardam caminhos devolvidos por {@code POST /api/uploads/audio}.
 * Na edição, {@code null} mantém o valor atual e texto vazio remove o áudio —
 * a mesma regra dos demais campos.
 */
public record FraseRequest(
    @NotBlank String modo,
    String traducaoCompleta,
    String traducoesAlternativasJson,
    String audioTraducaoCompleta,
    String palavrasJson,
    String imagem,
    String observacoes,
    String linksJson,
    String paresJson,
    String pergunta,
    String audioPergunta,
    String alternativasJson,
    String audiosAlternativasJson,
    Integer respostaCorreta,
    String imagemQuiz,
    String videoQuiz
) {}
