import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription, filter, forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Frase, PalavraTrad, Par } from '../../models/frase.model';
import { iconeModuloPadrao } from '../../models/modulo.model';
import { CampoAudio } from '../../components/campo-audio/campo-audio';
import { PlayerAudio } from '../../components/player-audio/player-audio';
import { FraseService } from '../../services/frase.service';
import { ModuloService } from '../../services/modulo.service';
import { UploadService } from '../../services/upload.service';
import { AudioService } from '../../services/audio.service';
import { IdiomaService } from '../../services/idioma.service';
import { OrigemIdioma, normalizarOrigem } from '../../models/idioma.model';
import { AuthService } from '../../services/auth.service';
import { SoundService } from '../../services/sound.service';
import {
  DirecaoMovimento,
  EstadoReordenacao,
  ReordenacaoService
} from '../../services/reordenacao.service';

@Component({
  selector: 'app-visualizar-modulo',
  standalone: true,
  imports: [CommonModule, FormsModule, CampoAudio, PlayerAudio],
  templateUrl: './visualizar-modulo.html',
  styleUrl: './visualizar-modulo.css',
})
export class VisualizarModulo implements OnInit, OnDestroy {

  /** Id numérico do módulo — os endpoints de módulo/frase seguem numéricos nesta fase. */
  moduloId: string = '';
  /** Código público do idioma (IDM-...), recebido pelo query param. */
  idIdioma: string = '';
  /**
   * Origem da cadeia de navegação (home, buscar-idioma ou visualizar-usuario).
   * Só é repassada ao voltar para o idioma, para que o Voltar de lá continue
   * sabendo de onde o usuário veio.
   */
  origem: OrigemIdioma = 'home';
  moduloNome: string = '';
  moduloIcone: SafeHtml = '';
  dataAtualizacao: string = '';
  /** Indica se o usuário logado é o dono do idioma (pode editar frases). */
  isProprietario = false;
  private navSub?: Subscription;

  private readonly iconesModo: Record<string, string> = {
    traducao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>',
    pares: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 2 2 4-4"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>'
  };

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
  audioTraducaoCompletaEdicao: string | null = null;
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
  audioPerguntaEdicao: string | null = null;
  alternativasEdicao: string[] = ['', ''];
  /** Áudio de cada alternativa, sempre com o mesmo tamanho de `alternativasEdicao`. */
  audiosAlternativasEdicao: (string | null)[] = [null, null];
  respostaCorretaEdicao: number | null = null;

  // ===== MODAL DE EXCLUSÃO =====
  mostrarModalExclusao = false;
  fraseEmExclusao: Frase | null = null;
  indiceExclusao = -1;
  numeroFraseExclusao = 0;

  carregando = true;

  /** Reordenação das frases por troca com a vizinha (otimista, com desfazer). */
  readonly reordenacao: EstadoReordenacao<Frase>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fraseService: FraseService,
    private moduloService: ModuloService,
    private uploadService: UploadService,
    private audioService: AudioService,
    private idiomaService: IdiomaService,
    private authService: AuthService,
    private soundService: SoundService,
    reordenacaoService: ReordenacaoService
  ) {
    this.reordenacao = reordenacaoService.criarEstado<Frase>({
      obterItens: () => this.frases,
      aplicarItens: (frases) => this.aplicarOrdemFrases(frases),
      extrairId: (frase) => frase.id as number,
      persistir: (ids) => this.fraseService.reordenarFrases(this.moduloId, ids),
      aoFalhar: () => this.soundService.tocar('erro')
    });
  }

  ngOnInit(): void {
    this.lerParametrosECarregar();

    this.navSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(event => event.urlAfterRedirects.startsWith('/visualizar-modulo'))
    ).subscribe(() => this.lerParametrosECarregar());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    // Envia o que estiver pendente no debounce antes de a tela sair de cena.
    this.reordenacao.destruir();
    this.audioService.descartarTodos(this.audiosDaEdicao());
  }

  /** Áudios do modal de edição, de todos os modos (os que não são do modo ficam vazios). */
  private audiosDaEdicao(): (string | null | undefined)[] {
    return [
      this.audioTraducaoCompletaEdicao,
      ...this.palavrasTraducaoEdicao.flatMap(p => [p.audioPalavra, p.audioTraducao]),
      ...this.paresEdicao.flatMap(p => [p.audioPalavra, p.audioTraducao]),
      this.audioPerguntaEdicao,
      ...this.audiosAlternativasEdicao
    ];
  }

  private lerParametrosECarregar(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.moduloId = qp.get('id') || this.route.snapshot.paramMap.get('id') || '';
    this.idIdioma = qp.get('idIdioma') || '';
    this.origem = normalizarOrigem(qp.get('origem'));
    this.carregarIdioma();
    this.carregarModulo();
    this.carregarFrases();
  }

  /**
   * Carrega o idioma pelo código público para definir se o usuário logado é o
   * proprietário (apenas o dono cria, edita, reordena ou exclui frases).
   */
  private carregarIdioma(): void {
    this.isProprietario = false;
    if (!this.idIdioma) return;

    this.idiomaService.getIdiomaPorCodigo(this.idIdioma).subscribe({
      next: (idioma) => {
        const user = this.authService.getCurrentUser();
        this.isProprietario = !!user && user.codigo === idioma.codigoCriador;
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
          const iconRaw = (m.icone && m.icone.trim()) ? m.icone : iconeModuloPadrao(Number(m.id) || 1);
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
    const audiosAlternativas = this.parseJson<(string | null)[]>(f.audiosAlternativasJson) || f.audiosAlternativas;

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
      audiosAlternativas,
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
    this.fatiarPaginaAtual();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Recorta a página atual sem rolar a tela. Separado de
   * {@link atualizarFrasesPaginadas} porque a reordenação re-renderiza a lista a
   * cada clique e subir ao topo a cada seta tornaria os botões inutilizáveis.
   */
  private fatiarPaginaAtual(): void {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    this.frasesPaginadas = this.frases.slice(inicio, inicio + this.itensPorPagina);
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
    return this.indiceGlobalFrase(indexPagina) + 1;
  }

  // ===== REORDENAÇÃO DAS FRASES =====

  /** Converte o índice dentro da página no índice da lista completa. */
  private indiceGlobalFrase(indexPagina: number): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + indexPagina;
  }

  /** Primeira frase da lista inteira — não apenas da página exibida. */
  podeSubirFrase(indexPagina: number): boolean {
    return this.reordenacao.podeSubir(this.indiceGlobalFrase(indexPagina));
  }

  /** Última frase da lista inteira — não apenas da página exibida. */
  podeDescerFrase(indexPagina: number): boolean {
    return this.reordenacao.podeDescer(this.indiceGlobalFrase(indexPagina));
  }

  /**
   * Move a frase uma posição e, quando a troca cruza a fronteira da paginação,
   * acompanha a frase até a página onde ela caiu — sem isso ela desapareceria da
   * tela justamente ao ser movida.
   */
  moverFrase(indexPagina: number, direcao: DirecaoMovimento): void {
    if (!this.isProprietario) return;

    const destino = this.indiceGlobalFrase(indexPagina) + direcao;
    if (!this.reordenacao.mover(this.indiceGlobalFrase(indexPagina), direcao)) return;

    const paginaDestino = Math.floor(destino / this.itensPorPagina) + 1;
    if (paginaDestino !== this.paginaAtual) {
      this.paginaAtual = paginaDestino;
      this.fatiarPaginaAtual();
      this.cdr.detectChanges();
    }
  }

  /** Aplica a nova ordem (ou o desfazer) vinda da reordenação. */
  private aplicarOrdemFrases(frases: Frase[]): void {
    this.frases = frases;
    this.fatiarPaginaAtual();
    this.cdr.detectChanges();
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

  /**
   * Volta para o idioma dono deste módulo — inclusive quando ele é de outro
   * usuário — preservando o código do idioma e a origem da navegação.
   */
  voltar(): void {
    if (this.idIdioma) {
      this.router.navigate(['/visualizar-idioma'], {
        queryParams: { id: this.idIdioma, origem: this.origem }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  adicionarFrase(): void {
    this.router.navigate(['/cadastrar-frase'], {
      queryParams: { moduloId: this.moduloId, idIdioma: this.idIdioma, origem: this.origem }
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
      this.audioTraducaoCompletaEdicao = frase.audioTraducaoCompleta || null;
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
      this.audioPerguntaEdicao = frase.audioPergunta || null;
      this.alternativasEdicao = frase.alternativas ? [...frase.alternativas] : ['', ''];
      this.audiosAlternativasEdicao = this.alternativasEdicao.map((_, i) => frase.audiosAlternativas?.[i] || null);
      this.respostaCorretaEdicao = frase.respostaCorreta !== undefined ? frase.respostaCorreta : null;
    }
    
    this.mostrarModalEdicao = true;
  }

  salvarEdicao(): void {
    if (this.salvandoEdicao) return;

    if (!this.podeFinalizarEdicao()) {
      this.soundService.tocar('erro');
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.indiceEdicao < 0 || !this.fraseEmEdicao || !this.fraseEmEdicao.id) {
      this.soundService.tocar('erro');
      alert('Não foi possível identificar a frase a ser editada.');
      return;
    }

    this.salvandoEdicao = true;

    // Primeiro envia as imagens e os áudios pendentes, depois persiste a frase no backend.
    forkJoin([
      this.uploadImagensPendentesEdicao(),
      this.audioService.enviarPendentes(this.audiosDaEdicao())
    ]).subscribe({
      next: () => this.enviarEdicao(),
      error: (err) => {
        this.salvandoEdicao = false;
        this.cdr.detectChanges();
        this.soundService.tocar('erro');
        alert(err?.error?.message || 'Erro ao enviar imagens ou áudios. Tente novamente.');
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

  /**
   * Monta o payload no formato esperado pelo backend (FraseRequest). Na edição
   * o backend mantém o que vier nulo, por isso áudio removido vai como ''.
   */
  private getDadosEdicao(): any {
    const modo = this.fraseEmEdicao?.modo;
    const audio = (url: string | null | undefined) => this.audioService.paraSalvar(url);

    if (modo === 'traducao') {
      return {
        modo,
        imagem: this.imagemPreviewEdicao || '',
        traducaoCompleta: this.traducaoCompletaEdicao,
        audioTraducaoCompleta: audio(this.audioTraducaoCompletaEdicao) ?? '',
        traducoesAlternativasJson: JSON.stringify(
          this.traducoesAlternativasEdicao.map(t => t.trim()).filter(t => t)
        ),
        palavrasJson: JSON.stringify(
          this.palavrasTraducaoEdicao.map(p => ({
            palavra: p.palavra,
            traducao: p.traducao,
            audioPalavra: audio(p.audioPalavra),
            audioTraducao: audio(p.audioTraducao)
          }))
        ),
        observacoes: this.observacoesEdicao || '',
        linksJson: JSON.stringify(this.linksEdicao.filter(l => l.trim()))
      };
    }

    if (modo === 'pares') {
      const paresLimpos = this.paresEdicao.map(p => ({
        imagem: p.imagem || '',
        palavra: p.palavra,
        traducao: p.traducao,
        audioPalavra: audio(p.audioPalavra),
        audioTraducao: audio(p.audioTraducao)
      }));
      return { modo, paresJson: JSON.stringify(paresLimpos) };
    }

    if (modo === 'quiz') {
      return {
        modo,
        imagemQuiz: this.tipoMidiaQuizEdicao === 'imagem' ? (this.imagemQuizEdicao || '') : '',
        videoQuiz: this.tipoMidiaQuizEdicao === 'video' ? (this.videoQuizEdicao || '') : '',
        pergunta: this.perguntaQuizEdicao,
        audioPergunta: audio(this.audioPerguntaEdicao) ?? '',
        alternativasJson: JSON.stringify(this.alternativasEdicao),
        audiosAlternativasJson: JSON.stringify(this.audiosAlternativasEdicao.map(audio)),
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
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso(`Frase "${nome}" editada com sucesso!`);
      },
      error: () => {
        this.salvandoEdicao = false;
        this.cdr.detectChanges();
        this.soundService.tocar('erro');
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
    // Áudios escolhidos e não salvos (antes de trocar as listas que os guardam)
    this.audioService.descartarTodos(this.audiosDaEdicao());
    this.audioTraducaoCompletaEdicao = null;
    this.audioPerguntaEdicao = null;
    this.audiosAlternativasEdicao = [null, null];

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
    const [removida] = this.palavrasTraducaoEdicao.splice(index, 1);
    this.audioService.descartarTodos([removida?.audioPalavra, removida?.audioTraducao]);
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
      const [removido] = this.paresEdicao.splice(index, 1);
      this.audioService.descartarTodos([removido?.audioPalavra, removido?.audioTraducao]);
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
      this.audiosAlternativasEdicao.push(null);
    }
  }

  removerAlternativaEdicao(index: number): void {
    if (this.alternativasEdicao.length > 2) {
      this.alternativasEdicao.splice(index, 1);
      const [audioRemovido] = this.audiosAlternativasEdicao.splice(index, 1);
      this.audioService.descartar(audioRemovido);
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
    this.soundService.tocar('alerta');
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
                this.soundService.tocar('exclusao');
                this.router.navigate(['/visualizar-idioma'], {
                  queryParams: { id: this.idIdioma, origem: this.origem }
                });
              },
              error: () => {
                this.fecharModalExclusao();
                this.soundService.tocar('erro');
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
          this.soundService.tocar('exclusao');
          this.exibirMensagemSucesso(`Frase "${modoNome}" excluída com sucesso!`);
        },
        error: () => {
          this.fecharModalExclusao();
          this.soundService.tocar('erro');
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