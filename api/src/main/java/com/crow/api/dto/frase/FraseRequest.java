package com.crow.api.dto.frase;

import jakarta.validation.constraints.NotBlank;

public record FraseRequest(
    @NotBlank String modo,
    String traducaoCompleta,
    String traducoesAlternativasJson,
    String palavrasJson,
    String imagem,
    String observacoes,
    String linksJson,
    String paresJson,
    String pergunta,
    String alternativasJson,
    Integer respostaCorreta,
    String imagemQuiz,
    String videoQuiz
) {}
