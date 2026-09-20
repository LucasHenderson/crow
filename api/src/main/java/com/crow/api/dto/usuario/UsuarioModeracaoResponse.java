package com.crow.api.dto.usuario;

/**
 * Projeção de usuário servida à área administrativa (listagem, consulta e
 * alteração de status). É somente leitura e nunca carrega senha nem telefone:
 * o administrador modera contas, não edita dados cadastrais.
 */
public record UsuarioModeracaoResponse(
    // TODO Fase 21: remover o id numérico — mantido apenas enquanto o frontend depende dele
    Long id,
    String codigo,
    String nome,
    String email,
    String dataEntrada,
    String status,
    String role,
    /** Total de idiomas do usuário, públicos e privados. */
    int quantidadeIdiomas,
    /** Fim da suspensão temporária (ISO); nulo quando ativa ou desativada por tempo indeterminado. */
    String suspensoAte,
    /** Justificativa da última ação de moderação, quando informada. */
    String motivoStatus,
    /** Momento da última ação de moderação sobre o status (ISO). */
    String statusAlteradoEm
) {}
