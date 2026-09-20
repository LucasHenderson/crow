package com.crow.api.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Ação de moderação sobre o status de uma conta
 * (PUT /api/admin/usuarios/{codigo}/status).
 *
 * <ul>
 *   <li><b>DESATIVAR</b> — desativação por tempo indeterminado: a conta só
 *       volta a ficar ativa por ação manual do administrador.</li>
 *   <li><b>SUSPENDER</b> — suspensão temporária: exige {@code reativacaoEm}
 *       no futuro; ao atingir esse instante a conta é reativada sozinha.</li>
 *   <li><b>REATIVAR</b> — devolve a conta ao status ativo.</li>
 * </ul>
 *
 * <p>Papel e senha não fazem parte deste DTO de propósito: nenhuma rota
 * administrativa altera esses campos, e qualquer outro campo enviado no JSON
 * é ignorado na desserialização.</p>
 */
public record AlterarStatusUsuarioRequest(
    /** DESATIVAR, SUSPENDER ou REATIVAR — sem distinção de maiúsculas. */
    @NotBlank String acao,
    /** Justificativa da decisão, opcional. Vai para o e-mail, o log e o cadastro do usuário. */
    @Size(max = 1000) String justificativa,
    /** Data e hora do fim da suspensão. Obrigatória em SUSPENDER, não aceita nas demais ações. */
    LocalDateTime reativacaoEm
) {

    public enum Acao {
        DESATIVAR, SUSPENDER, REATIVAR
    }
}
