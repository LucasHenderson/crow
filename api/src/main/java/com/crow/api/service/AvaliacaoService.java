package com.crow.api.service;

import com.crow.api.dto.avaliacao.AvaliacaoResponse;
import com.crow.api.entity.Avaliacao;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.AvaliacaoRepository;
import com.crow.api.repository.IdiomaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final IdiomaRepository idiomaRepository;
    private final IdiomaService idiomaService;
    private final UsuarioService usuarioService;

    public AvaliacaoResponse avaliar(Long usuarioId, Long idiomaId, int nota) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        Idioma idioma = idiomaService.buscarPorId(idiomaId);

        Optional<Avaliacao> existente = avaliacaoRepository.findByUsuarioIdAndIdiomaId(usuarioId, idiomaId);

        if (existente.isPresent()) {
            Avaliacao avaliacao = existente.get();
            avaliacao.setNota(nota);
            avaliacaoRepository.save(avaliacao);
        } else {
            Avaliacao avaliacao = Avaliacao.builder()
                    .usuario(usuario)
                    .idioma(idioma)
                    .nota(nota)
                    .build();
            avaliacaoRepository.save(avaliacao);
        }

        // Recalcula média
        List<Avaliacao> todasAvaliacoes = avaliacaoRepository.findByIdiomaId(idiomaId);
        double media = todasAvaliacoes.stream()
                .mapToInt(Avaliacao::getNota)
                .average()
                .orElse(0);
        int total = todasAvaliacoes.size();

        idioma.setAvaliacao(Math.round(media * 10.0) / 10.0);
        idioma.setTotalAvaliacoes(total);
        idiomaRepository.save(idioma);

        return new AvaliacaoResponse(idioma.getAvaliacao(), total);
    }
}
