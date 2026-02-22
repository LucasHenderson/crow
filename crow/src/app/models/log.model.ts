export interface Log {
  id: number;
  codigo: string;
  data: string;
  adminId: number;
  codigoAdmin: string;
  adminNome: string;
  acao: string;
  detalhes: string;
  tipo: 'denuncia' | 'usuario' | 'idioma';
}
