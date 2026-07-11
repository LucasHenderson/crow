export interface Idioma {
  id: number;
  codigo: string;
  nome: string;
  bandeira: string;
  nota: number; // 1 a 5
  modulos: number; // até 20
  descricao: string;
  proficiencia?: string;
  visibilidade?: 'publico' | 'privado';
}

export interface IdiomaAdm {
  id: number;
  codigo: string;
  nome: string;
  /** Nome da linguagem (ex.: "Inglês (Estados Unidos)"). */
  idioma: string;
  bandeira: string;
  descricao: string;
  criadorId: number;
  codigoCriador: string;
  criadorNome: string;
  modulos: number;
  avaliacao: number;
  totalAvaliacoes: number;
  proficiencia?: string;
  visibilidade?: 'publico' | 'privado';
}

export interface IdiomaBusca {
  id: number;
  codigo: string;
  nome: string;
  idioma: string;
  bandeira: string;
  modulos: number;
  avaliacao: number;
  criadoEm: Date;
  proficiencia: Proficiencia;
}

export interface IdiomaOpcao {
  nome: string;
  bandeira: string;
}

export interface IdiomaUsuario {
  id: number;
  nome: string;
  bandeira: string;
  selecionado: boolean;
}

export type Proficiencia = 'iniciante' | 'basico' | 'intermediario' | 'avancado' | 'fluente';

export const PROFICIENCIAS = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Fluente'];

export const IDIOMAS_DISPONIVEIS: IdiomaOpcao[] = [
  { nome: 'Alemão', bandeira: '../../../assets/imgs/Germany-Flag.svg.png' },
  { nome: 'Árabe', bandeira: '../../../assets/imgs/United-Arab-Emirates-Flag.svg.png' },
  { nome: 'Chinês (Mandarim)', bandeira: '../../../assets/imgs/China-Flag.svg' },
  { nome: 'Coreano', bandeira: '../../../assets/imgs/South-Korea-Flag.svg.webp' },
  { nome: 'Espanhol', bandeira: '../../../assets/imgs/Spain-Flag.svg' },
  { nome: 'Francês', bandeira: '../../../assets/imgs/France-Flag.png' },
  { nome: 'Inglês (Estados Unidos)', bandeira: '../../../assets/imgs/United-States-Flag.svg' },
  { nome: 'Inglês (Reino Unido)', bandeira: '../../../assets/imgs/United-Kingdom-Flag.svg.png' },
  { nome: 'Italiano', bandeira: '../../../assets/imgs/Italy-Flag.svg' },
  { nome: 'Japonês', bandeira: '../../../assets/imgs/Japan-Flag.png' },
  { nome: 'Português (Brasil)', bandeira: '../../../assets/imgs/Brazil-Flag.svg' },
  { nome: 'Português (Portugal)', bandeira: '../../../assets/imgs/Portugal-Flag.svg.png' },
  { nome: 'Russo', bandeira: '../../../assets/imgs/Russia-Flag.svg' }
].sort((a, b) => a.nome.localeCompare(b.nome));
