import { SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

export interface PalavraTrad {
  palavra: string;
  traducao: string;
  usado?: boolean;
}

export interface Par {
  imagem?: string;
  imagemFile?: File;
  palavra: string;
  traducao: string;
}

export interface Frase {
  id?: number;
  modo: 'traducao' | 'pares' | 'quiz';
  modoNome?: string;
  modoIcone?: SafeHtml;

  // Tradução Direta
  traducaoCompleta?: string;
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
  alternativas?: string[];
  alternativasEmbaralhadas?: string[];
  respostaCorretaIndex?: number;
  respostaCorretaTexto?: string;
  respostaCorreta?: number;
}
