package com.crow.api.service;

import com.crow.api.dto.denuncia.DenunciaRequest;
import com.crow.api.entity.Denuncia;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.DenunciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DenunciaService {

    private final DenunciaRepository denunciaRepository;
    private final IdiomaService idiomaService;

    public List<Denuncia> buscarTodas() {
        return denunciaRepository.findAll();
    }

    public Denuncia buscarPorId(Long id) {
        return denunciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denúncia não encontrada"));
    }

    public Denuncia criar(DenunciaRequest dto, Usuario usuario) {
        Idioma idioma = idiomaService.buscarPorId(dto.idiomaId());

        Denuncia denuncia = Denuncia.builder()
                .idioma(idioma)
                .usuario(usuario)
                .tiposJson(dto.tiposJson())
                .descricao(dto.descricao())
                .build();

        return denunciaRepository.save(denuncia);
    }

    public Denuncia alterarStatus(Long id, String novoStatus, Usuario responsavel) {
        Denuncia denuncia = buscarPorId(id);
        denuncia.setStatus(Denuncia.StatusDenuncia.valueOf(novoStatus.toUpperCase()));
        denuncia.setResponsavel(responsavel);
        return denunciaRepository.save(denuncia);
    }
}
