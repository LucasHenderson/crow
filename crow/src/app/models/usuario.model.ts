export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataEntrada: string;
  status?: 'ativo' | 'inativo';
  role?: 'comum' | 'admin';
}

export interface UsuarioBusca {
  id: string;
  nome: string;
  email: string;
  dataEntrada: Date;
  quantidadeIdiomas: number; // 0 a 4
}

export interface UsuarioVisualizar {
  id: string;
  nome: string;
  email: string;
  dataEntrada: Date;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  aceitouTermos: boolean;
}
