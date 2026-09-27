export interface Usuario {
  codigo: string;
  nome: string;
  email: string;
  telefone: string;
  dataEntrada: string;
  status?: 'ativo' | 'inativo';
  role?: 'comum' | 'admin';
}

/**
 * Projeção pública devolvida por /usuarios e /usuarios/buscar
 * (UsuarioPublicoResponse no backend): sem email, telefone, papel ou status.
 */
export interface UsuarioBusca {
  codigo: string;
  nome: string;
  dataEntrada: Date;
  quantidadeIdiomas: number; // 0 a 4, contando apenas idiomas públicos
}

/**
 * Tela de onde o perfil público foi aberto. Quando é `visualizar-idioma`, a
 * URL também carrega `idioma` (código) e `origemIdioma`, para o Voltar
 * devolver o usuário ao idioma com a mesma origem que ele tinha — sem
 * depender do histórico do navegador, que gerava pingue-pongue entre as duas
 * telas.
 */
export type OrigemUsuario = 'buscar-usuario' | 'visualizar-idioma';

/** Valida o query param recebido; qualquer valor desconhecido vira `buscar-usuario`. */
export function normalizarOrigemUsuario(valor: string | null | undefined): OrigemUsuario {
  return valor === 'visualizar-idioma' ? valor : 'buscar-usuario';
}

/** Perfil público de outro usuário (/usuarios/{codigo}). */
export interface UsuarioVisualizar {
  codigo: string;
  nome: string;
  dataEntrada: Date;
}

/**
 * Projeção servida à área administrativa (/admin/usuarios) —
 * UsuarioModeracaoResponse no backend. Somente leitura: o administrador
 * modera contas, não edita cadastro; por isso não traz telefone nem senha.
 */
export interface UsuarioModeracao {
  codigo: string;
  nome: string;
  email: string;
  dataEntrada: string;
  status: 'ativo' | 'inativo';
  role: 'comum' | 'admin';
  /** Total de idiomas do usuário, públicos e privados. */
  quantidadeIdiomas: number;
  /**
   * Fim da suspensão temporária (ISO local, sem fuso); nulo quando a conta
   * está ativa ou desativada por tempo indeterminado.
   */
  suspensoAte: string | null;
  /** Justificativa da última ação de moderação, quando informada. */
  motivoStatus: string | null;
  /** Momento da última ação de moderação sobre o status (ISO local). */
  statusAlteradoEm: string | null;
}

/** Ações aceitas por PUT /admin/usuarios/{codigo}/status (AlterarStatusUsuarioRequest no backend). */
export type AcaoStatusUsuario = 'DESATIVAR' | 'SUSPENDER' | 'REATIVAR';

/**
 * Corpo de PUT /admin/usuarios/{codigo}/status.
 * - DESATIVAR: por tempo indeterminado, só volta por reativação manual.
 * - SUSPENDER: exige `reativacaoEm` no futuro; a conta volta sozinha nesse instante.
 * - REATIVAR: encerra desativação ou suspensão.
 * A justificativa é opcional; se preenchida, vai no e-mail enviado ao usuário.
 */
export interface AlterarStatusUsuario {
  acao: AcaoStatusUsuario;
  justificativa?: string;
  /** Data e hora locais no formato ISO (yyyy-MM-ddTHH:mm:ss). Só em SUSPENDER. */
  reativacaoEm?: string;
}

/**
 * Corpo de POST /admin/usuarios/{codigo}/email (EnviarEmailUsuarioRequest no backend).
 * Os dois campos são obrigatórios; o backend recusa contas administrativas como destino.
 */
export interface EnviarEmailUsuario {
  /** Até 150 caracteres. Chega ao usuário com o prefixo "Crow - ". */
  assunto: string;
  /** Até 5000 caracteres. Vai entre a saudação e a assinatura padrão do e-mail. */
  mensagem: string;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  aceitouTermos: boolean;
}
