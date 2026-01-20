import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

interface PalavraTrad {
  palavra: string;
  traducao: string;
}

interface Par {
  imagem?: string;
  palavra: string;
  traducao: string;
}

interface Frase {
  id: number;
  modo: 'traducao' | 'pares' | 'quiz';
  modoNome: string;
  modoIcone: SafeHtml;
  
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
  respostaCorreta?: number;
}

@Component({
  selector: 'app-visualizar-modulo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-modulo.html',
  styleUrl: './visualizar-modulo.css',
})
export class VisualizarModulo implements OnInit {
  
  moduloId: string = '';
  moduloNome: string = 'Saudações Básicas';
  moduloIcone: SafeHtml = '';
  dataAtualizacao: string = '';
  
  frases: Frase[] = [];
  frasesPaginadas: Frase[] = [];
  totalFrases: number = 0;
  
  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalPaginas: number = 0;

  // ===== MENSAGEM DE SUCESSO =====
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';

  // ===== MODAL DE EDIÇÃO =====
  mostrarModalEdicao = false;
  fraseEmEdicao: Frase | null = null;
  indiceEdicao = -1;

  // Campos de edição - Tradução Direta
  imagemPreviewEdicao: string | null = null;
  traducaoCompletaEdicao = '';
  palavrasTraducaoEdicao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
  observacoesEdicao = '';
  linksEdicao: string[] = [''];

  // Campos de edição - Selecionar Pares
  paresEdicao: Par[] = [
    { palavra: '', traducao: '' },
    { palavra: '', traducao: '' },
    { palavra: '', traducao: '' }
  ];

  // Campos de edição - Quiz
  tipoMidiaQuizEdicao: 'imagem' | 'video' | null = null;
  imagemQuizEdicao: string | null = null;
  videoQuizEdicao = '';
  videoQuizEmbedEdicao: SafeResourceUrl | null = null;
  perguntaQuizEdicao = '';
  alternativasEdicao: string[] = ['', ''];
  respostaCorretaEdicao: number | null = null;

  // ===== MODAL DE EXCLUSÃO =====
  mostrarModalExclusao = false;
  fraseEmExclusao: Frase | null = null;
  indiceExclusao = -1;
  numeroFraseExclusao = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.moduloId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarModulo();
    this.carregarFrases();
    this.dataAtualizacao = this.formatarData(new Date());
  }

  @HostListener('document:click', ['$event'])
  fecharDropdowns(event: MouseEvent): void {
    if (!this.mostrarModalEdicao) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.campo')) {
      // Fechar dropdowns se houver
    }
  }

  carregarModulo(): void {
    const iconeSVG = '<svg _ngcontent-ng-c1290226930="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    this.moduloIcone = this.sanitizer.bypassSecurityTrustHtml(iconeSVG);
  }

  carregarFrases(): void {
    this.frases = [
      {
        id: 1,
        modo: 'traducao',
        modoNome: 'Tradução Direta',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h8M9 7v1M12 15l-2-2 2-2M17 15l2-2-2-2"/><rect x="14" y="10" width="7" height="10" rx="1"/></svg>'),
        traducaoCompleta: 'Bom dia! Como você está?',
        palavras: [
          { palavra: 'Bom dia', traducao: 'Good morning' },
          { palavra: 'Como você está?', traducao: 'How are you?' }
        ],
        imagem: '../../../assets/imgs/United-States-Flag.svg',
        observacoes: 'Expressão formal comum em contextos profissionais.',
        links: ['https://www.exemplo.com/artigo1', 'https://www.exemplo.com/artigo2']
      },
      {
        id: 2,
        modo: 'pares',
        modoNome: 'Selecionar Pares',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'),
        pares: [
          { palavra: 'Gato', traducao: 'Cat', imagem: '../../../assets/imgs/logo.png' },
          { palavra: 'Cachorro', traducao: 'Dog', imagem: '../../../assets/imgs/United-States-Flag.svg' },
          { palavra: 'Pássaro', traducao: 'Bird' }
        ]
      },
      {
        id: 3,
        modo: 'quiz',
        modoNome: 'Quiz',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'),
        imagemQuiz: '../../../assets/imgs/Brazil-Flag.svg',
        pergunta: 'Qual é a tradução correta de "Hello" em português?',
        alternativas: ['Olá', 'Tchau', 'Bom dia', 'Boa noite'],
        respostaCorreta: 0
      }
    ];

    this.totalFrases = this.frases.length;
    this.calcularPaginacao();
    this.atualizarFrasesPaginadas();
  }

  calcularPaginacao(): void {
    this.totalPaginas = Math.ceil(this.totalFrases / this.itensPorPagina);
  }

  atualizarFrasesPaginadas(): void {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.frasesPaginadas = this.frases.slice(inicio, fim);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.atualizarFrasesPaginadas();
    }
  }

  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisiveis = 5;
    
    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginasVisiveis - 1);
    
    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  getNumeroFrase(indexPagina: number): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + indexPagina + 1;
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }

  voltarParaLista(): void {
    this.router.navigate(['/visualizar-idioma']);
  }

  adicionarFrase(): void {
    this.router.navigate(['/cadastrar-frase']);
  }

  // ===== MENSAGEM DE SUCESSO =====
  
  exibirMensagemSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mostrarMensagemSucesso = true;
    
    // Força a detecção de mudanças para garantir que o texto seja exibido imediatamente
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.mostrarMensagemSucesso = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }

  // ===== FUNÇÕES DE EDIÇÃO =====

  editarFrase(frase: Frase, index: number): void {
    this.fraseEmEdicao = { ...frase };
    this.indiceEdicao = this.frases.findIndex(f => f.id === frase.id);
    
    // Limpa os campos primeiro
    this.limparCamposEdicao();
    
    // Preenche os campos conforme o modo
    if (frase.modo === 'traducao') {
      this.traducaoCompletaEdicao = frase.traducaoCompleta || '';
      this.palavrasTraducaoEdicao = frase.palavras ? JSON.parse(JSON.stringify(frase.palavras)) : [{ palavra: '', traducao: '' }];
      this.imagemPreviewEdicao = frase.imagem || null;
      this.observacoesEdicao = frase.observacoes || '';
      this.linksEdicao = frase.links && frase.links.length > 0 ? [...frase.links] : [''];
    } else if (frase.modo === 'pares') {
      this.paresEdicao = frase.pares ? JSON.parse(JSON.stringify(frase.pares)) : [
        { palavra: '', traducao: '' },
        { palavra: '', traducao: '' },
        { palavra: '', traducao: '' }
      ];
    } else if (frase.modo === 'quiz') {
      if (frase.imagemQuiz) {
        this.tipoMidiaQuizEdicao = 'imagem';
        this.imagemQuizEdicao = frase.imagemQuiz;
      } else if (frase.videoQuiz) {
        this.tipoMidiaQuizEdicao = 'video';
        this.videoQuizEdicao = typeof frase.videoQuiz === 'string' ? frase.videoQuiz : '';
        this.videoQuizEmbedEdicao = frase.videoQuiz;
      }
      this.perguntaQuizEdicao = frase.pergunta || '';
      this.alternativasEdicao = frase.alternativas ? [...frase.alternativas] : ['', ''];
      this.respostaCorretaEdicao = frase.respostaCorreta !== undefined ? frase.respostaCorreta : null;
    }
    
    this.mostrarModalEdicao = true;
  }

  salvarEdicao(): void {
    if (!this.podeFinalizarEdicao()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (this.indiceEdicao >= 0 && this.fraseEmEdicao) {
      const fraseAtualizada = { ...this.fraseEmEdicao };
      
      if (fraseAtualizada.modo === 'traducao') {
        fraseAtualizada.traducaoCompleta = this.traducaoCompletaEdicao;
        fraseAtualizada.palavras = JSON.parse(JSON.stringify(this.palavrasTraducaoEdicao));
        fraseAtualizada.imagem = this.imagemPreviewEdicao || undefined;
        fraseAtualizada.observacoes = this.observacoesEdicao;
        fraseAtualizada.links = this.linksEdicao.filter(l => l.trim());
      } else if (fraseAtualizada.modo === 'pares') {
        fraseAtualizada.pares = JSON.parse(JSON.stringify(this.paresEdicao));
      } else if (fraseAtualizada.modo === 'quiz') {
        fraseAtualizada.imagemQuiz = this.tipoMidiaQuizEdicao === 'imagem' ? this.imagemQuizEdicao || undefined : undefined;
        fraseAtualizada.videoQuiz = this.tipoMidiaQuizEdicao === 'video' ? this.videoQuizEmbedEdicao || undefined : undefined;
        fraseAtualizada.pergunta = this.perguntaQuizEdicao;
        fraseAtualizada.alternativas = [...this.alternativasEdicao];
        fraseAtualizada.respostaCorreta = this.respostaCorretaEdicao !== null ? this.respostaCorretaEdicao : undefined;
      }
      
      this.frases[this.indiceEdicao] = fraseAtualizada;
      this.atualizarFrasesPaginadas();
      
      console.log('Frase editada com sucesso:', fraseAtualizada);
      this.fecharModalEdicao();
      this.exibirMensagemSucesso(`Frase "${fraseAtualizada.modoNome}" editada com sucesso!`);
    }
  }

  fecharModalEdicao(): void {
    this.mostrarModalEdicao = false;
    this.fraseEmEdicao = null;
    this.indiceEdicao = -1;
    this.limparCamposEdicao();
  }

  limparCamposEdicao(): void {
    // Tradução Direta
    this.imagemPreviewEdicao = null;
    this.traducaoCompletaEdicao = '';
    this.palavrasTraducaoEdicao = [{ palavra: '', traducao: '' }];
    this.observacoesEdicao = '';
    this.linksEdicao = [''];
    
    // Selecionar Pares
    this.paresEdicao = [
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' }
    ];
    
    // Quiz
    this.tipoMidiaQuizEdicao = null;
    this.imagemQuizEdicao = null;
    this.videoQuizEdicao = '';
    this.videoQuizEmbedEdicao = null;
    this.perguntaQuizEdicao = '';
    this.alternativasEdicao = ['', ''];
    this.respostaCorretaEdicao = null;
  }

  podeFinalizarEdicao(): boolean {
    if (!this.fraseEmEdicao) return false;

    if (this.fraseEmEdicao.modo === 'traducao') {
      const palavrasValidas = this.palavrasTraducaoEdicao.every(p => p.palavra.trim() && p.traducao.trim());
      return !!(this.traducaoCompletaEdicao.trim() && palavrasValidas);
    }

    if (this.fraseEmEdicao.modo === 'pares') {
      return this.paresEdicao.every(p => p.palavra.trim() && p.traducao.trim());
    }

    if (this.fraseEmEdicao.modo === 'quiz') {
      const alternativasValidas = this.alternativasEdicao.every(a => a.trim());
      return !!(this.perguntaQuizEdicao.trim() && alternativasValidas && this.respostaCorretaEdicao !== null);
    }

    return false;
  }

  // Funções auxiliares para edição - Tradução Direta
  adicionarPalavraEdicao(): void {
    this.palavrasTraducaoEdicao.push({ palavra: '', traducao: '' });
  }

  removerPalavraEdicao(index: number): void {
    this.palavrasTraducaoEdicao.splice(index, 1);
  }

  adicionarLinkEdicao(): void {
    if (this.linksEdicao.length < 3) {
      this.linksEdicao.push('');
    }
  }

  removerLinkEdicao(index: number): void {
    this.linksEdicao.splice(index, 1);
  }

  onImagemSelecionadaEdicao(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagemPreviewEdicao = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removerImagemEdicao(event: Event): void {
    event.stopPropagation();
    this.imagemPreviewEdicao = null;
  }

  // Funções auxiliares para edição - Selecionar Pares
  adicionarParEdicao(): void {
    if (this.paresEdicao.length < 10) {
      this.paresEdicao.push({ palavra: '', traducao: '' });
    }
  }

  removerParEdicao(index: number): void {
    if (this.paresEdicao.length > 3) {
      this.paresEdicao.splice(index, 1);
    }
  }

  onParImagemSelecionadaEdicao(event: any, index: number): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.paresEdicao[index].imagem = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removerImagemParEdicao(event: Event, index: number): void {
    event.stopPropagation();
    this.paresEdicao[index].imagem = undefined;
  }

  // Funções auxiliares para edição - Quiz
  adicionarAlternativaEdicao(): void {
    if (this.alternativasEdicao.length < 5) {
      this.alternativasEdicao.push('');
    }
  }

  removerAlternativaEdicao(index: number): void {
    if (this.alternativasEdicao.length > 2) {
      this.alternativasEdicao.splice(index, 1);
      if (this.respostaCorretaEdicao === index) {
        this.respostaCorretaEdicao = null;
      } else if (this.respostaCorretaEdicao !== null && this.respostaCorretaEdicao > index) {
        this.respostaCorretaEdicao--;
      }
    }
  }

  marcarRespostaCorretaEdicao(index: number): void {
    this.respostaCorretaEdicao = index;
  }

  onQuizImagemSelecionadaEdicao(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imagemQuizEdicao = reader.result as string;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  removerImagemQuizEdicao(event: Event): void {
    event.stopPropagation();
    this.imagemQuizEdicao = null;
  }

  onVideoQuizChangeEdicao(url: string): void {
    if (!url || !url.trim()) {
      this.videoQuizEmbedEdicao = null;
      return;
    }

    let embedUrl = '';

    if (url.includes('youtube.com/embed/')) {
      embedUrl = url;
    } else if (url.includes('youtube.com/watch')) {
      const videoIdMatch = url.match(/[?&]v=([^&]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    } else if (url.includes('youtu.be/')) {
      const videoIdMatch = url.match(/youtu\.be\/([^?]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        const params = url.includes('?') ? url.substring(url.indexOf('?')) : '';
        embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}${params}`;
      }
    }

    if (!embedUrl) {
      this.videoQuizEmbedEdicao = null;
      return;
    }

    this.videoQuizEmbedEdicao = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ===== FUNÇÕES DE EXCLUSÃO =====

  excluirFrase(frase: Frase, index: number): void {
    this.fraseEmExclusao = frase;
    this.indiceExclusao = this.frases.findIndex(f => f.id === frase.id);
    this.numeroFraseExclusao = this.getNumeroFrase(index);
    this.mostrarModalExclusao = true;
  }

  confirmarExclusao(): void {
    if (this.indiceExclusao >= 0 && this.fraseEmExclusao) {
      const modoNome = this.fraseEmExclusao.modoNome;
      this.frases.splice(this.indiceExclusao, 1);
      this.totalFrases = this.frases.length;
      
      this.calcularPaginacao();
      
      if (this.frasesPaginadas.length === 1 && this.paginaAtual > 1) {
        this.paginaAtual--;
      }
      
      this.atualizarFrasesPaginadas();
      
      console.log(`Frase excluída com sucesso`);
      this.fecharModalExclusao();
      this.exibirMensagemSucesso(`Frase "${modoNome}" excluída com sucesso!`);
    }
  }

  fecharModalExclusao(): void {
    this.mostrarModalExclusao = false;
    this.fraseEmExclusao = null;
    this.indiceExclusao = -1;
    this.numeroFraseExclusao = 0;
  }
}