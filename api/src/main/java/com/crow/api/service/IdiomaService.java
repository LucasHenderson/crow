package com.crow.api.service;

import com.crow.api.dto.idioma.IdiomaRequest;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.IdiomaUsuario;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.IdiomaRepository;
import com.crow.api.repository.IdiomaUsuarioRepository;
import com.crow.api.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional(readOnly = true)
    public Idioma buscarPorId(Long id) {
        Idioma idioma = idiomaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));
        Hibernate.initialize(idioma.getCriador());
        return idioma;
    }

    public List<Idioma> buscarPorCriador(Long criadorId) {
        return idiomaRepository.findByCriadorId(criadorId);
    }

    @Transactional(readOnly = true)
    public List<Idioma> buscarPublicos() {
        List<Idioma> idiomas = idiomaRepository.findByVisibilidade(Idioma.Visibilidade.PUBLICO);
        idiomas.forEach(i -> Hibernate.initialize(i.getCriador()));
        return idiomas;
    }

    @Transactional(readOnly = true)
    public List<Idioma> buscar(String termo) {
        if (termo == null || termo.isBlank()) {
            return buscarPublicos();
        }
        List<Idioma> idiomas = idiomaRepository.findByNomeContainingIgnoreCaseOrIdiomaContainingIgnoreCase(termo, termo);
        idiomas.forEach(i -> Hibernate.initialize(i.getCriador()));
        return idiomas;
    }

    @Transactional
    public Idioma criar(IdiomaRequest dto, Usuario criador) {
        int count = idiomaUsuarioRepository.countByUsuarioId(criador.getId());
        if (count >= 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite máximo de 4 idiomas atingido");
        }

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

        Idioma salvo = idiomaRepository.save(idioma);

        IdiomaUsuario vinculo = IdiomaUsuario.builder()
                .usuario(criador)
                .idioma(salvo)
                .build();
        idiomaUsuarioRepository.save(vinculo);

        return salvo;
    }

    @Transactional
    public Idioma editar(Long id, IdiomaRequest dto) {
        Idioma idioma = idiomaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));

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
        Idioma salvo = idiomaRepository.save(idioma);
        Hibernate.initialize(salvo.getCriador());
        return salvo;
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Idioma idioma = buscarPorId(id);
        boolean ehCriador = idioma.getCriador() != null
                && idioma.getCriador().getId().equals(usuarioId);

        if (ehCriador) {
            idiomaUsuarioRepository.deleteByIdiomaId(id);
            idiomaRepository.delete(idioma);
        } else {
            idiomaUsuarioRepository.deleteByUsuarioIdAndIdiomaId(usuarioId, id);
        }
    }

    @Transactional
    public void excluirComoAdmin(Long id) {
        Idioma idioma = buscarPorId(id);
        idiomaUsuarioRepository.deleteByIdiomaId(id);
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

    @Transactional(readOnly = true)
    public List<Idioma> getIdiomasDoUsuario(Long usuarioId) {
        List<IdiomaUsuario> relacoes = idiomaUsuarioRepository.findByUsuarioIdFetchIdioma(usuarioId);
        return relacoes.stream()
                .map(IdiomaUsuario::getIdioma)
                .toList();
    }
}
