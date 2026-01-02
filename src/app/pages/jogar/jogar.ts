import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface PalavraTrad {
  palavra: string;
  traducao: string;
  usado?: boolean;
}

interface Par {
  imagem?: string;
  palavra: string;
  traducao: string;
}

interface Frase {
  modo: 'traducao' | 'pares' | 'quiz';
  
  // Tradução Direta
  traducaoCompleta?: string;
  palavras?: PalavraTrad[];
  imagem?: string;
  observacoes?: string;
  links?: string[];
  
  // Selecionar Pares
  pares?: Par[];
  
  // Quiz
  imagemQuiz?: string;
  videoQuiz?: SafeResourceUrl;
  pergunta?: string;
  alternativas?: string[];
  respostaCorretaIndex?: number;
}

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
export class Jogar implements OnInit {
  
  // Controle do jogo
  etapaAtual: number = 1;
  totalEtapas: number = 15;
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
  
  // Modo: Quiz
  alternativaSelecionada: number | null = null;
  
  // Resultados finais
  porcentagemAcertos: number = 0;
  circumference: number = 2 * Math.PI * 90;
  progressOffset: number = this.circumference;

  modulosSelecionados: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
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

  carregarFrases(): void {
    // Simulação de frases - aqui você buscaria do backend
    const todasFrases: Frase[] = [
      // Tradução Direta
      {
        modo: 'traducao',
        traducaoCompleta: 'Bom dia! Como você está?',
        palavras: [
          { palavra: 'Bom dia', traducao: 'Good morning' },
          { palavra: 'Como você está', traducao: 'How are you' }
        ],
        imagem: '',
        observacoes: 'Saudação formal comum',
        links: ['https://exemplo.com/saudacoes']
      },
      // Pares
      {
        modo: 'pares',
        pares: [
          { palavra: 'Gato', traducao: 'Cat', imagem: 'assets/imgs/cat.jpg' },
          { palavra: 'Cachorro', traducao: 'Dog', imagem: 'assets/imgs/dog.jpg' },
          { palavra: 'Pássaro', traducao: 'Bird' }
        ]
      },
      // Quiz
      {
        modo: 'quiz',
        imagemQuiz: '',
        pergunta: 'Qual é a tradução de "Hello"?',
        alternativas: ['Olá', 'Tchau', 'Bom dia', 'Boa noite'],
        respostaCorretaIndex: 0
      }
      // ... adicione mais frases para completar 15
    ];
    
    // Sorteia 15 frases aleatórias
    this.frases = this.sortearFrases(todasFrases, 15);
  }

  sortearFrases(frases: Frase[], quantidade: number): Frase[] {
    const embaralhadas = [...frases].sort(() => Math.random() - 0.5);
    return embaralhadas.slice(0, Math.min(quantidade, embaralhadas.length));
  }

  iniciarJogo(): void {
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
    if (this.paresSelecionados[this.traducaoSelecionada!] === index) return;
    
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
      const alternativaCorreta = this.fraseAtual!.alternativas![this.fraseAtual!.respostaCorretaIndex!];
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
    this.jogoFinalizado = true;
    this.calcularResultadosFinais();
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

  Object = Object;
}