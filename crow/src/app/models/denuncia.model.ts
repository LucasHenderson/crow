export interface Denuncia {
  id: number;
  idiomaId: string;
  idiomaNome: string;
  usuarioId: string;
  usuarioNome: string;
  data: string;
  tipos: string[];
  descricao?: string;
  status: 'pendente' | 'analisando' | 'resolvida' | 'rejeitada';
  responsavelId?: string;
  responsavelNome?: string;
}
