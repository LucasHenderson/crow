import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

/** Sentido do movimento: -1 sobe uma posição, 1 desce uma posição. */
export type DirecaoMovimento = -1 | 1;

export interface OpcoesReordenacao<T> {
  /** Lista atual, já na ordem exibida na tela. */
  obterItens: () => T[];
  /**
   * Recebe a lista na nova ordem. O componente aplica no seu próprio estado e
   * re-renderiza (paginação inclusive) — é também o caminho do desfazer.
   */
  aplicarItens: (itens: T[]) => void;
  /** Id numérico do item, usado no corpo enviado ao backend. */
  extrairId: (item: T) => number;
  /** Envia a lista **completa** de ids na nova ordem. */
  persistir: (ids: number[]) => Observable<unknown>;
  /** Mensagem de falha já pronta para exibição, após o desfazer. */
  aoFalhar?: (mensagem: string) => void;
}

/**
 * Reordenação otimista de uma lista por troca com o vizinho.
 *
 * O clique reordena a tela na hora e só depois a mudança é persistida. Cliques
 * em sequência são agrupados por um debounce curto: uma rajada de trocas vira
 * **uma** requisição com a ordem final, e não uma por clique. Enquanto a
 * requisição está em voo, {@link salvando} fica verdadeiro para que o
 * componente desabilite os botões — é o que impede chamadas simultâneas, já que
 * o backend exige a lista completa e duas requisições concorrentes poderiam
 * chegar fora de ordem.
 *
 * Se a persistência falhar, a lista volta ao estado anterior ao início da
 * rajada e a mensagem do backend é repassada ao componente.
 *
 * Cada componente cria a sua instância via {@link ReordenacaoService.criarEstado}
 * e lê os signals no template — em modo zoneless a leitura de signal já dispara
 * a renderização.
 */
export class EstadoReordenacao<T> {

  /** Requisição em andamento — o componente desabilita os botões enquanto for true. */
  readonly salvando = signal(false);

  /** Mensagem do último erro de persistência; `null` quando não há erro pendente. */
  readonly erro = signal<string | null>(null);

  /**
   * Ordem vigente antes da rajada atual. É o ponto de desfazer e também o sinal
   * de que existe alteração pendente de envio.
   */
  private ordemAnterior: T[] | null = null;

  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly opcoes: OpcoesReordenacao<T>,
    private readonly debounceMs: number
  ) {}

  /**
   * Troca o item da posição `indice` com o vizinho no sentido indicado.
   *
   * Índices são **globais** na lista completa: numa tela paginada, converta o
   * índice da página antes de chamar.
   *
   * @return `true` quando a troca foi aplicada; `false` quando foi ignorada
   *         (requisição em voo ou movimento fora dos limites da lista).
   */
  mover(indice: number, direcao: DirecaoMovimento): boolean {
    if (this.salvando()) return false;

    const itens = [...this.opcoes.obterItens()];
    const destino = indice + direcao;
    if (indice < 0 || indice >= itens.length || destino < 0 || destino >= itens.length) {
      return false;
    }

    // Só a primeira troca da rajada define o ponto de desfazer.
    if (!this.ordemAnterior) {
      this.ordemAnterior = itens.slice();
    }

    [itens[indice], itens[destino]] = [itens[destino], itens[indice]];
    this.erro.set(null);
    this.opcoes.aplicarItens(itens);

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.enviar(), this.debounceMs);
    return true;
  }

  /** True quando o item pode subir (não é o primeiro). */
  podeSubir(indice: number): boolean {
    return indice > 0;
  }

  /** True quando o item pode descer (não é o último). */
  podeDescer(indice: number): boolean {
    return indice >= 0 && indice < this.opcoes.obterItens().length - 1;
  }

  /** Descarta a mensagem de erro exibida. */
  limparErro(): void {
    this.erro.set(null);
  }

  /**
   * Envia agora o que estiver pendente no debounce e cancela o temporizador.
   * Chamar no `ngOnDestroy`: sem isso, sair da tela dentro da janela do debounce
   * descartaria silenciosamente a reordenação que o usuário já viu aplicada.
   */
  destruir(): void {
    clearTimeout(this.timer);
    this.enviar({ semDesfazer: true });
  }

  private enviar(opcoes: { semDesfazer?: boolean } = {}): void {
    const ordemAnterior = this.ordemAnterior;
    this.ordemAnterior = null;
    if (!ordemAnterior) return;

    const ids = this.opcoes.obterItens().map(item => this.opcoes.extrairId(item));
    const idsAnteriores = ordemAnterior.map(item => this.opcoes.extrairId(item));

    // Rajada que voltou ao ponto de partida (subiu e desceu): nada a persistir.
    if (ids.length === idsAnteriores.length && ids.every((id, i) => id === idsAnteriores[i])) {
      return;
    }

    this.salvando.set(true);
    this.opcoes.persistir(ids).subscribe({
      next: () => {
        this.salvando.set(false);
      },
      error: (err) => {
        this.salvando.set(false);
        const mensagem = err?.error?.message || 'Não foi possível salvar a nova ordem.';

        // No destroy o componente já saiu de cena: não há interface para desfazer.
        if (!opcoes.semDesfazer) {
          this.opcoes.aplicarItens(ordemAnterior);
          this.erro.set(mensagem);
          this.opcoes.aoFalhar?.(mensagem);
        }
      }
    });
  }
}

/**
 * Fábrica do estado de reordenação por troca com o vizinho, usado nas listas de
 * módulos (visualizar-idioma) e de frases (visualizar-modulo).
 */
@Injectable({ providedIn: 'root' })
export class ReordenacaoService {

  /**
   * Cria o estado de reordenação de uma lista.
   *
   * @param debounceMs janela para agrupar cliques seguidos numa só requisição.
   */
  criarEstado<T>(opcoes: OpcoesReordenacao<T>, debounceMs = 400): EstadoReordenacao<T> {
    return new EstadoReordenacao<T>(opcoes, debounceMs);
  }
}
