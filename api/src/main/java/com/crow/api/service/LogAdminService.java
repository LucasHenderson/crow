package com.crow.api.service;

import com.crow.api.entity.Idioma;
import com.crow.api.entity.LogAdmin;
import com.crow.api.entity.Usuario;
import com.crow.api.repository.LogAdminRepository;
import com.crow.api.util.EmailTemplates;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Registro de ações administrativas em formato padronizado.
 *
 * <p><b>{@code acao}</b>: verbo no passado + objeto — "Suspendeu conta de
 * usuário", "Excluiu idioma", "Alterou status de denúncia". Tentativas
 * recusadas começam com {@link #PREFIXO_TENTATIVA} ("Tentou consultar conta
 * administrativa").</p>
 *
 * <p><b>{@code detalhes}</b>: pares {@code chave: valor} separados por
 * {@link #SEPARADOR_DETALHES} — "modalidade: temporária; reativação prevista:
 * 12/09/2026 às 14:30; justificativa: spam". Valores nulos ou em branco são
 * omitidos; quebras de linha viram espaço e ";" vira "," dentro do valor, para
 * o separador continuar confiável.</p>
 *
 * <p>Quem foi afetado (usuário e/ou idioma) vai em colunas próprias de
 * {@link LogAdmin}, não no texto. Os chamadores montam um {@link Registro} e
 * entregam a um dos métodos {@code registrar*}; ninguém concatena texto.</p>
 */
@Service
@RequiredArgsConstructor
public class LogAdminService {

    /** Prefixo do campo {@code acao} nas tentativas recusadas. */
    public static final String PREFIXO_TENTATIVA = "Tentou ";

    /** Prefixo usado antes desta padronização — só para reconhecer registros históricos. */
    public static final String PREFIXO_BLOQUEIO_LEGADO = "Tentativa bloqueada: ";

    public static final String SEPARADOR_DETALHES = "; ";

    /** Tamanhos das colunas de {@link LogAdmin} — textos maiores são cortados, nunca recusados. */
    private static final int LIMITE_ACAO = 200;
    private static final int LIMITE_DETALHES = 1000;
    private static final String RETICENCIAS = "…";

    private final LogAdminRepository logAdminRepository;

    /**
     * Registra uma ação administrativa concluída. {@code acao} e
     * {@code detalhes} são cortados no tamanho da coluna: o log é escrito
     * depois de a ação já ter acontecido, então uma justificativa longa não
     * pode transformar um sucesso em erro 500.
     */
    public LogAdmin registrar(Registro registro) {
        return logAdminRepository.save(registro.montar());
    }

    /**
     * Registra uma ação que foi recusada (por exemplo, um admin tentando
     * alterar conteúdo de outro usuário ou moderar uma conta administrativa).
     * O {@code acao} do registro deve vir no infinitivo + objeto ("consultar
     * conta administrativa"); aqui ele ganha o prefixo "Tentou " e o detalhe
     * {@code resultado: bloqueada} entra na frente dos demais.
     *
     * <p>Roda em transação própria ({@code REQUIRES_NEW}) porque quem chama
     * lança uma exceção logo em seguida para responder 403/400 — se o registro
     * participasse da transação do chamador, o rollback apagaria o log junto.</p>
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public LogAdmin registrarTentativaBloqueada(Registro registro) {
        registro.acao = PREFIXO_TENTATIVA + registro.acao;
        registro.detalheNaFrente("resultado", "bloqueada");
        return registrar(registro);
    }

    /**
     * Registra uma ação executada pelo próprio sistema, sem administrador
     * responsável — por exemplo, a reativação de uma conta cuja suspensão
     * venceu. O {@code admin} é forçado a nulo, que é como a listagem
     * reconhece a origem automática; {@code origem: sistema} entra nos
     * detalhes para o texto também dizer isso.
     */
    public LogAdmin registrarAcaoSistema(Registro registro) {
        registro.admin = null;
        registro.detalheNaFrente("origem", "sistema");
        return registrar(registro);
    }

    public List<LogAdmin> listarTodos() {
        return logAdminRepository.findAllComAdmin();
    }

    /** Ponto de partida de todo registro: quem fez, em que domínio e o quê. */
    public static Registro registro(Usuario admin, LogAdmin.TipoLog tipo, String acao) {
        return new Registro(admin, tipo, acao);
    }

    /** Registro sem administrador — ver {@link #registrarAcaoSistema}. */
    public static Registro registroSistema(LogAdmin.TipoLog tipo, String acao) {
        return new Registro(null, tipo, acao);
    }

    /**
     * Dados estruturados de um log. Os detalhes são acrescentados na ordem em
     * que forem informados; {@link #montar()} produz a entidade já no formato
     * padronizado e nos limites das colunas.
     */
    public static final class Registro {

        private Usuario admin;
        private final LogAdmin.TipoLog tipo;
        private String acao;
        private Usuario usuarioAfetado;
        private Long idiomaAfetadoId;
        private String idiomaAfetadoNome;
        private String idiomaAfetadoCodigo;
        private final Map<String, String> detalhes = new LinkedHashMap<>();

        private Registro(Usuario admin, LogAdmin.TipoLog tipo, String acao) {
            this.admin = admin;
            this.tipo = tipo;
            this.acao = acao;
        }

        public Registro usuarioAfetado(Usuario usuario) {
            this.usuarioAfetado = usuario;
            return this;
        }

        /** Idioma ainda existente — nome, código e id são copiados na hora. */
        public Registro idiomaAfetado(Idioma idioma) {
            if (idioma == null) {
                return this;
            }
            return idiomaAfetado(idioma.getId(), idioma.getNome(), idioma.getCodigo());
        }

        /** Idioma já excluído — o chamador guardou os dados antes da exclusão. */
        public Registro idiomaAfetado(Long id, String nome, String codigo) {
            this.idiomaAfetadoId = id;
            this.idiomaAfetadoNome = nome;
            this.idiomaAfetadoCodigo = codigo;
            return this;
        }

        /** Acrescenta um par; nulo ou em branco é ignorado. */
        public Registro detalhe(String chave, Object valor) {
            String texto = normalizar(valor);
            if (texto != null) {
                detalhes.put(chave, texto);
            }
            return this;
        }

        /** Data/hora no mesmo formato dos e-mails ("12/09/2026 às 14:30"). */
        public Registro detalhe(String chave, LocalDateTime valor) {
            return detalhe(chave, (Object) (valor != null ? EmailTemplates.FORMATO_DATA.format(valor) : null));
        }

        /** Só acrescenta quando a condição vale — evita {@code if} no chamador. */
        public Registro detalheSe(boolean condicao, String chave, Object valor) {
            return condicao ? detalhe(chave, valor) : this;
        }

        private void detalheNaFrente(String chave, String valor) {
            Map<String, String> copia = new LinkedHashMap<>(detalhes);
            detalhes.clear();
            detalhes.put(chave, valor);
            detalhes.putAll(copia);
        }

        LogAdmin montar() {
            return LogAdmin.builder()
                    .admin(admin)
                    .tipo(tipo)
                    .acao(limitar(acao, LIMITE_ACAO))
                    .detalhes(limitar(montarDetalhes(detalhes), LIMITE_DETALHES))
                    .usuarioAfetado(usuarioAfetado)
                    .usuarioAfetadoNome(usuarioAfetado != null ? usuarioAfetado.getNome() : null)
                    .usuarioAfetadoCodigo(usuarioAfetado != null ? usuarioAfetado.getCodigo() : null)
                    .idiomaAfetadoId(idiomaAfetadoId)
                    .idiomaAfetadoNome(idiomaAfetadoNome)
                    .idiomaAfetadoCodigo(idiomaAfetadoCodigo)
                    .build();
        }
    }

    /** "chave: valor; chave: valor" — nulo quando não há pares. */
    static String montarDetalhes(Map<String, String> pares) {
        if (pares.isEmpty()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        pares.forEach((chave, valor) -> {
            if (sb.length() > 0) {
                sb.append(SEPARADOR_DETALHES);
            }
            sb.append(chave).append(": ").append(valor);
        });
        return sb.toString();
    }

    /** Uma linha só, sem o separador de pares dentro do valor. */
    private static String normalizar(Object valor) {
        if (valor == null) {
            return null;
        }
        String texto = valor.toString().trim().replaceAll("\\s+", " ").replace(';', ',');
        return texto.isEmpty() ? null : texto;
    }

    private static String limitar(String texto, int limite) {
        if (texto == null || texto.length() <= limite) {
            return texto;
        }
        return texto.substring(0, limite - RETICENCIAS.length()) + RETICENCIAS;
    }
}
