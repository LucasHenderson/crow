export interface Denuncia {
  codigo: string;
  codigoIdioma: string;
  idiomaNome: string;
  codigoUsuario: string;
  usuarioNome: string;
  data: string;
  tipos: string[];
  descricao?: string;
  status: 'pendente' | 'analisando' | 'resolvida' | 'rejeitada';
  codigoResponsavel?: string;
  responsavelNome?: string;
}
