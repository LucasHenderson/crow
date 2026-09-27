import { ModuloCompletoAdm } from './modulo.model';

export interface Idioma {
  codigo: string;
  nome: string;
  bandeira: string;
  nota: number; // 1 a 5
  modulos: number; // até 20
  descricao: string;
  proficiencia?: string;
  visibilidade?: 'publico' | 'privado';
}

/**
 * Tela de onde o usuário abriu a página de um idioma. Viaja no query param
 * `origem` por toda a cadeia (visualizar-idioma → visualizar-modulo → jogar)
 * para que o botão Voltar retorne ao ponto de partida em vez de cair no
 * histórico do navegador, que gerava ciclos em idiomas de outros usuários.
 */
export type OrigemIdioma = 'home' | 'buscar-idioma' | 'visualizar-usuario';

/** Valida o query param recebido; qualquer valor desconhecido vira `home`. */
export function normalizarOrigem(valor: string | null | undefined): OrigemIdioma {
  return valor === 'buscar-idioma' || valor === 'visualizar-usuario' ? valor : 'home';
}

export interface IdiomaAdm {
  codigo: string;
  nome: string;
  /** Nome da linguagem (ex.: "Inglês (Estados Unidos)"). */
  idioma: string;
  bandeira: string;
  descricao: string;
  codigoCriador: string;
  criadorNome: string;
  modulos: number;
  avaliacao: number;
  totalAvaliacoes: number;
  proficiencia?: string;
  visibilidade?: 'publico' | 'privado';
  /** Última alteração de conteúdo (ISO); ausente em idiomas sem registro. */
  atualizadoEm?: string | null;
  /** Data de criação (ISO). */
  criadoEm?: string | null;
}

/**
 * Idioma completo servido pela área administrativa
 * (GET /api/admin/idiomas/{codigo}): módulos na ordem do criador e, dentro de
 * cada um, as frases brutas (campos *Json ainda serializados). Somente leitura.
 */
export interface IdiomaCompletoAdm {
  idioma: IdiomaAdm;
  modulos: ModuloCompletoAdm[];
}

/** Corpo opcional da exclusão administrativa (DELETE /api/admin/idiomas/{codigo}). */
export interface ExcluirIdioma {
  /** Mensagem ao proprietário no e-mail de aviso; vazia = aviso padrão. Até 1000 caracteres. */
  mensagem?: string;
}

export interface IdiomaBusca {
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
  codigo: string;
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
