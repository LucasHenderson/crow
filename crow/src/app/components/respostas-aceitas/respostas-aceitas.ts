import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Quantidade máxima de respostas alternativas por frase. */
export const LIMITE_RESPOSTAS_ACEITAS = 5;

/** Motivo pelo qual uma resposta aceita é inválida ('' quando está ok). */
export type ErroRespostaAceita = '' | 'vazia' | 'duplicada' | 'principal';

/**
 * Normaliza igual ao corretor da tela Jogar (minúsculas, sem acentos, sem
 * pontuação e espaços colapsados). Assim "duplicada" aqui significa exatamente
 * o que o jogo trataria como a mesma resposta.
 */
export function normalizarRespostaAceita(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Valida uma entrada da lista contra vazio, duplicata e a tradução principal. */
export function erroRespostaAceita(respostas: string[], principal: string, index: number): ErroRespostaAceita {
  const atual = normalizarRespostaAceita(respostas[index]);
  if (!atual) return 'vazia';

  const principalNorm = normalizarRespostaAceita(principal);
  if (principalNorm && atual === principalNorm) return 'principal';

  const jaExiste = respostas.some((outra, i) => i < index && normalizarRespostaAceita(outra) === atual);
  return jaExiste ? 'duplicada' : '';
}

/** True quando nenhuma entrada da lista está vazia ou duplicada. */
export function respostasAceitasValidas(respostas: string[], principal: string): boolean {
  return respostas.every((_, i) => !erroRespostaAceita(respostas, principal, i));
}

/**
 * Lista de traduções alternativas aceitas como corretas além da ordem
 * principal. Compartilhada pelas telas que cadastram frases no modo tradução.
 */
@Component({
  selector: 'app-respostas-aceitas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respostas-aceitas.html',
  styleUrl: './respostas-aceitas.css',
})
export class RespostasAceitas {

  /** Editado in-place: o componente pai mantém a mesma referência de array. */
  @Input() respostas: string[] = [];
  @Output() respostasChange = new EventEmitter<string[]>();

  /** Tradução principal (derivada das palavras), exibida como referência. */
  @Input() principal = '';

  readonly limite = LIMITE_RESPOSTAS_ACEITAS;

  trackByIndex(index: number): number {
    return index;
  }

  erro(index: number): ErroRespostaAceita {
    return erroRespostaAceita(this.respostas, this.principal, index);
  }

  /** Bloqueia adicionar enquanto houver linha em branco ou o limite for atingido. */
  get podeAdicionar(): boolean {
    return this.respostas.length < this.limite && this.respostas.every(r => !!r.trim());
  }

  adicionar(): void {
    if (!this.podeAdicionar) return;
    this.respostas.push('');
    this.respostasChange.emit(this.respostas);
  }

  remover(index: number): void {
    this.respostas.splice(index, 1);
    this.respostasChange.emit(this.respostas);
  }

  aoEditar(index: number, valor: string): void {
    this.respostas[index] = valor;
    this.respostasChange.emit(this.respostas);
  }
}
