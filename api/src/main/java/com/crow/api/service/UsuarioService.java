package com.crow.api.service;

import com.crow.api.dto.usuario.UsuarioModeracaoResponse;
import com.crow.api.dto.usuario.UsuarioPublicoResponse;
import com.crow.api.dto.usuario.UsuarioUpdateRequest;
import com.crow.api.entity.Idioma;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.IdiomaUsuarioRepository;
import com.crow.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final IdiomaUsuarioRepository idiomaUsuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public Usuario buscarPorCodigo(String codigo) {
        return usuarioRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    /**
     * Contas sujeitas à moderação — usada por /api/admin/usuarios. Contas com
     * papel ADMIN ficam de fora: administradores não gerenciam uns aos outros.
     */
    public List<Usuario> buscarModeraveis() {
        return usuarioRepository.findByRoleNot(Usuario.Role.ADMIN);
    }

    /**
     * Listagem usada pelas telas públicas (busca de usuários): contas com papel
     * ADMIN não aparecem. A área administrativa usa {@link #buscarModeraveis()}
     * através de /api/admin/usuarios.
     */
    public List<Usuario> buscarPublicos(String termo) {
        return (termo == null || termo.isBlank())
                ? usuarioRepository.findByRoleNot(Usuario.Role.ADMIN)
                : usuarioRepository.findByRoleNotAndNomeContainingIgnoreCase(Usuario.Role.ADMIN, termo);
    }

    /** Quantidade de idiomas do usuário visíveis para os demais (só PUBLICO). */
    public int contarIdiomasPublicos(Long usuarioId) {
        return idiomaUsuarioRepository
                .countByUsuarioIdAndIdioma_Visibilidade(usuarioId, Idioma.Visibilidade.PUBLICO);
    }

    /**
     * Converte para a projeção pública — sem email, telefone, papel ou status.
     * Usada em todas as respostas que não sejam do próprio usuário ou do admin.
     */
    public UsuarioPublicoResponse toPublicoResponse(Usuario usuario) {
        return new UsuarioPublicoResponse(
                usuario.getCodigo(),
                usuario.getNome(),
                usuario.getDataEntrada() != null
                        ? usuario.getDataEntrada().format(DateTimeFormatter.ISO_LOCAL_DATE)
                        : null,
                contarIdiomasPublicos(usuario.getId())
        );
    }

    /**
     * Converte para a projeção da área administrativa — sem senha e sem
     * telefone. A contagem inclui idiomas privados, já que o moderador precisa
     * enxergar tudo o que o usuário mantém.
     */
    public UsuarioModeracaoResponse toModeracaoResponse(Usuario usuario) {
        return new UsuarioModeracaoResponse(
                usuario.getCodigo(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getDataEntrada() != null
                        ? usuario.getDataEntrada().format(DateTimeFormatter.ISO_LOCAL_DATE)
                        : null,
                usuario.getStatus().name().toLowerCase(),
                usuario.getRole().name().toLowerCase(),
                idiomaUsuarioRepository.countByUsuarioId(usuario.getId()),
                formatarIso(usuario.getSuspensoAte()),
                usuario.getMotivoStatus(),
                formatarIso(usuario.getStatusAlteradoEm())
        );
    }

    private static String formatarIso(LocalDateTime dataHora) {
        return dataHora != null ? dataHora.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
    }

    public Usuario atualizarPerfil(Long id, UsuarioUpdateRequest dto) {
        Usuario usuario = buscarPorId(id);

        if (dto.nome() != null && !dto.nome().isBlank()) {
            usuario.setNome(dto.nome());
        }
        if (dto.email() != null && !dto.email().isBlank()) {
            if (!dto.email().equals(usuario.getEmail()) && usuarioRepository.existsByEmail(dto.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
            }
            usuario.setEmail(dto.email());
        }
        if (dto.telefone() != null) {
            usuario.setTelefone(dto.telefone());
        }

        return usuarioRepository.save(usuario);
    }

    public void alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarPorId(id);

        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    // === Moderação de status ===

    /**
     * Desativação por tempo indeterminado: a conta fica INATIVO sem prazo e só
     * volta a ATIVO por {@link #reativar}. Também serve para converter uma
     * suspensão temporária em desativação definitiva.
     */
    public Usuario desativar(Long id, String justificativa) {
        Usuario usuario = buscarPorId(id);
        exigirNaoAdmin(usuario);
        if (usuario.getStatus() == Usuario.Status.INATIVO && usuario.getSuspensoAte() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conta já está desativada");
        }
        return aplicarStatus(usuario, Usuario.Status.INATIVO, null, justificativa);
    }

    /**
     * Suspensão temporária: a conta fica INATIVO até {@code reativacaoEm}, quando
     * a reativação automática ({@link #reativarSuspensaoVencida}) a devolve a
     * ATIVO. Aplicada sobre uma conta já suspensa, apenas redefine o prazo.
     */
    public Usuario suspender(Long id, String justificativa, LocalDateTime reativacaoEm) {
        if (reativacaoEm == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Informe a data e hora de reativação da suspensão");
        }
        if (!reativacaoEm.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data de reativação precisa estar no futuro");
        }
        Usuario usuario = buscarPorId(id);
        exigirNaoAdmin(usuario);
        return aplicarStatus(usuario, Usuario.Status.INATIVO, reativacaoEm, justificativa);
    }

    /** Reativação manual pelo administrador — encerra tanto a desativação quanto a suspensão. */
    public Usuario reativar(Long id, String justificativa) {
        Usuario usuario = buscarPorId(id);
        if (usuario.getStatus() == Usuario.Status.ATIVO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conta já está ativa");
        }
        return aplicarStatus(usuario, Usuario.Status.ATIVO, null, justificativa);
    }

    /** Contas cuja suspensão temporária já venceu, na ordem em que o banco as devolve. */
    public List<Usuario> buscarSuspensoesVencidas() {
        return usuarioRepository.findByStatusAndSuspensoAteLessThanEqual(
                Usuario.Status.INATIVO, LocalDateTime.now());
    }

    /**
     * Reativação automática de uma suspensão vencida, usada pelo agendador.
     * Reconfere a condição dentro da transação — entre a listagem e este ponto
     * um administrador pode ter reativado ou desativado a conta — e devolve
     * vazio quando não há mais o que fazer, para que nenhum aviso seja enviado
     * indevidamente.
     */
    @Transactional
    public Optional<Usuario> reativarSuspensaoVencida(Long id) {
        Usuario usuario = buscarPorId(id);
        boolean vencida = usuario.getStatus() == Usuario.Status.INATIVO
                && usuario.getSuspensoAte() != null
                && !usuario.getSuspensoAte().isAfter(LocalDateTime.now());
        if (!vencida) {
            return Optional.empty();
        }
        return Optional.of(aplicarStatus(usuario, Usuario.Status.ATIVO, null, null));
    }

    /** Única escrita de status: mantém os quatro campos sempre coerentes entre si. */
    private Usuario aplicarStatus(Usuario usuario, Usuario.Status status,
                                  LocalDateTime suspensoAte, String justificativa) {
        usuario.setStatus(status);
        usuario.setSuspensoAte(suspensoAte);
        usuario.setMotivoStatus(justificativa != null && !justificativa.isBlank()
                ? justificativa.trim()
                : null);
        usuario.setStatusAlteradoEm(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }

    /**
     * Contas administrativas não podem ser desativadas nem suspensas. O
     * controller já recusa (e registra) a tentativa antes de chegar aqui; esta
     * checagem garante a regra para qualquer outro chamador.
     */
    private void exigirNaoAdmin(Usuario usuario) {
        if (usuario.getRole() == Usuario.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Contas administrativas não estão sujeitas à moderação");
        }
    }

    public boolean emailCadastrado(String email) {
        if (email == null || email.isBlank()) return false;
        return usuarioRepository.existsByEmail(email);
    }

    public void redefinirSenha(String email, String novaSenha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }
}
