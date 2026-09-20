export interface Usuario {
  id: number;
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
  id: number;
  codigo: string;
  nome: string;
  email: string;
  dataEntrada: string;
  status: 'ativo' | 'inativo';
  role: 'comum' | 'admin';
  /** Total de idiomas do usuário, públicos e privados. */
  quantidadeIdiomas: number;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  aceitouTermos: boolean;
}
