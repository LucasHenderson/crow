package com.crow.api.dto.modulo;

import java.util.List;

/**
 * Ids dos módulos de um idioma na nova ordem desejada. A validação (lista não
 * vazia, completa, sem repetições e só com ids do idioma) fica no service, para
 * que a mensagem de erro que chega ao frontend seja específica.
 */
public record ReordenarModulosRequest(
    List<Long> ids
) {}
