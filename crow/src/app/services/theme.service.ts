import { ApplicationRef, Injectable, inject, signal } from '@angular/core';
import { SoundService } from './sound.service';

export type Theme = 'dark' | 'light';

/**
 * Gerencia o tema da aplicação (escuro/claro).
 *
 * - Tema padrão: escuro.
 * - A escolha do usuário é persistida em localStorage e reaplicada no boot.
 * - A troca é dinâmica (atributo `data-theme` no <html>), sem recarregar a página.
 * - O estado é exposto como signal para os componentes reagirem.
 * - A troca pelo botão é animada (ver `toggle`); os estilos ficam em styles.css.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE_KEY = 'crow:theme';
  /** Duração do círculo que revela o novo tema. */
  private static readonly DURACAO_REVELACAO_MS = 520;
  /** Duração da transição de cores usada quando não há View Transitions. */
  private static readonly DURACAO_TRANSICAO_CORES_MS = 360;

  private readonly appRef = inject(ApplicationRef);
  private readonly soundService = inject(SoundService);

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

  /**
   * Alterna entre escuro e claro com animação: o novo tema se expande em
   * círculo a partir de `origem` (o botão clicado), como no projeto Porpones.
   *
   * - Com a View Transitions API: revelação circular do novo tema.
   * - Sem ela: transição curta de cores (classe `theme-transition`).
   * - Com "reduzir movimento" ativo no sistema: troca imediata.
   *
   * O som acompanha o sentido da troca (sobe para o claro, desce para o escuro)
   * e é tocado aqui, ainda dentro do clique que chamou o toggle.
   */
  toggle(origem?: Element | null): void {
    const proximo: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    this.soundService.tocar(proximo === 'light' ? 'clarear' : 'escurecer');

    if (this.prefereMenosMovimento()) {
      this.setTheme(proximo);
      return;
    }

    if (typeof document.startViewTransition === 'function') {
      const { x, y } = this.centroDe(origem);
      // Sem as transições de cor dos componentes, o novo tema já nasce pronto
      // dentro do círculo, em vez de as cores "correrem atrás" da revelação.
      root.classList.add('theme-switching');
      const transicao = document.startViewTransition(() => {
        this.setTheme(proximo);
        // App zoneless: renderiza agora (ex.: ícone sol/lua) para que a
        // mudança entre no retrato do novo tema, e não só no fim da animação.
        this.appRef.tick();
      });
      transicao.ready.then(() => {
        const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
          {
            duration: ThemeService.DURACAO_REVELACAO_MS,
            easing: 'ease-in',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      }).catch(() => { /* transição pulada (ex.: aba oculta): o tema já foi aplicado */ });
      const limpar = () => root.classList.remove('theme-switching');
      transicao.finished.then(limpar, limpar);
      return;
    }

    root.classList.add('theme-transition');
    this.setTheme(proximo);
    window.setTimeout(() => root.classList.remove('theme-transition'), ThemeService.DURACAO_TRANSICAO_CORES_MS);
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

  private prefereMenosMovimento(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  /** Centro do elemento de origem; sem ele, o centro da janela. */
  private centroDe(origem?: Element | null): { x: number; y: number } {
    if (!origem) {
      return { x: innerWidth / 2, y: innerHeight / 2 };
    }
    const r = origem.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
}
