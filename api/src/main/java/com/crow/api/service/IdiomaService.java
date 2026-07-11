package com.crow.api.service;

import com.crow.api.dto.idioma.IdiomaRequest;
import com.crow.api.entity.Denuncia;
import com.crow.api.entity.Frase;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.IdiomaUsuario;
import com.crow.api.entity.Modulo;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.AvaliacaoRepository;
import com.crow.api.repository.DenunciaRepository;
import com.crow.api.repository.FraseRepository;
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
    private final FraseRepository fraseRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final DenunciaRepository denunciaRepository;

    /** Limite máximo de idiomas que um usuário pode possuir. */
    private static final int LIMITE_IDIOMAS_POR_USUARIO = 4;

    @Transactional(readOnly = true)
    public List<Idioma> buscarTodos() {
        List<Idioma> idiomas = idiomaRepository.findAll();
        idiomas.forEach(i -> Hibernate.initialize(i.getCriador()));
        atualizarContagemModulos(idiomas);
        return idiomas;
    }

    @Transactional(readOnly = true)
    public Idioma buscarPorId(Long id) {
        Idioma idioma = idiomaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));
        Hibernate.initialize(idioma.getCriador());
        atualizarContagemModulos(idioma);
        return idioma;
    }

    /** Idiomas públicos criados por um usuário — exibidos no perfil público dele. */
    @Transactional(readOnly = true)
    public List<Idioma> buscarPublicosPorCriador(Long criadorId) {
        List<Idioma> idiomas = idiomaRepository
                .findByVisibilidadeAndCriadorId(Idioma.Visibilidade.PUBLICO, criadorId);
        idiomas.forEach(i -> Hibernate.initialize(i.getCriador()));
        atualizarContagemModulos(idiomas);
        return idiomas;
    }

    /**
     * Idiomas públicos disponíveis para descoberta: apenas marcados como
     * PUBLICO e que NÃO pertencem ao próprio usuário logado.
     */
    @Transactional(readOnly = true)
    public List<Idioma> buscarPublicos(Long usuarioId) {
        List<Idioma> idiomas = idiomaRepository
                .findByVisibilidadeAndCriadorIdNot(Idioma.Visibilidade.PUBLICO, usuarioId);
        idiomas.forEach(i -> Hibernate.initialize(i.getCriador()));
        atualizarContagemModulos(idiomas);
        return idiomas;
    }

    /**
     * Busca por termo, restrita aos mesmos critérios de {@link #buscarPublicos}:
     * somente idiomas públicos de outros usuários.
     */
    @Transactional(readOnly = true)
    public List<Idioma> buscar(String termo, Long usuarioId) {
        if (termo == null || termo.isBlank()) {
            return buscarPublicos(usuarioId);
        }
        List<Idioma> idiomas = idiomaRepository
                .buscarPublicosPorTermo(Idioma.Visibilidade.PUBLICO, usuarioId, termo);
        idiomas.forEach(i -> Hibernate.initialize(i.getCriador()));
        atualizarContagemModulos(idiomas);
        return idiomas;
    }

    /**
     * Garante que o usuário informado é o proprietário (criador) do idioma.
     * Lança 403 caso contrário. Usado para proteger operações de escrita.
     */
    @Transactional(readOnly = true)
    public void validarProprietario(Long idiomaId, Long usuarioId) {
        Idioma idioma = idiomaRepository.findById(idiomaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));
        Long criadorId = idioma.getCriador() != null ? idioma.getCriador().getId() : null;
        if (criadorId == null || !criadorId.equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para modificar este idioma");
        }
    }

    /**
     * Garante que o usuário pode LER o conteúdo do idioma: proprietário sempre
     * pode; demais usuários apenas se o idioma for público. Lança 403 caso
     * contrário. Protege módulos e frases de idiomas privados.
     */
    @Transactional(readOnly = true)
    public void validarAcessoLeitura(Long idiomaId, Long usuarioId) {
        Idioma idioma = idiomaRepository.findById(idiomaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));
        Long criadorId = idioma.getCriador() != null ? idioma.getCriador().getId() : null;
        boolean ehProprietario = criadorId != null && criadorId.equals(usuarioId);
        if (!ehProprietario && idioma.getVisibilidade() != Idioma.Visibilidade.PUBLICO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Este idioma é privado");
        }
    }

    @Transactional
    public Idioma criar(IdiomaRequest dto, Usuario criador) {
        int count = idiomaUsuarioRepository.countByUsuarioId(criador.getId());
        if (count >= LIMITE_IDIOMAS_POR_USUARIO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Limite máximo de " + LIMITE_IDIOMAS_POR_USUARIO + " idiomas atingido");
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
    public Idioma editar(Long id, IdiomaRequest dto, Long usuarioId) {
        Idioma idioma = idiomaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));

        Long criadorId = idioma.getCriador() != null ? idioma.getCriador().getId() : null;
        if (criadorId == null || !criadorId.equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para editar este idioma");
        }

        aplicarEdicao(idioma, dto);
        Idioma salvo = idiomaRepository.save(idioma);
        Hibernate.initialize(salvo.getCriador());
        return salvo;
    }

    /** Aplica os campos não nulos do request sobre a entidade (edição parcial). */
    private void aplicarEdicao(Idioma idioma, IdiomaRequest dto) {
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
        idioma.setModulos(moduloRepository.countByIdiomaId(idioma.getId()));
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Idioma idioma = buscarPorId(id);
        boolean ehCriador = idioma.getCriador() != null
                && idioma.getCriador().getId().equals(usuarioId);

        if (ehCriador) {
            removerVinculosDoIdioma(id);
            idiomaRepository.delete(idioma);
        } else {
            idiomaUsuarioRepository.deleteByUsuarioIdAndIdiomaId(usuarioId, id);
        }
    }

    @Transactional
    public void excluirComoAdmin(Long id) {
        Idioma idioma = buscarPorId(id);
        removerVinculosDoIdioma(id);
        idiomaRepository.delete(idioma);
    }

    /** Edição administrativa: mesmos campos da edição comum, sem exigir propriedade. */
    @Transactional
    public Idioma editarComoAdmin(Long id, IdiomaRequest dto) {
        Idioma idioma = idiomaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));
        aplicarEdicao(idioma, dto);
        Idioma salvo = idiomaRepository.save(idioma);
        Hibernate.initialize(salvo.getCriador());
        return salvo;
    }

    /**
     * Remove registros que referenciam o idioma antes da exclusão, evitando
     * violação de chave estrangeira: avaliações são apagadas e denúncias são
     * apenas desvinculadas (o histórico de moderação é preservado).
     */
    private void removerVinculosDoIdioma(Long id) {
        avaliacaoRepository.deleteByIdiomaId(id);
        List<Denuncia> denuncias = denunciaRepository.findByIdiomaId(id);
        denuncias.forEach(d -> d.setIdioma(null));
        denunciaRepository.saveAll(denuncias);
        idiomaUsuarioRepository.deleteByIdiomaId(id);
    }

    /**
     * Importa um idioma público realizando uma <b>cópia profunda e independente</b>:
     * cria um novo {@link Idioma} (com novos IDs) pertencente ao usuário que importa
     * e duplica todos os módulos e frases. O idioma original não é alterado e o clone
     * não compartilha nenhuma referência com ele — alterações em um não afetam o outro.
     *
     * <p>Validações: usuário autenticado, idioma existente, visibilidade pública,
     * limite de {@value #LIMITE_IDIOMAS_POR_USUARIO} idiomas por usuário e proibição
     * de importar o próprio idioma.</p>
     *
     * @return o idioma recém-criado (a cópia).
     */
    @Transactional
    public Idioma importar(Long usuarioId, Long idiomaOriginalId, Usuario usuario) {
        int count = idiomaUsuarioRepository.countByUsuarioId(usuarioId);
        if (count >= LIMITE_IDIOMAS_POR_USUARIO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Limite máximo de " + LIMITE_IDIOMAS_POR_USUARIO + " idiomas atingido");
        }

        Idioma original = idiomaRepository.findById(idiomaOriginalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idioma não encontrado"));

        if (original.getVisibilidade() != Idioma.Visibilidade.PUBLICO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Este idioma não está disponível para importação");
        }

        boolean ehProprietario = original.getCriador() != null
                && original.getCriador().getId().equals(usuarioId);
        if (ehProprietario) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Você não pode importar um idioma do qual já é proprietário");
        }

        // 1. Clona o idioma — novos IDs, novo proprietário, avaliações zeradas
        //    (as avaliações pertencem ao idioma original e não são transferidas).
        Idioma copia = Idioma.builder()
                .nome(original.getNome())
                .idioma(original.getIdioma())
                .bandeira(original.getBandeira())
                .descricao(original.getDescricao())
                .criador(usuario)
                .proficiencia(original.getProficiencia())
                .visibilidade(original.getVisibilidade())
                .modulos(0)
                .avaliacao(0)
                .totalAvaliacoes(0)
                .build();
        copia = idiomaRepository.save(copia);

        // 2. Clona cada módulo e, dentro dele, cada frase — todos com novos IDs
        //    e vinculados exclusivamente à cópia.
        List<Modulo> modulosOriginais = moduloRepository.findByIdiomaId(idiomaOriginalId);
        for (Modulo moduloOriginal : modulosOriginais) {
            Modulo moduloCopia = moduloRepository.save(Modulo.builder()
                    .nome(moduloOriginal.getNome())
                    .icone(moduloOriginal.getIcone())
                    .idioma(copia)
                    .build());

            for (Frase fraseOriginal : fraseRepository.findByModuloIdOrderByIdAsc(moduloOriginal.getId())) {
                fraseRepository.save(Frase.builder()
                        .modo(fraseOriginal.getModo())
                        .traducaoCompleta(fraseOriginal.getTraducaoCompleta())
                        .traducoesAlternativasJson(fraseOriginal.getTraducoesAlternativasJson())
                        .palavrasJson(fraseOriginal.getPalavrasJson())
                        .imagem(fraseOriginal.getImagem())
                        .observacoes(fraseOriginal.getObservacoes())
                        .linksJson(fraseOriginal.getLinksJson())
                        .paresJson(fraseOriginal.getParesJson())
                        .pergunta(fraseOriginal.getPergunta())
                        .alternativasJson(fraseOriginal.getAlternativasJson())
                        .respostaCorreta(fraseOriginal.getRespostaCorreta())
                        .imagemQuiz(fraseOriginal.getImagemQuiz())
                        .videoQuiz(fraseOriginal.getVideoQuiz())
                        .modulo(moduloCopia)
                        .build());
            }
        }

        // 3. Persiste a contagem de módulos na cópia
        copia.setModulos(modulosOriginais.size());
        copia = idiomaRepository.save(copia);

        // 4. Vincula a cópia ao usuário (conta para o limite e para "meus idiomas")
        idiomaUsuarioRepository.save(IdiomaUsuario.builder()
                .usuario(usuario)
                .idioma(copia)
                .build());

        return copia;
    }

    @Transactional(readOnly = true)
    public List<Idioma> getIdiomasDoUsuario(Long usuarioId) {
        List<IdiomaUsuario> relacoes = idiomaUsuarioRepository.findByUsuarioIdFetchIdioma(usuarioId);
        List<Idioma> idiomas = relacoes.stream()
                .map(IdiomaUsuario::getIdioma)
                .toList();
        atualizarContagemModulos(idiomas);
        return idiomas;
    }

    /**
     * Recalcula e persiste a contagem de módulos de um idioma a partir dos
     * registros reais no banco. Usado após criação/exclusão de módulos para
     * manter o campo {@code modulos} sempre sincronizado.
     */
    @Transactional
    public void sincronizarContagemModulos(Long idiomaId) {
        idiomaRepository.findById(idiomaId).ifPresent(idioma -> {
            idioma.setModulos(moduloRepository.countByIdiomaId(idiomaId));
            idiomaRepository.save(idioma);
        });
    }

    /**
     * Ajusta o campo {@code modulos} de cada idioma para refletir a contagem
     * real de módulos cadastrados. Garante consistência mesmo para registros
     * cuja contagem persistida tenha ficado defasada.
     */
    private void atualizarContagemModulos(List<Idioma> idiomas) {
        idiomas.forEach(this::atualizarContagemModulos);
    }

    private void atualizarContagemModulos(Idioma idioma) {
        if (idioma != null && idioma.getId() != null) {
            idioma.setModulos(moduloRepository.countByIdiomaId(idioma.getId()));
        }
    }
}
