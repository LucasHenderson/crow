import { SafeHtml } from '@angular/platform-browser';

export interface Modulo {
  id: number;
  nome: string;
  icone: SafeHtml;
  selecionado: boolean;
  frases: number;
}
