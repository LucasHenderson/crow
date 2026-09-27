import { SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

/*
 * Áudios das frases: todo campo `audio*` guarda o caminho do arquivo no
 * servidor (`/api/uploads/...`). Nos formulários, antes de salvar, pode guardar
 * também a URL `blob:` de um arquivo escolhido e ainda não enviado — o
 * AudioService troca uma pela outra ao salvar.
 */

export interface PalavraTrad {
  palavra: string;
  traducao: string;
  audioPalavra?: string | null;
  audioTraducao?: string | null;
  usado?: boolean;
}

export interface Par {
  imagem?: string;
  imagemFile?: File;
  palavra: string;
  traducao: string;
  audioPalavra?: string | null;
  audioTraducao?: string | null;
}

export interface Frase {
  id?: number;
  modo: 'traducao' | 'pares' | 'quiz';
  modoNome?: string;
  modoIcone?: SafeHtml;

  // Tradução Direta
  traducaoCompleta?: string;
  /** Áudio da tradução completa — no jogo, tocado de 0,25x a 2x. */
  audioTraducaoCompleta?: string | null;
  /** Traduções/ordens alternativas aceitas como corretas (texto). */
  traducoesAlternativas?: string[];
  /** JSON serializado das traduções alternativas (contrato com o backend). */
  traducoesAlternativasJson?: string;
  palavras?: PalavraTrad[];
  imagem?: string;
  observacoes?: string;
  links?: string[];

  // Selecionar Pares
  pares?: Par[];

  // Quiz
  imagemQuiz?: string;
  videoQuiz?: SafeResourceUrl;
  videoQuizUrl?: string;
  pergunta?: string;
  /** Áudio da pergunta — no jogo, tocado de 0,25x a 2x, como os das alternativas. */
  audioPergunta?: string | null;
  alternativas?: string[];
  /** Áudio de cada alternativa, na mesma ordem de `alternativas` (null = sem áudio). */
  audiosAlternativas?: (string | null)[];
  /** JSON serializado de `audiosAlternativas` (contrato com o backend). */
  audiosAlternativasJson?: string | null;
  alternativasEmbaralhadas?: string[];
  /** Áudios na mesma ordem de `alternativasEmbaralhadas` (tela Jogar). */
  audiosAlternativasEmbaralhados?: (string | null)[];
  respostaCorretaIndex?: number;
  respostaCorretaTexto?: string;
  respostaCorreta?: number;
}

/** Quantos áudios a frase tem, somando todos os campos do modo dela. */
export function contarAudiosDaFrase(frase: Frase): number {
  const audios: (string | null | undefined)[] = [
    frase.audioTraducaoCompleta,
    frase.audioPergunta,
    ...(frase.audiosAlternativas || []),
    ...(frase.palavras || []).flatMap(p => [p.audioPalavra, p.audioTraducao]),
    ...(frase.pares || []).flatMap(p => [p.audioPalavra, p.audioTraducao]),
  ];
  return audios.filter(audio => !!audio).length;
}
