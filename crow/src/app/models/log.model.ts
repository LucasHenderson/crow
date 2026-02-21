export interface Log {
  id: string;
  data: string;
  adminId: string;
  adminNome: string;
  acao: string;
  detalhes: string;
  tipo: 'denuncia' | 'usuario' | 'idioma';
}
