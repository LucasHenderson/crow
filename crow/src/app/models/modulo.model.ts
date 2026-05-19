import { SafeHtml } from '@angular/platform-browser';

export interface Modulo {
  id: number;
  nome: string;
  /** SVG sanitizado para renderização no template. */
  icone: SafeHtml;
  /** SVG bruto persistido no backend — usado como chave de seleção. */
  iconeSvg: string;
  selecionado: boolean;
  frases: number;
}
