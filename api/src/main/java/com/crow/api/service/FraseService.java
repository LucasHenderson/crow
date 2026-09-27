package com.crow.api.service;

import com.crow.api.dto.frase.FraseRequest;
import com.crow.api.entity.Frase;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import com.crow.api.util.FormatoAudio;
import com.crow.api.util.Reordenacao;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    /** Chaves de áudio de cada item de {@code palavrasJson} e {@code paresJson}. */
    private static final List<String> CHAVES_AUDIO_ITEM = List.of("audioPalavra", "audioTraducao");

    private final FraseRepository fraseRepository;
    private final ModuloService moduloService;
    private final IdiomaService idiomaService;
    private final ObjectMapper objectMapper;

    /**
     * Sobe a alteração da frase até o idioma: o módulo registra a mudança e o
     * idioma dono dele também, para que a "última atualização" da página do
     * idioma reflita edições feitas em frases.
     */
    private void propagarAtualizacao(Modulo modulo) {
        moduloService.registrarAtualizacao(modulo);
        idiomaService.registrarAtualizacao(modulo.getIdioma().getId());
    }

    /** Frases do módulo na ordem definida pelo criador. */
    public List<Frase> buscarPorModulo(Long moduloId) {
        return fraseRepository.findByModuloIdOrderByOrdemAscIdAsc(moduloId);
    }

    public Frase buscarPorId(Long id) {
        return fraseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Frase não encontrada"));
    }

    @Transactional
    public Frase criar(Long moduloId, FraseRequest dto, Long usuarioId) {
        moduloService.validarProprietarioDoModulo(moduloId, usuarioId, "criar frase");
        Modulo modulo = moduloService.buscarPorId(moduloId);
        validarAudiosDosItens(dto.palavrasJson(), "nas palavras");
        validarAudiosDosItens(dto.paresJson(), "nos pares");

        Frase frase = Frase.builder()
                .modo(Frase.ModoFrase.valueOf(dto.modo().toUpperCase()))
                .traducaoCompleta(dto.traducaoCompleta())
                .traducoesAlternativasJson(dto.traducoesAlternativasJson())
                .audioTraducaoCompleta(normalizarAudio(dto.audioTraducaoCompleta(), "na tradução completa"))
                .palavrasJson(dto.palavrasJson())
                .imagem(dto.imagem())
                .observacoes(dto.observacoes())
                .linksJson(dto.linksJson())
                .paresJson(dto.paresJson())
                .pergunta(dto.pergunta())
                .audioPergunta(normalizarAudio(dto.audioPergunta(), "na pergunta"))
                .alternativasJson(dto.alternativasJson())
                .audiosAlternativasJson(normalizarAudiosAlternativas(dto.audiosAlternativasJson()))
                .respostaCorreta(dto.respostaCorreta())
                .imagemQuiz(dto.imagemQuiz())
                .videoQuiz(dto.videoQuiz())
                .ordem(Reordenacao.proximaPosicao(fraseRepository.maiorOrdemDoModulo(moduloId)))
                .modulo(modulo)
                .build();

        frase = fraseRepository.save(frase);
        propagarAtualizacao(modulo);
        return frase;
    }

    @Transactional
    public Frase editar(Long id, FraseRequest dto, Long usuarioId) {
        Frase frase = buscarPorId(id);
        moduloService.validarProprietarioDoModulo(frase.getModulo().getId(), usuarioId, "editar frase");
        validarAudiosDosItens(dto.palavrasJson(), "nas palavras");
        validarAudiosDosItens(dto.paresJson(), "nos pares");

        if (dto.modo() != null) frase.setModo(Frase.ModoFrase.valueOf(dto.modo().toUpperCase()));
        if (dto.traducaoCompleta() != null) frase.setTraducaoCompleta(dto.traducaoCompleta());
        if (dto.traducoesAlternativasJson() != null) frase.setTraducoesAlternativasJson(dto.traducoesAlternativasJson());
        if (dto.audioTraducaoCompleta() != null) {
            frase.setAudioTraducaoCompleta(normalizarAudio(dto.audioTraducaoCompleta(), "na tradução completa"));
        }
        if (dto.palavrasJson() != null) frase.setPalavrasJson(dto.palavrasJson());
        if (dto.imagem() != null) frase.setImagem(dto.imagem());
        if (dto.observacoes() != null) frase.setObservacoes(dto.observacoes());
        if (dto.linksJson() != null) frase.setLinksJson(dto.linksJson());
        if (dto.paresJson() != null) frase.setParesJson(dto.paresJson());
        if (dto.pergunta() != null) frase.setPergunta(dto.pergunta());
        if (dto.audioPergunta() != null) frase.setAudioPergunta(normalizarAudio(dto.audioPergunta(), "na pergunta"));
        if (dto.alternativasJson() != null) frase.setAlternativasJson(dto.alternativasJson());
        if (dto.audiosAlternativasJson() != null) {
            frase.setAudiosAlternativasJson(normalizarAudiosAlternativas(dto.audiosAlternativasJson()));
        }
        if (dto.respostaCorreta() != null) frase.setRespostaCorreta(dto.respostaCorreta());
        if (dto.imagemQuiz() != null) frase.setImagemQuiz(dto.imagemQuiz());
        if (dto.videoQuiz() != null) frase.setVideoQuiz(dto.videoQuiz());

        Frase salva = fraseRepository.save(frase);
        propagarAtualizacao(frase.getModulo());
        return salva;
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Frase frase = buscarPorId(id);
        Modulo modulo = frase.getModulo();
        moduloService.validarProprietarioDoModulo(modulo.getId(), usuarioId, "excluir frase");
        fraseRepository.delete(frase);

        // Fecha o buraco deixado na sequência pelas frases restantes
        renumerarFrasesDoModulo(modulo.getId());

        propagarAtualizacao(modulo);
    }

    /**
     * Persiste a nova ordem das frases do módulo. A lista precisa conter todas
     * as frases do módulo exatamente uma vez; do contrário devolve 400. Só o
     * proprietário do idioma dono do módulo pode reordenar (403 caso contrário).
     *
     * @return as frases já na nova ordem.
     */
    @Transactional
    public List<Frase> reordenar(Long moduloId, List<Long> idsOrdenados, Long usuarioId) {
        moduloService.validarProprietarioDoModulo(moduloId, usuarioId, "reordenar frases");

        List<Frase> existentes = fraseRepository.findByModuloIdOrderByOrdemAscIdAsc(moduloId);
        if (existentes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este módulo não possui frases para reordenar");
        }

        List<Frase> naNovaOrdem = Reordenacao.aplicar(
                existentes, idsOrdenados, Frase::getId, Frase::setOrdem, "as frases deste módulo");

        fraseRepository.saveAll(naNovaOrdem);
        propagarAtualizacao(moduloService.buscarPorId(moduloId));
        return naNovaOrdem;
    }

    /** Reescreve as posições das frases do módulo como 1..n, sem buracos. */
    private void renumerarFrasesDoModulo(Long moduloId) {
        List<Frase> restantes = fraseRepository.findByModuloIdOrderByOrdemAscIdAsc(moduloId);
        fraseRepository.saveAll(
                Reordenacao.renumerar(restantes, Frase::getOrdem, Frase::setOrdem));
    }

    // === Áudios ===
    //
    // A frase guarda só caminhos devolvidos por POST /api/uploads/audio. Nada de
    // URL externa (rastrearia quem joga), blob: do navegador ou imagem no lugar
    // do áudio: tudo que não for referência de áudio deste servidor é recusado.
    // O parâmetro `local` completa a mensagem de erro ("na pergunta", "nos pares").

    /** Texto vazio remove o áudio (vira nulo); o restante precisa ser uma referência válida. */
    private static String normalizarAudio(String caminho, String local) {
        if (caminho == null || caminho.isBlank()) {
            return null;
        }
        if (!FormatoAudio.referenciaValida(caminho)) {
            throw audioInvalido(local);
        }
        return caminho;
    }

    /**
     * Lista de áudios das alternativas do quiz, paralela a {@code alternativasJson}:
     * cada posição é uma referência de áudio ou nula. Devolve o JSON reescrito no
     * formato canônico, ou nulo quando nenhuma alternativa tem áudio.
     */
    private String normalizarAudiosAlternativas(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        JsonNode lista = lerJson(json, "nas alternativas");
        if (!lista.isArray()) {
            throw formatoInvalido("nas alternativas");
        }

        List<String> caminhos = new ArrayList<>();
        boolean algumAudio = false;
        for (JsonNode item : lista) {
            if (semAudio(item)) {
                caminhos.add(null);
                continue;
            }
            if (!item.isTextual()) {
                throw audioInvalido("nas alternativas");
            }
            caminhos.add(normalizarAudio(item.asText(), "nas alternativas"));
            algumAudio = true;
        }
        if (!algumAudio) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(caminhos);
        } catch (JsonProcessingException e) {
            throw formatoInvalido("nas alternativas");
        }
    }

    /**
     * Confere {@code audioPalavra} e {@code audioTraducao} de cada item de uma
     * lista JSON de palavras ou de pares. O restante do item não é examinado.
     */
    private void validarAudiosDosItens(String json, String local) {
        if (json == null || json.isBlank()) {
            return;
        }
        JsonNode lista = lerJson(json, local);
        if (!lista.isArray()) {
            throw formatoInvalido(local);
        }
        for (JsonNode item : lista) {
            for (String chave : CHAVES_AUDIO_ITEM) {
                JsonNode audio = item.get(chave);
                if (semAudio(audio)) {
                    continue;
                }
                if (!audio.isTextual() || !FormatoAudio.referenciaValida(audio.asText())) {
                    throw audioInvalido(local);
                }
            }
        }
    }

    /** Ausente, nulo ou texto vazio: a posição não tem áudio. */
    private static boolean semAudio(JsonNode no) {
        return no == null || no.isNull() || (no.isTextual() && no.asText().isBlank());
    }

    private JsonNode lerJson(String json, String local) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw formatoInvalido(local);
        }
    }

    private static ResponseStatusException audioInvalido(String local) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Áudio inválido " + local + ": envie o arquivo pelo formulário da frase");
    }

    private static ResponseStatusException formatoInvalido(String local) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato inválido " + local);
    }

    /** Quantidade máxima de frases sorteadas no modo aleatório. */
    private static final int LIMITE_JOGO_ALEATORIO = 10;

    /**
     * Monta a lista de frases para uma sessão de jogo respeitando o modo de ordem:
     * <ul>
     *   <li><b>cadastro</b>: todas as frases na ordem definida pelo criador
     *       (módulos na ordem selecionada, frases pelo campo {@code ordem}),
     *       sem sorteio;</li>
     *   <li><b>aleatoria</b> (padrão): embaralha e limita a {@value #LIMITE_JOGO_ALEATORIO}.</li>
     * </ul>
     */
    public List<Frase> getFrasesParaJogo(List<Long> moduloIds, String ordem) {
        boolean ordemCadastro = "cadastro".equalsIgnoreCase(ordem);

        List<Frase> todasFrases = new ArrayList<>();
        for (Long moduloId : moduloIds) {
            todasFrases.addAll(fraseRepository.findByModuloIdOrderByOrdemAscIdAsc(moduloId));
        }

        if (ordemCadastro) {
            return todasFrases;
        }

        Collections.shuffle(todasFrases);
        return todasFrases.stream().limit(LIMITE_JOGO_ALEATORIO).toList();
    }
}
