export interface Denuncia {
  id: number;
  codigo: string;
  idiomaId: number;
  codigoIdioma: string;
  idiomaNome: string;
  usuarioId: number;
  codigoUsuario: string;
  usuarioNome: string;
  data: string;
  tipos: string[];
  descricao?: string;
  status: 'pendente' | 'analisando' | 'resolvida' | 'rejeitada';
  responsavelId?: number;
  codigoResponsavel?: string;
  responsavelNome?: string;
}
