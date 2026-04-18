import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Frase, PalavraTrad, Par } from '../../models/frase.model';
import { FraseService } from '../../services/frase.service';

interface HistoricoResposta {
  correto: boolean;
  texto: string;
}

@Component({
  selector: 'app-jogar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jogar.html',
  styleUrl: './jogar.css',
})
export class Jogar implements OnInit, OnDestroy {
  
  // Controle do jogo
  etapaAtual: number = 1;
  totalEtapas: number = 4;
  frases: Frase[] = [];
  fraseAtual: Frase | null = null;
  
  // Pontuação
  acertos: number = 0;
  erros: number = 0;
  historicoRespostas: HistoricoResposta[] = [];
  
  // Controle de exibição
  mostrarInfo: boolean = false;
  mostrarResultado: boolean = false;
  respostaCorreta: boolean = false;
  mensagemErro: string = '';
  respostaCorretaTexto: string = '';
  jogoFinalizado: boolean = false;
  
  // Modo: Tradução Direta
  palavrasEmbaralhadas: PalavraTrad[] = [];
  palavrasSelecionadas: (PalavraTrad | null)[] = [];
  
  // Modo: Selecionar Pares
  palavraSelecionada: number | null = null;
  traducaoSelecionada: number | null = null;
  paresSelecionados: { [key: number]: number } = {};
  traducoesEmbaralhadas: Par[] = [];
  paresEmbaralhados: Par[] = [];
  coresPares: string[] = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#a855f7'
  ];
  
  // Modo: Quiz
  alternativaSelecionada: number | null = null;
  
  // Resultados finais
  porcentagemAcertos: number = 0;
  circumference: number = 2 * Math.PI * 90;
  progressOffset: number = this.circumference;

  modulosSelecionados: string[] = [];

  // Timer
  tempoInicio: number = 0;
  tempoFim: number = 0;
  tempoTotalSegundos: number = 0;
  tempoFormatado: string = '';

  carregando = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private fraseService: FraseService
  ) {}

  ngOnInit(): void {
    // Recebe os módulos selecionados da rota
    this.route.queryParams.subscribe(params => {
      if (params['modulos']) {
        this.modulosSelecionados = JSON.parse(params['modulos']);
      }
    });
    
    // Carrega e sorteia as frases
    this.carregarFrases();
    this.iniciarJogo();
  }

  ngOnDestroy(): void {
    // Limpa recursos se necessário
  }

  carregarFrases(): void {
    if (this.modulosSelecionados.length === 0) return;

    this.carregando = true;
    this.fraseService.getFrasesParaJogo(this.modulosSelecionados).subscribe({
      next: (frases) => {
        const preparadas = frases.map(f => ({
          ...f,
          respostaCorretaIndex: f.respostaCorreta,
          respostaCorretaTexto: f.alternativas ? f.alternativas[f.respostaCorreta || 0] : ''
        }));
        this.frases = preparadas.sort(() => Math.random() - 0.5);
        this.totalEtapas = this.frases.length;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  sortearFrases(frases: Frase[], quantidade: number): Frase[] {
    const embaralhadas = [...frases].sort(() => Math.random() - 0.5);
    return embaralhadas.slice(0, Math.min(quantidade, embaralhadas.length));
  }

  iniciarJogo(): void {
    // Marca o tempo de início
    this.tempoInicio = Date.now();
    
    if (this.frases.length > 0) {
      this.carregarFrase(0);
    }
  }

  carregarFrase(index: number): void {
    this.fraseAtual = this.frases[index];
    this.resetarEstados();
    
    if (this.fraseAtual.modo === 'traducao') {
      this.prepararTraducao();
    } else if (this.fraseAtual.modo === 'pares') {
      this.prepararPares();
    } else if (this.fraseAtual.modo === 'quiz') {
      this.prepararQuiz();
    }
  }

  prepararQuiz(): void {
    if (this.fraseAtual && this.fraseAtual.alternativas) {
      const indicesOriginais = this.fraseAtual.alternativas.map((_, i) => i);
      const indicesEmbaralhados = [...indicesOriginais].sort(() => Math.random() - 0.5);
      
      this.fraseAtual.alternativasEmbaralhadas = indicesEmbaralhados.map(
        i => this.fraseAtual!.alternativas![i]
      );
      
      const respostaOriginal = this.fraseAtual.alternativas[this.fraseAtual.respostaCorretaIndex!];
      this.fraseAtual.respostaCorretaIndex = this.fraseAtual.alternativasEmbaralhadas.indexOf(respostaOriginal);
    }
  }

  prepararTraducao(): void {
    if (this.fraseAtual && this.fraseAtual.palavras) {
      this.palavrasEmbaralhadas = this.fraseAtual.palavras
        .map(p => ({ ...p, usado: false }))
        .sort(() => Math.random() - 0.5);
      
      this.palavrasSelecionadas = new Array(this.fraseAtual.palavras.length).fill(null);
    }
  }

  prepararPares(): void {
    if (this.fraseAtual && this.fraseAtual.pares) {
      this.paresEmbaralhados = [...this.fraseAtual.pares].sort(() => Math.random() - 0.5);
      this.traducoesEmbaralhadas = [...this.fraseAtual.pares].sort(() => Math.random() - 0.5);
      this.paresSelecionados = {};
    }
  }

  resetarEstados(): void {
    this.mostrarInfo = false;
    this.mostrarResultado = false;
    this.palavraSelecionada = null;
    this.traducaoSelecionada = null;
    this.alternativaSelecionada = null;
  }

  // TRADUÇÃO DIRETA
  selecionarPalavra(palavra: PalavraTrad, index: number): void {
    const proximoSlot = this.palavrasSelecionadas.findIndex(p => p === null);
    if (proximoSlot !== -1) {
      this.palavrasSelecionadas[proximoSlot] = palavra;
      this.palavrasEmbaralhadas[index].usado = true;
    }
  }

  removerPalavra(index: number): void {
    const palavra = this.palavrasSelecionadas[index];
    if (palavra) {
      const indexOriginal = this.palavrasEmbaralhadas.findIndex(p => p === palavra);
      if (indexOriginal !== -1) {
        this.palavrasEmbaralhadas[indexOriginal].usado = false;
      }
      this.palavrasSelecionadas[index] = null;
    }
  }

  // SELECIONAR PARES
  selecionarPalavraColuna(index: number): void {
    const jaConectada = Object.keys(this.paresSelecionados).find(
      key => this.paresSelecionados[+key] === index
    );
    
    if (jaConectada) return;
    
    this.palavraSelecionada = index;
    
    if (this.traducaoSelecionada !== null) {
      this.paresSelecionados[this.traducaoSelecionada] = index;
      this.palavraSelecionada = null;
      this.traducaoSelecionada = null;
    }
  }

  selecionarTraducaoColuna(index: number): void {
    if (this.paresSelecionados[index] !== undefined) return;
    
    this.traducaoSelecionada = index;
    
    if (this.palavraSelecionada !== null) {
      this.paresSelecionados[index] = this.palavraSelecionada;
      this.palavraSelecionada = null;
      this.traducaoSelecionada = null;
    }
  }

  removerConexao(key: string): void {
    delete this.paresSelecionados[+key];
  }

  // QUIZ
  selecionarAlternativa(index: number): void {
    this.alternativaSelecionada = index;
  }

  // VERIFICAÇÃO
  podeVerificar(): boolean {
    if (!this.fraseAtual) return false;
    
    if (this.fraseAtual.modo === 'traducao') {
      return this.palavrasSelecionadas.every(p => p !== null);
    } else if (this.fraseAtual.modo === 'pares') {
      return Object.keys(this.paresSelecionados).length === this.fraseAtual.pares!.length;
    } else if (this.fraseAtual.modo === 'quiz') {
      return this.alternativaSelecionada !== null;
    }
    
    return false;
  }

  verificarResposta(): void {
    if (!this.fraseAtual) return;
    
    if (this.fraseAtual.modo === 'traducao') {
      this.verificarTraducao();
    } else if (this.fraseAtual.modo === 'pares') {
      this.verificarPares();
    } else if (this.fraseAtual.modo === 'quiz') {
      this.verificarQuiz();
    }
    
    this.mostrarResultado = true;
  }

  verificarTraducao(): void {
    const ordemCorreta = this.fraseAtual!.palavras!.map(p => p.traducao);
    const ordemUsuario = this.palavrasSelecionadas.map(p => p!.traducao);
    
    this.respostaCorreta = JSON.stringify(ordemCorreta) === JSON.stringify(ordemUsuario);
    
    if (this.respostaCorreta) {
      this.acertos++;
      this.historicoRespostas.push({
        correto: true,
        texto: `Tradução: ${this.fraseAtual!.traducaoCompleta}`
      });
    } else {
      this.erros++;
      this.mensagemErro = 'A ordem das palavras está incorreta.';
      this.respostaCorretaTexto = ordemCorreta.join(' → ');
      this.historicoRespostas.push({
        correto: false,
        texto: `Tradução: ${this.fraseAtual!.traducaoCompleta} (Ordem incorreta)`
      });
    }
  }

  verificarPares(): void {
    let todosCorretos = true;
    const erros: string[] = [];
    
    Object.keys(this.paresSelecionados).forEach(traducaoIndex => {
      const palavraIndex = this.paresSelecionados[+traducaoIndex];
      const traducaoEscolhida = this.traducoesEmbaralhadas[+traducaoIndex];
      const palavraEscolhida = this.paresEmbaralhados[palavraIndex];
      
      const parOriginal = this.fraseAtual!.pares!.find(
        p => p.palavra === palavraEscolhida.palavra
      );
      
      if (parOriginal?.traducao !== traducaoEscolhida.traducao) {
        todosCorretos = false;
        erros.push(`${palavraEscolhida.palavra} → ${parOriginal!.traducao}`);
      }
    });
    
    this.respostaCorreta = todosCorretos;
    
    if (this.respostaCorreta) {
      this.acertos++;
      this.historicoRespostas.push({
        correto: true,
        texto: 'Pares: Todos os pares conectados corretamente'
      });
    } else {
      this.erros++;
      this.mensagemErro = 'Alguns pares estão incorretos.';
      this.respostaCorretaTexto = erros.join(', ');
      this.historicoRespostas.push({
        correto: false,
        texto: 'Pares: Conexões incorretas'
      });
    }
  }

  verificarQuiz(): void {
    this.respostaCorreta = this.alternativaSelecionada === this.fraseAtual!.respostaCorretaIndex;
    
    if (this.respostaCorreta) {
      this.acertos++;
      this.historicoRespostas.push({
        correto: true,
        texto: `Quiz: ${this.fraseAtual!.pergunta}`
      });
    } else {
      this.erros++;
      const alternativaCorreta = this.fraseAtual!.alternativasEmbaralhadas![this.fraseAtual!.respostaCorretaIndex!];
      const letra = this.getLetraAlternativa(this.fraseAtual!.respostaCorretaIndex!);
      this.mensagemErro = 'Alternativa incorreta.';
      this.respostaCorretaTexto = `${letra}) ${alternativaCorreta}`;
      this.historicoRespostas.push({
        correto: false,
        texto: `Quiz: ${this.fraseAtual!.pergunta} (Resposta incorreta)`
      });
    }
  }

  proximaEtapa(): void {
    this.mostrarResultado = false;
    
    if (this.etapaAtual < this.totalEtapas) {
      this.etapaAtual++;
      this.carregarFrase(this.etapaAtual - 1);
    } else {
      this.finalizarJogo();
    }
  }

  finalizarJogo(): void {
    // Marca o tempo de fim
    this.tempoFim = Date.now();
    
    // Calcula o tempo total em segundos
    this.tempoTotalSegundos = Math.floor((this.tempoFim - this.tempoInicio) / 1000);
    
    // Formata o tempo
    this.tempoFormatado = this.formatarTempo(this.tempoTotalSegundos);
    
    this.jogoFinalizado = true;
    this.calcularResultadosFinais();
  }

  formatarTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`;
    } else {
      return `${segs}s`;
    }
  }

  calcularResultadosFinais(): void {
    this.porcentagemAcertos = Math.round((this.acertos / this.totalEtapas) * 100);
    const percentage = this.porcentagemAcertos / 100;
    this.progressOffset = this.circumference - (percentage * this.circumference);
  }

  jogarNovamente(): void {
    this.etapaAtual = 1;
    this.acertos = 0;
    this.erros = 0;
    this.historicoRespostas = [];
    this.jogoFinalizado = false;
    this.tempoInicio = 0;
    this.tempoFim = 0;
    this.tempoTotalSegundos = 0;
    this.tempoFormatado = '';
    
    this.carregarFrases();
    this.iniciarJogo();
  }

  voltarAoIdioma(): void {
    this.router.navigate(['/visualizar-idioma']);
  }

  toggleInfo(): void {
    this.mostrarInfo = !this.mostrarInfo;
  }

  fecharModal(): void {
    // Não fecha ao clicar no overlay
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getConexoesKeys(): string[] {
    return Object.keys(this.paresSelecionados);
  }

  getCorConexaoPalavra(indexPalavra: number): string | null {
    const traducaoIndex = Object.keys(this.paresSelecionados).find(
      key => this.paresSelecionados[+key] === indexPalavra
    );
    
    if (traducaoIndex !== undefined) {
      const ordemConexao = this.getConexoesKeys().indexOf(traducaoIndex);
      return this.coresPares[ordemConexao];
    }
    
    return null;
  }

  getCorConexaoTraducao(indexTraducao: number): string | null {
    if (this.paresSelecionados[indexTraducao] !== undefined) {
      const ordemConexao = this.getConexoesKeys().indexOf(String(indexTraducao));
      return this.coresPares[ordemConexao];
    }
    
    return null;
  }

  Object = Object;
}