import { Injectable, signal } from '@angular/core';

/** Sons disponíveis. Cada um é uma receita de tons curtos gerados na hora. */
export type Som =
  // Jogar: resposta e andamento da rodada
  | 'acerto' | 'erro' | 'conclusao' | 'avanco'
  // Jogar: peças escolhidas e devolvidas
  | 'selecao' | 'remocao' | 'par'
  // Interface: botões, resultados de ações e tema
  | 'clique' | 'sucesso' | 'exclusao' | 'alerta' | 'clarear' | 'escurecer';

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
  // Também é o som das ações da interface que falham (salvar, excluir, entrar).
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
  // Lá4 subindo para Mi5, 70 ms: a peça "sobe" para a resposta (palavra,
  // lado de um par, alternativa do quiz).
  selecao: [
    { freq: 440.0, freqFinal: 659.25, duracao: 70, onda: 'sine', ganho: 0.12 },
  ],
  // O mesmo gesto ao contrário e um pouco mais baixo: a peça volta ao lugar.
  remocao: [
    { freq: 659.25, freqFinal: 440.0, duracao: 70, onda: 'sine', ganho: 0.1 },
  ],
  // Mi5 → Si5: quinta justa, 110 ms. Par ligado — não revela se está certo.
  par: [
    { freq: 659.25, duracao: 50, onda: 'sine', ganho: 0.12 },
    { freq: 987.77, duracao: 60, onda: 'sine', ganho: 0.12 },
  ],
  // Mi6 caindo para Si5, 35 ms: o "tique" de qualquer botão ou opção. Toca
  // automaticamente (ver `aoClicar`), por isso é o mais curto e baixo de todos.
  clique: [
    { freq: 1318.51, freqFinal: 987.77, duracao: 35, onda: 'sine', ganho: 0.08 },
  ],
  // Sol5 → Dó6: quarta justa ascendente, 200 ms. Algo foi salvo, criado,
  // enviado ou copiado.
  sucesso: [
    { freq: 783.99, duracao: 80, onda: 'sine', ganho: 0.14 },
    { freq: 1046.5, duracao: 120, onda: 'sine', ganho: 0.14 },
  ],
  // Mi5 → Lá4: quinta descendente, 200 ms. Item excluído ou conta desativada —
  // encerra sem soar como erro.
  exclusao: [
    { freq: 659.25, duracao: 80, onda: 'sine', ganho: 0.14 },
    { freq: 440.0, duracao: 120, onda: 'sine', ganho: 0.14 },
  ],
  // Dois toques de Lá4, 160 ms: abriu uma confirmação que pede atenção
  // (excluir, cancelar, limite atingido) — os modais com o ícone de alerta.
  alerta: [
    { freq: 440.0, duracao: 80, onda: 'triangle', ganho: 0.12 },
    { freq: 440.0, duracao: 80, onda: 'triangle', ganho: 0.12 },
  ],
  // Varredura de uma oitava, 160 ms: sobe para o tema claro, desce para o escuro.
  clarear: [
    { freq: 440.0, freqFinal: 880.0, duracao: 160, onda: 'sine', ganho: 0.08 },
  ],
  escurecer: [
    { freq: 880.0, freqFinal: 440.0, duracao: 160, onda: 'sine', ganho: 0.08 },
  ],
};

/** Ataque do envelope, em segundos. Curto o bastante para não "arrastar". */
const ATAQUE = 0.008;

/** Piso das rampas exponenciais (a Web Audio API não aceita 0 nelas). */
const SILENCIO = 0.0001;

/**
 * O que conta como botão ou opção para o `clique` automático. Além destes,
 * vale qualquer elemento com `cursor: pointer` — os cards e opções clicáveis
 * das telas são `div`s com `(click)`.
 */
const CLICAVEIS = [
  'button', 'a[href]', 'summary', 'select',
  'input[type="checkbox"]', 'input[type="radio"]',
  '[role="button"]', '[role="tab"]', '[role="menuitem"]', '[role="option"]', '[role="switch"]',
].join(', ');

/**
 * Efeitos sonoros discretos da aplicação, gerados pela Web Audio API.
 *
 * - Ligado por padrão; desligado por padrão quando o sistema pede menos
 *   movimento (`prefers-reduced-motion: reduce`). A escolha explícita do
 *   usuário, persistida em localStorage, vence nos dois casos.
 * - Todo botão ou opção clicável toca o `clique` sem nenhum código no
 *   componente (ver `aoClicar`). O componente só chama `tocar()` quando o
 *   clique tem um significado próprio (acerto, exclusão, alerta...) — e esse
 *   som substitui o `clique` daquele gesto, nunca se soma a ele.
 * - O `AudioContext` só é criado a partir de um gesto do usuário (clique,
 *   tecla) — respeita a política de autoplay dos navegadores sem nenhum
 *   tratamento nos componentes. Depois de criado, também toca no retorno de
 *   requisições (ex.: `sucesso` ao salvar).
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

  /** O ouvinte de cliques do documento já foi registrado. */
  private ouvindoCliques = false;

  /**
   * Há um `clique` automático agendado para o gesto em andamento. Um som
   * específico tocado nesse meio tempo o cancela (ver `tocar`).
   */
  private cliquePendente = false;

  /**
   * Lê a preferência salva e passa a ouvir os cliques do documento. Chamar no
   * início do app; não cria o contexto de áudio.
   */
  init(): void {
    let inicial = !this.prefereMenosMovimento();
    try {
      const salvo = localStorage.getItem(SoundService.STORAGE_KEY);
      if (salvo === 'ligado' || salvo === 'desligado') {
        inicial = salvo === 'ligado';
      }
    } catch { /* localStorage indisponível — usa padrão */ }
    this.ativo.set(inicial);
    this.ouvirCliques();
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
   * Toca um som, se a preferência estiver ligada. Chamado no handler de um
   * clique, substitui o `clique` automático daquele gesto. O primeiro som da
   * página precisa nascer de uma interação do usuário: é o que permite criar
   * ou retomar o contexto de áudio. Antes disso, apenas não toca.
   */
  tocar(som: Som): void {
    this.cliquePendente = false;
    this.reproduzir(som);
  }

  private reproduzir(som: Som): void {
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
      // Falha de áudio nunca pode interromper o fluxo da tela.
    }
  }

  /**
   * Um único ouvinte, na fase de captura do `document`: roda antes dos
   * handlers dos componentes e não é barrado pelos `stopPropagation()` dos
   * modais.
   */
  private ouvirCliques(): void {
    if (this.ouvindoCliques) return;
    this.ouvindoCliques = true;
    document.addEventListener('click', evento => this.aoClicar(evento), { capture: true });
  }

  /**
   * Agenda o `clique` para depois que o clique terminar de ser tratado
   * (`setTimeout` 0). Se algum handler tocar um som próprio nesse meio tempo,
   * o `clique` é descartado. O clique sintético que um `<label>` repassa ao
   * seu checkbox cai na mesma janela e não toca de novo.
   */
  private aoClicar(evento: MouseEvent): void {
    if (!this.ativo() || this.indisponivel || this.cliquePendente) return;
    if (!this.ehBotaoOuOpcao(evento.target)) return;

    this.cliquePendente = true;
    this.despertarContexto();
    setTimeout(() => {
      if (!this.cliquePendente) return;
      this.cliquePendente = false;
      this.reproduzir('clique');
    });
  }

  /** Clicável e habilitado. Desabilitado inclui `cursor: not-allowed`. */
  private ehBotaoOuOpcao(alvo: EventTarget | null): boolean {
    if (!(alvo instanceof Element)) return false;
    if (alvo.closest(':disabled, [aria-disabled="true"]')) return false;

    const cursor = getComputedStyle(alvo).cursor;
    if (cursor === 'not-allowed') return false;
    return cursor === 'pointer' || alvo.closest(CLICAVEIS) !== null;
  }

  /**
   * Cria ou retoma o contexto ainda dentro do gesto — o `clique` só é
   * reproduzido depois, fora dele, e alguns navegadores exigem o gesto.
   */
  private despertarContexto(): void {
    try {
      const ctx = this.obterContexto();
      if (ctx && ctx.state !== 'running') {
        ctx.resume().catch(() => { /* sem gesto válido — silêncio */ });
      }
    } catch { /* ignora: reproduzir() tenta de novo */ }
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
