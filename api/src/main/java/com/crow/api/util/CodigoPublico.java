package com.crow.api.util;

import java.security.SecureRandom;

/**
 * Gera os identificadores públicos das entidades expostas pela API.
 *
 * <p>O formato é {@code PREFIXO-XXXXXXXXXXXX}, com 12 caracteres hexadecimais
 * maiúsculos sorteados por {@link SecureRandom} (48 bits). O objetivo é não
 * expor o {@code id} sequencial do banco em rotas e respostas — o código é
 * aleatório e persistido, nunca derivado do id.</p>
 */
public final class CodigoPublico {

    public static final String PREFIXO_USUARIO = "USR";
    public static final String PREFIXO_IDIOMA = "IDM";
    public static final String PREFIXO_DENUNCIA = "DEN";

    /** 6 bytes = 12 caracteres hexadecimais. */
    private static final int BYTES = 6;

    private static final SecureRandom RANDOM = new SecureRandom();

    private CodigoPublico() {
    }

    public static String gerar(String prefixo) {
        byte[] bytes = new byte[BYTES];
        RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder(prefixo.length() + 1 + BYTES * 2);
        sb.append(prefixo).append('-');
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    /**
     * Indica se a referência recebida na rota ainda é um id numérico.
     * Usado apenas pela compatibilidade temporária dos controllers.
     */
    public static boolean ehNumerico(String referencia) {
        return referencia != null
                && !referencia.isEmpty()
                && referencia.chars().allMatch(Character::isDigit);
    }
}
