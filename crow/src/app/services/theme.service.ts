import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

/**
 * Gerencia o tema da aplicação (escuro/claro).
 *
 * - Tema padrão: escuro.
 * - A escolha do usuário é persistida em localStorage e reaplicada no boot.
 * - A troca é dinâmica (atributo `data-theme` no <html>), sem recarregar a página.
 * - O estado é exposto como signal para os componentes reagirem.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE_KEY = 'crow:theme';

  /** Tema atual reativo. Padrão: escuro. */
  readonly theme = signal<Theme>('dark');

  /** Lê a preferência salva e aplica ao documento. Chamar no início do app. */
  init(): void {
    let inicial: Theme = 'dark';
    try {
      const salvo = localStorage.getItem(ThemeService.STORAGE_KEY);
      if (salvo === 'light' || salvo === 'dark') {
        inicial = salvo;
      }
    } catch { /* localStorage indisponível — usa padrão */ }
    this.aplicar(inicial);
  }

  /** Define explicitamente um tema e persiste a escolha. */
  setTheme(theme: Theme): void {
    this.aplicar(theme);
    try {
      localStorage.setItem(ThemeService.STORAGE_KEY, theme);
    } catch { /* ignora indisponibilidade */ }
  }

  /** Alterna entre escuro e claro. */
  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private aplicar(theme: Theme): void {
    this.theme.set(theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }
}
