import { Injectable, signal } from '@angular/core';
import { SoundService } from './sound.service';

/**
 * Estado de confirmação temporária de uma cópia ("ID copiado!"), com o som
 * de sucesso ou de erro junto da confirmação visual.
 *
 * Cada componente cria a sua instância via {@link ClipboardService.criarEstado}
 * e lê os signals no template — em modo zoneless a leitura de signal já dispara
 * a renderização, sem precisar de `ChangeDetectorRef`.
 */
export class EstadoCopia {

  /** Cópia concluída — exibir a confirmação. */
  readonly copiado = signal(false);

  /** Cópia falhou (Clipboard API indisponível ou bloqueada). */
  readonly falhou = signal(false);

  private timeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly clipboard: ClipboardService,
    private readonly duracaoMs: number,
    private readonly soundService: SoundService
  ) {}

  /** Copia o texto e mantém a confirmação visível por alguns segundos. */
  async copiar(texto: string): Promise<void> {
    if (!texto) return;

    const copiou = await this.clipboard.copiar(texto);
    this.copiado.set(copiou);
    this.falhou.set(!copiou);
    this.soundService.tocar(copiou ? 'sucesso' : 'erro');

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.copiado.set(false);
      this.falhou.set(false);
    }, this.duracaoMs);
  }

  /** Cancela o temporizador pendente. Chamar no `ngOnDestroy` do componente. */
  destruir(): void {
    clearTimeout(this.timeout);
  }
}

/**
 * Cópia de texto para a área de transferência.
 *
 * Usa a Clipboard API quando disponível e recorre ao `execCommand('copy')`
 * em contextos onde ela não existe ou é bloqueada (ex.: página servida sem
 * HTTPS). Nunca lança: o retorno indica se a cópia foi concluída.
 */
@Injectable({ providedIn: 'root' })
export class ClipboardService {

  constructor(private readonly soundService: SoundService) {}

  async copiar(texto: string): Promise<boolean> {
    if (!texto) return false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        return true;
      }
    } catch {
      // Clipboard API indisponível ou negada — tenta o fallback abaixo.
    }

    return this.copiarComCampoTemporario(texto);
  }

  /** Cria um estado de confirmação para exibir "copiado!" na interface. */
  criarEstado(duracaoMs = 2000): EstadoCopia {
    return new EstadoCopia(this, duracaoMs, this.soundService);
  }

  private copiarComCampoTemporario(texto: string): boolean {
    try {
      const campo = document.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.top = '-1000px';
      campo.style.opacity = '0';

      document.body.appendChild(campo);
      campo.select();
      const copiou = document.execCommand('copy');
      document.body.removeChild(campo);

      return copiou;
    } catch {
      return false;
    }
  }
}
