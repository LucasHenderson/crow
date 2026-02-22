package com.crow.api.service;

import com.crow.api.dto.modulo.ModuloRequest;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Modulo;
import com.crow.api.repository.FraseRepository;
import com.crow.api.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuloService {

    private final ModuloRepository moduloRepository;
    private final FraseRepository fraseRepository;
    private final IdiomaService idiomaService;

    public List<Modulo> buscarPorIdioma(Long idiomaId) {
        return moduloRepository.findByIdiomaId(idiomaId);
    }

    public Modulo buscarPorId(Long id) {
        return moduloRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado"));
    }

    public Modulo criar(Long idiomaId, ModuloRequest dto) {
        int count = moduloRepository.countByIdiomaId(idiomaId);
        if (count >= 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite máximo de 20 módulos por idioma atingido");
        }

        Idioma idioma = idiomaService.buscarPorId(idiomaId);
        Modulo modulo = Modulo.builder()
                .nome(dto.nome())
                .icone(dto.icone())
                .idioma(idioma)
                .build();

        modulo = moduloRepository.save(modulo);

        // Atualiza contagem de módulos no idioma
        idioma.setModulos(count + 1);

        return modulo;
    }

    public Modulo editar(Long id, ModuloRequest dto) {
        Modulo modulo = buscarPorId(id);
        if (dto.nome() != null) modulo.setNome(dto.nome());
        if (dto.icone() != null) modulo.setIcone(dto.icone());
        return moduloRepository.save(modulo);
    }

    public void excluir(Long id) {
        Modulo modulo = buscarPorId(id);
        Long idiomaId = modulo.getIdioma().getId();
        moduloRepository.delete(modulo);

        // Atualiza contagem
        Idioma idioma = idiomaService.buscarPorId(idiomaId);
        idioma.setModulos(moduloRepository.countByIdiomaId(idiomaId));
    }
}
