package com.crow.api.util;

/**
 * Corpo de um e-mail nas duas versões enviadas juntas (multipart/alternative):
 * o cliente de e-mail exibe o HTML e recorre ao texto puro quando não
 * renderiza HTML.
 */
public record CorpoEmail(String texto, String html) {
}
