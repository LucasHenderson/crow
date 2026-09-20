package com.crow.api.dto.frase;

import java.util.List;

/**
 * Ids das frases de um módulo na nova ordem desejada. A validação (lista não
 * vazia, completa, sem repetições e só com ids do módulo) fica no service, para
 * que a mensagem de erro que chega ao frontend seja específica.
 */
public record ReordenarFrasesRequest(
    List<Long> ids
) {}
