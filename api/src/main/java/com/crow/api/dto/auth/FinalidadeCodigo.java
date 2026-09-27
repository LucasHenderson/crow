package com.crow.api.dto.auth;

/**
 * Para que o código enviado por e-mail será usado. Muda apenas o texto do
 * e-mail: o código, a validade e a verificação são os mesmos em todos os fluxos.
 */
public enum FinalidadeCodigo {

    /**
     * Confirmar um endereço de e-mail — no cadastro ou na troca de e-mail do
     * perfil. É o padrão quando o front não informa a finalidade.
     */
    VERIFICACAO_EMAIL,

    /** Recuperar o acesso pela tela "Esqueci minha senha". */
    REDEFINICAO_SENHA
}
