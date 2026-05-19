package com.crow.api.service;

import com.crow.api.dto.frase.FraseRequest;
import com.crow.api.entity.Frase;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FraseService {

    private final FraseRepository fraseRepository;
    private final ModuloService moduloService;

    public List<Frase> buscarPorModulo(Long moduloId) {
        return fraseRepository.findByModuloId(moduloId);
    }

    public Frase buscarPorId(Long id) {
        return fraseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Frase não encontrada"));
    }

    @Transactional
    public Frase criar(Long moduloId, FraseRequest dto, Long usuarioId) {
        moduloService.validarProprietarioDoModulo(moduloId, usuarioId);
        Modulo modulo = moduloService.buscarPorId(moduloId);

        Frase frase = Frase.builder()
                .modo(Frase.ModoFrase.valueOf(dto.modo().toUpperCase()))
                .traducaoCompleta(dto.traducaoCompleta())
                .palavrasJson(dto.palavrasJson())
                .imagem(dto.imagem())
                .observacoes(dto.observacoes())
                .linksJson(dto.linksJson())
                .paresJson(dto.paresJson())
                .pergunta(dto.pergunta())
                .alternativasJson(dto.alternativasJson())
                .respostaCorreta(dto.respostaCorreta())
                .imagemQuiz(dto.imagemQuiz())
                .videoQuiz(dto.videoQuiz())
                .modulo(modulo)
                .build();

        frase = fraseRepository.save(frase);
        moduloService.registrarAtualizacao(modulo);
        return frase;
    }

    @Transactional
    public Frase editar(Long id, FraseRequest dto, Long usuarioId) {
        Frase frase = buscarPorId(id);
        moduloService.validarProprietarioDoModulo(frase.getModulo().getId(), usuarioId);

        if (dto.modo() != null) frase.setModo(Frase.ModoFrase.valueOf(dto.modo().toUpperCase()));
        if (dto.traducaoCompleta() != null) frase.setTraducaoCompleta(dto.traducaoCompleta());
        if (dto.palavrasJson() != null) frase.setPalavrasJson(dto.palavrasJson());
        if (dto.imagem() != null) frase.setImagem(dto.imagem());
        if (dto.observacoes() != null) frase.setObservacoes(dto.observacoes());
        if (dto.linksJson() != null) frase.setLinksJson(dto.linksJson());
        if (dto.paresJson() != null) frase.setParesJson(dto.paresJson());
        if (dto.pergunta() != null) frase.setPergunta(dto.pergunta());
        if (dto.alternativasJson() != null) frase.setAlternativasJson(dto.alternativasJson());
        if (dto.respostaCorreta() != null) frase.setRespostaCorreta(dto.respostaCorreta());
        if (dto.imagemQuiz() != null) frase.setImagemQuiz(dto.imagemQuiz());
        if (dto.videoQuiz() != null) frase.setVideoQuiz(dto.videoQuiz());

        Frase salva = fraseRepository.save(frase);
        moduloService.registrarAtualizacao(frase.getModulo());
        return salva;
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Frase frase = buscarPorId(id);
        Modulo modulo = frase.getModulo();
        moduloService.validarProprietarioDoModulo(modulo.getId(), usuarioId);
        fraseRepository.delete(frase);
        moduloService.registrarAtualizacao(modulo);
    }

    public List<Frase> getFrasesParaJogo(List<Long> moduloIds) {
        List<Frase> todasFrases = new ArrayList<>();
        for (Long moduloId : moduloIds) {
            todasFrases.addAll(fraseRepository.findByModuloId(moduloId));
        }
        Collections.shuffle(todasFrases);
        return todasFrases.stream().limit(10).toList();
    }
}
