package com.crow.api.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Regras comuns de posicionamento de itens irmãos — módulos dentro de um idioma
 * e frases dentro de um módulo. A posição é sempre a sequência 1..n sem buracos.
 */
public final class Reordenacao {

    private Reordenacao() {
    }

    /**
     * Valida a lista de ids recebida do cliente contra os itens existentes e
     * grava as posições 1..n na ordem informada.
     *
     * <p>Recusa com 400: lista vazia, ids repetidos, quantidade diferente da
     * existente (lista incompleta ou com itens a mais) e ids que não pertencem
     * ao pai informado.</p>
     *
     * @param existentes todos os irmãos atualmente cadastrados no pai
     * @param idsOrdenados ids na nova ordem desejada
     * @param extrairId como obter o id de um item
     * @param definirOrdem como gravar a posição em um item
     * @param escopo descrição usada nas mensagens de erro, <b>com artigo</b>,
     *               ex. "os módulos deste idioma" / "as frases deste módulo"
     * @return os itens na nova ordem, já com a posição atribuída
     */
    public static <T> List<T> aplicar(List<T> existentes,
                                      List<Long> idsOrdenados,
                                      Function<T, Long> extrairId,
                                      BiConsumer<T, Integer> definirOrdem,
                                      String escopo) {
        if (idsOrdenados == null || idsOrdenados.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Informe a lista ordenada com " + escopo);
        }

        Set<Long> unicos = new HashSet<>(idsOrdenados);
        if (unicos.size() != idsOrdenados.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A lista contém ids repetidos");
        }

        if (idsOrdenados.size() != existentes.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A lista precisa conter " + escopo + " por completo: "
                            + existentes.size() + " esperado(s), "
                            + idsOrdenados.size() + " recebido(s)");
        }

        Map<Long, T> porId = existentes.stream()
                .collect(Collectors.toMap(extrairId, item -> item));

        List<T> naNovaOrdem = new ArrayList<>(existentes.size());
        int posicao = 1;
        for (Long id : idsOrdenados) {
            T item = porId.get(id);
            if (item == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "O id " + id + " não está entre " + escopo);
            }
            definirOrdem.accept(item, posicao++);
            naNovaOrdem.add(item);
        }
        return naNovaOrdem;
    }

    /**
     * Reescreve as posições da lista como 1..n na ordem em que ela está — usado
     * para fechar buracos depois de uma exclusão.
     *
     * @return apenas os itens cuja posição mudou, para que a gravação não toque
     *         em registros que já estavam na posição correta.
     */
    public static <T> List<T> renumerar(List<T> itens,
                                        Function<T, Integer> extrairOrdem,
                                        BiConsumer<T, Integer> definirOrdem) {
        List<T> alterados = new ArrayList<>();
        int posicao = 1;
        for (T item : itens) {
            if (!Integer.valueOf(posicao).equals(extrairOrdem.apply(item))) {
                definirOrdem.accept(item, posicao);
                alterados.add(item);
            }
            posicao++;
        }
        return alterados;
    }

    /** Próxima posição livre a partir da maior já usada (nula quando não há itens). */
    public static int proximaPosicao(Integer maiorOrdemAtual) {
        return maiorOrdemAtual == null ? 1 : maiorOrdemAtual + 1;
    }
}
