package com.crow.api.dto.frase;

public record FraseResponse(
    Long id,
    String modo,
    String traducaoCompleta,
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
