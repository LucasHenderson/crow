import { Injectable, signal } from '@angular/core';

/** Sons disponíveis. Cada um é uma receita de tons curtos gerados na hora. */
export type Som = 'acerto' | 'erro' | 'conclusao' | 'avanco';

/**
 * Uma nota da receita. As notas de um som tocam em sequência, sem sobreposição.
 * - `freq`/`freqFinal` em Hz; com `freqFinal` a nota desliza de uma para a outra.
 * - `duracao` em ms.
 * - `ganho` é o pico do envelope (0–1). Mantido baixo de propósito: os sons
 *   são feedback discreto, não podem competir com o vídeo do quiz.
 */
interface Nota {
  freq: number;
  freqFinal?: number;
  duracao: number;
  onda: OscillatorType;
  ganho: number;
}

/**
 * Receitas dos sons. Para ajustar de ouvido, mexa aqui — nenhum componente
 * conhece frequências ou durações. Todas somam menos de 300 ms.
 */
const RECEITAS: Record<Som, Nota[]> = {
  // Dó5 → Mi5: terça maior ascendente, 200 ms. Confirmação, não vitória.
  acerto: [
    { freq: 523.25, duracao: 90, onda: 'sine', ganho: 0.18 },
    { freq: 659.25, duracao: 110, onda: 'sine', ganho: 0.18 },
  ],
  // Sol3 deslizando para Mi3, 180 ms. Neutro: errar no estudo não pede buzzer.
  erro: [
    { freq: 196.0, freqFinal: 164.81, duracao: 180, onda: 'triangle', ganho: 0.15 },
  ],
  // Dó5 → Mi5 → Sol5: arpejo maior, 240 ms. O único som "de recompensa".
  conclusao: [
    { freq: 523.25, duracao: 80, onda: 'sine', ganho: 0.18 },
    { freq: 659.25, duracao: 80, onda: 'sine', ganho: 0.18 },
    { freq: 783.99, duracao: 80, onda: 'sine', ganho: 0.18 },
  ],
  // Lá5, 40 ms, quase inaudível: "página virada" ao avançar de frase.
  avanco: [
    { freq: 880.0, duracao: 40, onda: 'sine', ganho: 0.08 },
  ],
};

/** Ataque do envelope, em segundos. Curto o bastante para não "arrastar". */
const ATAQUE = 0.008;

/** Piso das rampas exponenciais (a Web Audio API não aceita 0 nelas). */
const SILENCIO = 0.0001;

/**
 * Efeitos sonoros discretos da aplicação, gerados pela Web Audio API.
 *
 * - Ligado por padrão; desligado por padrão quando o sistema pede menos
 *   movimento (`prefers-reduced-motion: reduce`). A escolha explícita do
 *   usuário, persistida em localStorage, vence nos dois casos.
 * - O `AudioContext` só é criado dentro de `tocar()`, que os componentes
 *   chamam a partir de cliques — respeita a política de autoplay dos
 *   navegadores sem nenhum tratamento nos componentes.
 * - Nenhuma falha de áudio escapa deste serviço: `tocar()` nunca lança e
 *   nunca deixa promise rejeitada solta. Se a API não existir, o toggle
 *   segue funcionando só como preferência.
 * - O estado é exposto como signal, no mesmo padrão do ThemeService.
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private static readonly STORAGE_KEY = 'crow:sons';

  /** Preferência atual reativa. Padrão: ligado. */
  readonly ativo = signal<boolean>(true);

  /** Criado preguiçosamente, sempre a partir de um gesto do usuário. */
  private ctx: AudioContext | null = null;

  /** Web Audio API ausente neste navegador — nunca mais tentamos tocar. */
  private indisponivel = false;

  /** Lê a preferência salva. Chamar no início do app; não cria o contexto. */
  init(): void {
    let inicial = !this.prefereMenosMovimento();
    try {
      const salvo = localStorage.getItem(SoundService.STORAGE_KEY);
      if (salvo === 'ligado' || salvo === 'desligado') {
        inicial = salvo === 'ligado';
      }
    } catch { /* localStorage indisponível — usa padrão */ }
    this.ativo.set(inicial);
  }

  /** Define explicitamente a preferência e persiste a escolha. */
  setAtivo(ativo: boolean): void {
    this.ativo.set(ativo);
    try {
      localStorage.setItem(SoundService.STORAGE_KEY, ativo ? 'ligado' : 'desligado');
    } catch { /* ignora indisponibilidade */ }
  }

  /** Alterna entre ligado e desligado. */
  toggle(): void {
    this.setAtivo(!this.ativo());
  }

  /**
   * Toca um som, se a preferência estiver ligada. Deve ser chamado a partir
   * de uma interação do usuário (clique, tecla): é o que permite criar ou
   * retomar o contexto de áudio. Fora disso, apenas não toca.
   */
  tocar(som: Som): void {
    if (!this.ativo() || this.indisponivel) return;

    try {
      const ctx = this.obterContexto();
      if (!ctx) return;

      const receita = RECEITAS[som];
      if (ctx.state === 'running') {
        this.agendar(ctx, receita);
        return;
      }

      // Alguns navegadores (Safari, sobretudo) entregam o contexto suspenso
      // mesmo dentro do gesto. Retomamos e tocamos quando ele estiver de pé;
      // se o navegador recusar, a promise rejeita e nós apenas não tocamos.
      ctx.resume()
        .then(() => {
          if (ctx.state === 'running') this.agendar(ctx, receita);
        })
        .catch(() => { /* sem gesto válido — silêncio */ });
    } catch {
      // Falha de áudio nunca pode interromper o fluxo do jogo.
    }
  }

  private obterContexto(): AudioContext | null {
    if (this.ctx) return this.ctx;

    const Contexto = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) {
      this.indisponivel = true;
      return null;
    }

    this.ctx = new Contexto();
    return this.ctx;
  }

  /** Agenda as notas da receita em sequência a partir de agora. */
  private agendar(ctx: AudioContext, notas: Nota[]): void {
    let inicio = ctx.currentTime;

    for (const nota of notas) {
      const fim = inicio + nota.duracao / 1000;
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();

      osc.type = nota.onda;
      osc.frequency.setValueAtTime(nota.freq, inicio);
      if (nota.freqFinal) {
        osc.frequency.exponentialRampToValueAtTime(nota.freqFinal, fim);
      }

      // Envelope: ataque curto e decaimento exponencial até o fim da nota.
      // Sem ele, a onda é cortada no meio do ciclo e produz um "clique".
      ganho.gain.setValueAtTime(SILENCIO, inicio);
      ganho.gain.exponentialRampToValueAtTime(nota.ganho, inicio + ATAQUE);
      ganho.gain.exponentialRampToValueAtTime(SILENCIO, fim);

      osc.connect(ganho).connect(ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        ganho.disconnect();
      };
      osc.start(inicio);
      osc.stop(fim + 0.01);

      inicio = fim;
    }
  }

  private prefereMenosMovimento(): boolean {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }
}
