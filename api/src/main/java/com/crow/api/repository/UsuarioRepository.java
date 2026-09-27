package com.crow.api.repository;

import com.crow.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Busca pelo identificador público (codigo), usado nas rotas no lugar do id. */
    Optional<Usuario> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    /** Registros anteriores à criação da coluna — preenchidos pelo backfill. */
    List<Usuario> findByCodigoIsNull();

    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);

    /** Listagens públicas: contas administrativas ficam de fora. */
    List<Usuario> findByRoleNot(Usuario.Role role);
    List<Usuario> findByRoleNotAndNomeContainingIgnoreCase(Usuario.Role role, String nome);

    /** Contas cuja suspensão temporária já venceu — candidatas à reativação automática. */
    List<Usuario> findByStatusAndSuspensoAteLessThanEqual(Usuario.Status status, LocalDateTime instante);
}
