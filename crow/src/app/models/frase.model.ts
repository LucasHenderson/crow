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
  palavras?: PalavraTrad[];
  imagem?: string;
  observacoes?: string;
  links?: string[];

  // Selecionar Pares
  pares?: Par[];

  // Quiz
  imagemQuiz?: string;
  videoQuiz?: SafeResourceUrl;
  pergunta?: string;
  alternativas?: string[];
  alternativasEmbaralhadas?: string[];
  respostaCorretaIndex?: number;
  respostaCorretaTexto?: string;
  respostaCorreta?: number;
}
