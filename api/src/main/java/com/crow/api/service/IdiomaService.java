package com.crow.api.service;

import com.crow.api.dto.idioma.IdiomaRequest;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.IdiomaUsuario;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.IdiomaRepository;
import com.crow.api.repository.IdiomaUsuarioRepository;
import com.crow.api.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IdiomaService {

    private final IdiomaRepository idiomaRepository;
    private final IdiomaUsuarioRepository idiomaUsuarioRepository;
    private final ModuloRepository moduloRepository;

    public List<Idioma> buscarTodos() {
        return idiomaRepository.findAll();
    }

    public Idioma buscarPorId(Long id) {
        return idiomaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));
    }

    public List<Idioma> buscarPorCriador(Long criadorId) {
        return idiomaRepository.findByCriadorId(criadorId);
    }

    public List<Idioma> buscarPublicos() {
        return idiomaRepository.findByVisibilidade(Idioma.Visibilidade.PUBLICO);
    }

    public List<Idioma> buscar(String termo) {
        if (termo == null || termo.isBlank()) {
            return buscarPublicos();
        }
        return idiomaRepository.findByNomeContainingIgnoreCaseOrIdiomaContainingIgnoreCase(termo, termo);
    }

    public Idioma criar(IdiomaRequest dto, Usuario criador) {
        Idioma idioma = Idioma.builder()
                .nome(dto.nome())
                .idioma(dto.idioma())
                .bandeira(dto.bandeira())
                .descricao(dto.descricao())
                .criador(criador)
                .proficiencia(dto.proficiencia() != null
                        ? Idioma.Proficiencia.valueOf(dto.proficiencia().toUpperCase())
                        : null)
                .visibilidade(dto.visibilidade() != null
                        ? Idioma.Visibilidade.valueOf(dto.visibilidade().toUpperCase())
                        : Idioma.Visibilidade.PUBLICO)
                .build();

        return idiomaRepository.save(idioma);
    }

    public Idioma editar(Long id, IdiomaRequest dto) {
        Idioma idioma = buscarPorId(id);

        if (dto.nome() != null) idioma.setNome(dto.nome());
        if (dto.idioma() != null) idioma.setIdioma(dto.idioma());
        if (dto.bandeira() != null) idioma.setBandeira(dto.bandeira());
        if (dto.descricao() != null) idioma.setDescricao(dto.descricao());
        if (dto.proficiencia() != null) {
            idioma.setProficiencia(Idioma.Proficiencia.valueOf(dto.proficiencia().toUpperCase()));
        }
        if (dto.visibilidade() != null) {
            idioma.setVisibilidade(Idioma.Visibilidade.valueOf(dto.visibilidade().toUpperCase()));
        }

        idioma.setModulos(moduloRepository.countByIdiomaId(id));
        return idiomaRepository.save(idioma);
    }

    public void excluir(Long id) {
        Idioma idioma = buscarPorId(id);
        idiomaRepository.delete(idioma);
    }

    public void importar(Long usuarioId, Long idiomaId, Usuario usuario) {
        if (idiomaUsuarioRepository.existsByUsuarioIdAndIdiomaId(usuarioId, idiomaId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Idioma já importado");
        }

        int count = idiomaUsuarioRepository.countByUsuarioId(usuarioId);
        if (count >= 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite máximo de 4 idiomas atingido");
        }

        Idioma idioma = buscarPorId(idiomaId);
        IdiomaUsuario iu = IdiomaUsuario.builder()
                .usuario(usuario)
                .idioma(idioma)
                .build();
        idiomaUsuarioRepository.save(iu);
    }

    public List<Idioma> getIdiomasDoUsuario(Long usuarioId) {
        List<IdiomaUsuario> relacoes = idiomaUsuarioRepository.findByUsuarioId(usuarioId);
        return relacoes.stream()
                .map(IdiomaUsuario::getIdioma)
                .toList();
    }
}
