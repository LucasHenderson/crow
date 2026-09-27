package com.crow.api.dto.frase;

import com.crow.api.entity.Frase;

public record FraseResponse(
    Long id,
    String codigo,
    String modo,
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
    String videoQuiz,
    Integer ordem
) {

    public static FraseResponse from(Frase frase) {
        return new FraseResponse(
                frase.getId(),
                "FRS-" + frase.getId(),
                frase.getModo() != null ? frase.getModo().name().toLowerCase() : null,
                frase.getTraducaoCompleta(),
                frase.getTraducoesAlternativasJson(),
                frase.getAudioTraducaoCompleta(),
                frase.getPalavrasJson(),
                frase.getImagem(),
                frase.getObservacoes(),
                frase.getLinksJson(),
                frase.getParesJson(),
                frase.getPergunta(),
                frase.getAudioPergunta(),
                frase.getAlternativasJson(),
                frase.getAudiosAlternativasJson(),
                frase.getRespostaCorreta(),
                frase.getImagemQuiz(),
                frase.getVideoQuiz(),
                frase.getOrdem()
        );
    }
}
