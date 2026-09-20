package com.crow.api.dto.modulo;

import com.crow.api.entity.Modulo;

import java.time.format.DateTimeFormatter;

public record ModuloResponse(
    Long id,
    String codigo,
    String nome,
    String icone,
    Integer ordem,
    int frases,
    String criadoEm,
    String atualizadoEm
) {

    /** @param frases quantidade de frases do módulo (contada fora, pelo chamador). */
    public static ModuloResponse from(Modulo modulo, int frases) {
        return new ModuloResponse(
                modulo.getId(),
                "MOD-" + modulo.getId(),
                modulo.getNome(),
                modulo.getIcone(),
                modulo.getOrdem(),
                frases,
                modulo.getCriadoEm() != null
                        ? modulo.getCriadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null,
                modulo.getAtualizadoEm() != null
                        ? modulo.getAtualizadoEm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null
        );
    }
}
