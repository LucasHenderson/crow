import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription, filter, forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Frase, PalavraTrad, Par } from '../../models/frase.model';
import { FraseService } from '../../services/frase.service';
import { ModuloService } from '../../services/modulo.service';
import { UploadService } from '../../services/upload.service';
import { IdiomaService } from '../../services/idioma.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-visualizar-modulo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-modulo.html',
  styleUrl: './visualizar-modulo.css',
})
export class VisualizarModulo implements OnInit, OnDestroy {

  moduloId: string = '';
  idIdioma: string = '';
  moduloNome: string = '';
  moduloIcone: SafeHtml = '';
  dataAtualizacao: string = '';
  /** Indica se o usuário logado é o dono do idioma (pode editar frases). */
  isProprietario = false;
  private navSub?: Subscription;

  private readonly iconesModo: Record<string, string> = {
    traducao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h12M10 3v2M7 16l4-9 4 9M6 13h8"/><path d="M15 17h7M18.5 14l3.5 7-3.5-7-3.5 7"/></svg>',
    pares: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  private readonly rawIcons: string[] = [
    `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    `<rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>`,
    `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
    `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    `<path d="M12 2L2 7l10 5 10-5-10-5z"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
    `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`,
    `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`,
    `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
    `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
    `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
    `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
    `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
    `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
    `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
    `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
    `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`
  ];
  
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

  // Controle de salvamento da edição
  salvandoEdicao = false;

  // Campos de edição - Tradução Direta
  imagemPreviewEdicao: string | null = null;
  imagemFileEdicao: File | null = null;
  traducaoCompletaEdicao = '';
  palavrasTraducaoEdicao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
  traducoesAlternativasEdicao: string[] = [];
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
  imagemQuizFileEdicao: File | null = null;
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

  carregando = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fraseService: FraseService,
    private moduloService: ModuloService,
    private uploadService: UploadService,
    private idiomaService: IdiomaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.lerParametrosECarregar();

    this.navSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(event => event.urlAfterRedirects.startsWith('/visualizar-modulo'))
    ).subscribe(() => this.lerParametrosECarregar());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private lerParametrosECarregar(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.moduloId = qp.get('id') || this.route.snapshot.paramMap.get('id') || '';
    this.idIdioma = qp.get('idIdioma') || '';
    this.verificarProprietario();
    this.carregarModulo();
    this.carregarFrases();
  }

  /**
   * Determina se o usuário logado é o proprietário do idioma. Apenas o dono
   * pode criar, editar ou excluir frases — visitantes têm acesso somente leitura.
   */
  private verificarProprietario(): void {
    this.isProprietario = false;
    if (!this.idIdioma) return;

    this.idiomaService.getIdiomaPorId(this.idIdioma).subscribe({
      next: (idioma) => {
        const user = this.authService.getCurrentUser();
        this.isProprietario = !!user && user.id === idioma.criadorId;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isProprietario = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarModulo(): void {
    if (!this.moduloId || !this.idIdioma) return;

    this.moduloService.getModulosPorIdioma(this.idIdioma).subscribe({
      next: (modulos) => {
        const m = modulos.find((mod: any) => String(mod.id) === String(this.moduloId));
        if (m) {
          this.moduloNome = m.nome || '';
          const total = this.rawIcons.length;
          const idNumerico = Number(m.id) || 1;
          const fallback = this.rawIcons[(((idNumerico - 1) % total) + total) % total];
          const iconRaw = (m.icone && m.icone.trim()) ? m.icone : fallback;
          this.moduloIcone = this.sanitizer.bypassSecurityTrustHtml(iconRaw);
          const dataReferencia = m.atualizadoEm || m.criadoEm;
          this.dataAtualizacao = dataReferencia
            ? this.formatarData(new Date(dataReferencia))
            : this.formatarData(new Date());
          this.cdr.detectChanges();
        }
      }
    });
  }

  carregarFrases(): void {
    if (!this.moduloId) return;
    this.carregando = true;

    this.fraseService.getFrasesPorModulo(this.moduloId).subscribe({
      next: (frases) => {
        this.frases = frases.map(f => this.enriquecerFrase(f));
        this.totalFrases = this.frases.length;
        this.calcularPaginacao();
        this.atualizarFrasesPaginadas();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private enriquecerFrase(f: any): Frase {
    const modoNomes: Record<string, string> = {
      'traducao': 'Tradução Direta',
      'pares': 'Selecionar Pares',
      'quiz': 'Quiz'
    };
    const modo = (f.modo || '').toLowerCase();

    const palavras = this.parseJson<PalavraTrad[]>(f.palavrasJson) || f.palavras;
    const traducoesAlternativas = this.parseJson<string[]>(f.traducoesAlternativasJson) || f.traducoesAlternativas;
    const links = this.parseJson<string[]>(f.linksJson) || f.links;
    const pares = this.parseJson<Par[]>(f.paresJson) || f.pares;
    const alternativas = this.parseJson<string[]>(f.alternativasJson) || f.alternativas;

    const videoQuiz = f.videoQuiz
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.toEmbedUrl(f.videoQuiz))
      : undefined;

    return {
      ...f,
      modo,
      modoNome: modoNomes[modo] || modo,
      modoIcone: this.sanitizer.bypassSecurityTrustHtml(this.iconesModo[modo] || ''),
      palavras,
      traducoesAlternativas,
      links,
      pares,
      alternativas,
      videoQuiz,
      videoQuizUrl: typeof f.videoQuiz === 'string' ? f.videoQuiz : undefined
    };
  }

  private parseJson<T>(value: any): T | undefined {
    if (!value || typeof value !== 'string') return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  private toEmbedUrl(url: string): string {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtube.com/watch')) {
      const m = url.match(/[?&]v=([^&]+)/);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
    if (url.includes('youtu.be/')) {
      const m = url.match(/youtu\.be\/([^?]+)/);
      if (m?.[1]) {
        const params = url.includes('?') ? url.substring(url.indexOf('?')) : '';
        return `https://www.youtube.com/embed/${m[1]}${params}`;
      }
    }
    return url;
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
    if (this.idIdioma) {
      this.router.navigate(['/visualizar-idioma'], { queryParams: { id: this.idIdioma } });
    } else {
      this.router.navigate(['/visualizar-idioma']);
    }
  }

  adicionarFrase(): void {
    this.router.navigate(['/cadastrar-frase'], {
      queryParams: { moduloId: this.moduloId, idIdioma: this.idIdioma }
    });
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
      this.traducoesAlternativasEdicao = frase.traducoesAlternativas ? [...frase.traducoesAlternativas] : [];
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
        this.videoQuizEdicao = frase.videoQuizUrl || '';
        this.onVideoQuizChangeEdicao(this.videoQuizEdicao);
      }
      this.perguntaQuizEdicao = frase.pergunta || '';
      this.alternativasEdicao = frase.alternativas ? [...frase.alternativas] : ['', ''];
      this.respostaCorretaEdicao = frase.respostaCorreta !== undefined ? frase.respostaCorreta : null;
    }
    
    this.mostrarModalEdicao = true;
  }

  salvarEdicao(): void {
    if (this.salvandoEdicao) return;

    if (!this.podeFinalizarEdicao()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.indiceEdicao < 0 || !this.fraseEmEdicao || !this.fraseEmEdicao.id) {
      alert('Não foi possível identificar a frase a ser editada.');
      return;
    }

    this.salvandoEdicao = true;

    // Primeiro envia as imagens pendentes, depois persiste a frase no backend.
    this.uploadImagensPendentesEdicao().subscribe({
      next: () => this.enviarEdicao(),
      error: () => {
        this.salvandoEdicao = false;
        this.cdr.detectChanges();
        alert('Erro ao enviar imagens. Tente novamente.');
      }
    });
  }

  /**
   * Faz upload das imagens recém-selecionadas (Files) e substitui os previews
   * (blob:) pelos caminhos definitivos retornados pelo backend.
   */
  private uploadImagensPendentesEdicao(): Observable<any> {
    const modo = this.fraseEmEdicao?.modo;
    const uploads: Observable<any>[] = [];

    if (modo === 'traducao' && this.imagemFileEdicao) {
      uploads.push(
        this.uploadService.uploadImagem(this.imagemFileEdicao).pipe(
          tap(res => {
            this.imagemPreviewEdicao = res.path;
            this.imagemFileEdicao = null;
          })
        )
      );
    }

    if (modo === 'pares') {
      this.paresEdicao.forEach((par, i) => {
        if (par.imagemFile) {
          uploads.push(
            this.uploadService.uploadImagem(par.imagemFile).pipe(
              tap(res => {
                this.paresEdicao[i].imagem = res.path;
                this.paresEdicao[i].imagemFile = undefined;
              })
            )
          );
        }
      });
    }

    if (modo === 'quiz' && this.tipoMidiaQuizEdicao === 'imagem' && this.imagemQuizFileEdicao) {
      uploads.push(
        this.uploadService.uploadImagem(this.imagemQuizFileEdicao).pipe(
          tap(res => {
            this.imagemQuizEdicao = res.path;
            this.imagemQuizFileEdicao = null;
          })
        )
      );
    }

    return uploads.length ? forkJoin(uploads) : of(null);
  }

  /** Monta o payload no formato esperado pelo backend (FraseRequest). */
  private getDadosEdicao(): any {
    const modo = this.fraseEmEdicao?.modo;

    if (modo === 'traducao') {
      return {
        modo,
        imagem: this.imagemPreviewEdicao || '',
        traducaoCompleta: this.traducaoCompletaEdicao,
        traducoesAlternativasJson: JSON.stringify(
          this.traducoesAlternativasEdicao.map(t => t.trim()).filter(t => t)
        ),
        palavrasJson: JSON.stringify(
          this.palavrasTraducaoEdicao.map(p => ({ palavra: p.palavra, traducao: p.traducao }))
        ),
        observacoes: this.observacoesEdicao || '',
        linksJson: JSON.stringify(this.linksEdicao.filter(l => l.trim()))
      };
    }

    if (modo === 'pares') {
      const paresLimpos = this.paresEdicao.map(p => ({
        imagem: p.imagem || '',
        palavra: p.palavra,
        traducao: p.traducao
      }));
      return { modo, paresJson: JSON.stringify(paresLimpos) };
    }

    if (modo === 'quiz') {
      return {
        modo,
        imagemQuiz: this.tipoMidiaQuizEdicao === 'imagem' ? (this.imagemQuizEdicao || '') : '',
        videoQuiz: this.tipoMidiaQuizEdicao === 'video' ? (this.videoQuizEdicao || '') : '',
        pergunta: this.perguntaQuizEdicao,
        alternativasJson: JSON.stringify(this.alternativasEdicao),
        respostaCorreta: this.respostaCorretaEdicao
      };
    }

    return { modo };
  }

  /** Persiste a edição via PUT e sincroniza o estado local com a resposta do backend. */
  private enviarEdicao(): void {
    const frase = this.fraseEmEdicao!;
    const dados = this.getDadosEdicao();

    this.fraseService.editarFrase(this.moduloId, frase.id!, dados).subscribe({
      next: (resp) => {
        const fraseAtualizada = this.enriquecerFrase(resp);
        if (this.indiceEdicao >= 0) {
          this.frases[this.indiceEdicao] = fraseAtualizada;
        }
        this.atualizarFrasesPaginadas();
        this.carregarModulo();
        this.salvandoEdicao = false;
        const nome = fraseAtualizada.modoNome;
        this.fecharModalEdicao();
        this.exibirMensagemSucesso(`Frase "${nome}" editada com sucesso!`);
      },
      error: () => {
        this.salvandoEdicao = false;
        this.cdr.detectChanges();
        alert('Erro ao salvar as alterações. Tente novamente.');
      }
    });
  }

  private revogarBlob(url: string | null | undefined): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  fecharModalEdicao(): void {
    this.mostrarModalEdicao = false;
    this.fraseEmEdicao = null;
    this.indiceEdicao = -1;
    this.salvandoEdicao = false;
    this.limparCamposEdicao();
  }

  limparCamposEdicao(): void {
    // Tradução Direta
    this.revogarBlob(this.imagemPreviewEdicao);
    this.imagemPreviewEdicao = null;
    this.imagemFileEdicao = null;
    this.traducaoCompletaEdicao = '';
    this.palavrasTraducaoEdicao = [{ palavra: '', traducao: '' }];
    this.traducoesAlternativasEdicao = [];
    this.observacoesEdicao = '';
    this.linksEdicao = [''];

    // Selecionar Pares
    this.paresEdicao.forEach(p => this.revogarBlob(p.imagem));
    this.paresEdicao = [
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' }
    ];

    // Quiz
    this.tipoMidiaQuizEdicao = null;
    this.revogarBlob(this.imagemQuizEdicao);
    this.imagemQuizEdicao = null;
    this.imagemQuizFileEdicao = null;
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

  adicionarTraducaoAltEdicao(): void {
    if (this.traducoesAlternativasEdicao.length < 5) {
      this.traducoesAlternativasEdicao.push('');
    }
  }

  removerTraducaoAltEdicao(index: number): void {
    this.traducoesAlternativasEdicao.splice(index, 1);
  }

  onImagemSelecionadaEdicao(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.revogarBlob(this.imagemPreviewEdicao);
    this.imagemFileEdicao = file;
    this.imagemPreviewEdicao = URL.createObjectURL(file);
    this.cdr.detectChanges();
  }

  removerImagemEdicao(event: Event): void {
    event.stopPropagation();
    this.revogarBlob(this.imagemPreviewEdicao);
    this.imagemPreviewEdicao = null;
    this.imagemFileEdicao = null;
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

    this.revogarBlob(this.paresEdicao[index].imagem);
    this.paresEdicao[index].imagemFile = file;
    this.paresEdicao[index].imagem = URL.createObjectURL(file);
    this.cdr.detectChanges();
  }

  removerImagemParEdicao(event: Event, index: number): void {
    event.stopPropagation();
    this.revogarBlob(this.paresEdicao[index].imagem);
    this.paresEdicao[index].imagem = undefined;
    this.paresEdicao[index].imagemFile = undefined;
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
    this.revogarBlob(this.imagemQuizEdicao);
    this.imagemQuizFileEdicao = file;
    this.imagemQuizEdicao = URL.createObjectURL(file);
    this.cdr.detectChanges();
  }

  removerImagemQuizEdicao(event: Event): void {
    event.stopPropagation();
    this.revogarBlob(this.imagemQuizEdicao);
    this.imagemQuizEdicao = null;
    this.imagemQuizFileEdicao = null;
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
    if (this.indiceExclusao >= 0 && this.fraseEmExclusao && this.fraseEmExclusao.id) {
      const modoNome = this.fraseEmExclusao.modoNome;
      const ehUltimaFrase = this.totalFrases <= 1;

      this.fraseService.excluirFrase(this.moduloId, this.fraseEmExclusao.id).subscribe({
        next: () => {
          if (ehUltimaFrase) {
            this.moduloService.excluirModulo(this.idIdioma, Number(this.moduloId)).subscribe({
              next: () => {
                this.fecharModalExclusao();
                this.router.navigate(['/visualizar-idioma'], {
                  queryParams: { id: this.idIdioma }
                });
              },
              error: () => {
                this.fecharModalExclusao();
              }
            });
            return;
          }

          this.frases.splice(this.indiceExclusao, 1);
          this.totalFrases = this.frases.length;
          this.calcularPaginacao();
          if (this.frasesPaginadas.length === 1 && this.paginaAtual > 1) {
            this.paginaAtual--;
          }
          this.atualizarFrasesPaginadas();
          this.carregarModulo();
          this.fecharModalExclusao();
          this.exibirMensagemSucesso(`Frase "${modoNome}" excluída com sucesso!`);
        },
        error: () => {
          this.fecharModalExclusao();
        }
      });
    }
  }

  fecharModalExclusao(): void {
    this.mostrarModalExclusao = false;
    this.fraseEmExclusao = null;
    this.indiceExclusao = -1;
    this.numeroFraseExclusao = 0;
  }
}