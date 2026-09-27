export type TipoLog = 'denuncia' | 'usuario' | 'idioma' | 'moderacao' | 'email';

/** Retrato de quem foi afetado pela ação, como estava na hora do registro. */
export interface EntidadeAfetadaLog {
  codigo: string | null;
  nome: string | null;
}

export interface Log {
  codigo: string;
  data: string;
  /** Nulos quando a ação foi do próprio sistema (`acaoSistema`). */
  codigoAdmin: string | null;
  adminNome: string | null;
  /** Executada pelo sistema, sem administrador (ex.: reativação agendada). */
  acaoSistema: boolean;
  /** Tentativa recusada pelo backend, registrada para auditoria. */
  bloqueada: boolean;
  acao: string;
  /** Pares "chave: valor" separados por "; " (registros antigos têm texto livre). */
  detalhes: string | null;
  tipo: TipoLog;
  usuarioAfetado: EntidadeAfetadaLog | null;
  idiomaAfetado: EntidadeAfetadaLog | null;
}
