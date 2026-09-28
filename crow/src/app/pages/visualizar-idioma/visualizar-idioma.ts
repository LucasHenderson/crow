import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ICONES_MODULO, Modulo, iconeModuloPadrao } from '../../models/modulo.model';
import { IdiomaUsuario, OrigemIdioma, Proficiencia, normalizarOrigem } from '../../models/idioma.model';
import { PalavraTrad, Par } from '../../models/frase.model';
import { CampoAudio } from '../../components/campo-audio/campo-audio';
import { IdiomaService } from '../../services/idioma.service';
import { ModuloService } from '../../services/modulo.service';
import { FraseService } from '../../services/frase.service';
import { UploadService } from '../../services/upload.service';
import { AudioService } from '../../services/audio.service';
import { AuthService } from '../../services/auth.service';
import { SoundService } from '../../services/sound.service';
import {
  DirecaoMovimento,
  EstadoReordenacao,
  ReordenacaoService
} from '../../services/reordenacao.service';

@Component({
  selector: 'app-visualizar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule, CampoAudio],
  templateUrl: './visualizar-idioma.html',
  styleUrl: './visualizar-idioma.css',
})
export class VisualizarIdioma implements OnInit, OnDestroy {
  idiomaNome = '';
  descricao = '';
  /** Código público do idioma (IDM-...): vem do query param e é o que circula na navegação. */
  codigoIdioma = '';
  codigoCriador = '';
  /** Tela de onde o usuário chegou aqui — define para onde o botão Voltar leva. */
  origem: OrigemIdioma = 'home';
  /** Última alteração de conteúdo (ISO), vinda do backend; nulo oculta a linha. */
  atualizadoEm: string | null = null;
  isProprietario = false;
  carregando = true;
  avaliacao = 0;
  totalAvaliacoes = 0;
  /** Nível de proficiência do idioma; nulo quando o criador não informou. */
  proficiencia: Proficiencia | null = null;

  /** Níveis de proficiência na ordem de progressão (escala do card). */
  readonly niveisProficiencia: Proficiencia[] = ['iniciante', 'basico', 'intermediario', 'avancado', 'fluente'];

  // Controle dos modais
  mostrarModalDenuncia = false;
  mostrarModalAvaliacao = false;
  mostrarModalImportacao = false;
  mostrarModalEditarModulo = false;
  mostrarModalExcluirModulo = false;
  mostrarModalAdicionarModulo = false;
  mostrarModalAlertaMinimoModulos = false;
  mostrarModalOrdem = false;
  /** Última ordem escolhida na sessão (pré-seleciona no modal). */
  ordemPreferida: 'aleatoria' | 'cadastro' = 'aleatoria';
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';

  // Dados de adição de módulo
  etapaAdicao: 1 | 2 = 1;
  nomeModuloAdicao = '';
  iconeModuloAdicao: SafeHtml | null = null;
  iconeModuloAdicaoSvg: string | null = null;
  salvandoAdicao = false;
  erroAdicao = '';

  // Frase do novo módulo
  modoFrase: 'traducao' | 'pares' | 'quiz' | null = null;

  // Tradução Direta
  imagemPreview: string | null = null;
  imagemFile: File | null = null;
  traducaoCompleta = '';
  audioTraducaoCompleta: string | null = null;
  palavrasTraducao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
  traducoesAlternativas: string[] = [];
  observacoes = '';
  links: string[] = [''];

  // Selecionar Pares
  pares: Par[] = [
    { palavra: '', traducao: '' },
    { palavra: '', traducao: '' },
    { palavra: '', traducao: '' }
  ];

  // Quiz
  tipoMidiaQuiz: 'imagem' | 'video' | null = null;
  imagemQuiz: string | null = null;
  imagemQuizFile: File | null = null;
  videoQuiz = '';
  videoQuizEmbed: SafeResourceUrl | null = null;
  perguntaQuiz = '';
  audioPergunta: string | null = null;
  alternativas: string[] = ['', ''];
  /** Áudio de cada alternativa, sempre com o mesmo tamanho de `alternativas`. */
  audiosAlternativas: (string | null)[] = [null, null];
  respostaCorreta: number = 0;

  // Dados de denúncia
  denunciaImagensInapropriadas = false;
  denunciaVideosInapropriados = false;
  denunciaAudiosInapropriados = false;
  denunciaLinksInapropriados = false;
  denunciaFrasesInapropriadas = false;
  denunciaOutros = false;
  denunciaDescricao = '';
  
  // Dados de avaliação
  notaAvaliacao = 0;
  notaHover = 0;
  
  // Dados de importação
  idiomasUsuario: IdiomaUsuario[] = [];
  etapaImportacao: 'confirmacao' | 'exclusao' | 'sucesso' = 'confirmacao';
  
  // Dados de edição/exclusão de módulo
  moduloEmEdicao: Modulo | null = null;
  moduloEmExclusao: Modulo | null = null;
  salvandoExclusao = false;
  erroExclusao = '';
  nomeModuloEdicao = '';
  iconeModuloEdicaoSvg: string | null = null;
  salvandoEdicao = false;
  erroEdicao = '';
  
  iconesModulo: SafeHtml[] = [];
  iconesModuloSvg: string[] = [];
  /** Tema de cada ícone, na mesma ordem de iconesModulo (dica ao passar o mouse). */
  iconesModuloNomes: string[] = [];

  modulos: Modulo[] = [];

  /** Reordenação dos módulos por troca com o vizinho (otimista, com desfazer). */
  readonly reordenacao: EstadoReordenacao<Modulo>;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private idiomaService: IdiomaService,
    private moduloService: ModuloService,
    private fraseService: FraseService,
    private uploadService: UploadService,
    private audioService: AudioService,
    private authService: AuthService,
    private soundService: SoundService,
    reordenacaoService: ReordenacaoService
  ) {
    this.carregarIcones();

    this.reordenacao = reordenacaoService.criarEstado<Modulo>({
      obterItens: () => this.modulos,
      aplicarItens: (modulos) => {
        this.modulos = modulos;
        this.cdr.detectChanges();
      },
      extrairId: (modulo) => modulo.id,
      persistir: (ids) => this.moduloService.reordenarModulos(this.codigoIdioma, ids),
      aoFalhar: () => this.soundService.tocar('erro')
    });
  }

  ngOnDestroy(): void {
    // Envia o que estiver pendente no debounce antes de a tela sair de cena.
    this.reordenacao.destruir();
    this.audioService.descartarTodos(this.audiosDaFraseAdicao());
  }

  /**
   * Áudios da frase do módulo em cadastro. Com `apenasModoAtual`, só os do modo
   * escolhido — os que vão para o backend; sem ele, os de todos os modos.
   */
  private audiosDaFraseAdicao(apenasModoAtual = false): (string | null | undefined)[] {
    const traducao = [
      this.audioTraducaoCompleta,
      ...this.palavrasTraducao.flatMap(p => [p.audioPalavra, p.audioTraducao])
    ];
    const pares = this.pares.flatMap(p => [p.audioPalavra, p.audioTraducao]);
    const quiz = [this.audioPergunta, ...this.audiosAlternativas];

    if (!apenasModoAtual) return [...traducao, ...pares, ...quiz];
    if (this.modoFrase === 'traducao') return traducao;
    if (this.modoFrase === 'pares') return pares;
    if (this.modoFrase === 'quiz') return quiz;
    return [];
  }

  ngOnInit(): void {
    this.origem = normalizarOrigem(this.route.snapshot.queryParamMap.get('origem'));
    const codigo = this.route.snapshot.queryParamMap.get('id');
    if (codigo) {
      this.codigoIdioma = codigo;
      this.carregarDadosIdioma(codigo);
    }
    try {
      const salva = sessionStorage.getItem('crow:ordem-jogo');
      if (salva === 'cadastro' || salva === 'aleatoria') {
        this.ordemPreferida = salva;
      }
    } catch { /* sessionStorage indisponível */ }
  }

  carregarDadosIdioma(codigo: string): void {
    this.carregando = true;
    this.cdr.markForCheck();
    this.idiomaService.getIdiomaPorCodigo(codigo).subscribe({
      next: (idioma) => {
        this.idiomaNome = idioma.nome;
        this.descricao = idioma.descricao;
        this.codigoIdioma = idioma.codigo;
        this.codigoCriador = idioma.codigoCriador;
        this.avaliacao = idioma.avaliacao;
        this.totalAvaliacoes = idioma.totalAvaliacoes;
        this.proficiencia = this.niveisProficiencia.find(n => n === idioma.proficiencia?.toLowerCase()) ?? null;
        this.atualizadoEm = idioma.atualizadoEm ?? null;
        const user = this.authService.getCurrentUser();
        this.isProprietario = !!user && user.codigo === idioma.codigoCriador;
        this.cdr.detectChanges();
        this.carregarModulos(this.codigoIdioma);
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarModulos(codigoIdioma: string): void {
    this.moduloService.getModulosPorIdioma(codigoIdioma).subscribe({
      next: (modulos) => {
        this.modulos = modulos.map((m: any) => {
          const iconeSvg = this.resolverIconeSvg(m.icone, m.id);
          return {
            id: m.id,
            nome: m.nome,
            iconeSvg,
            icone: this.makeIconSvg(iconeSvg),
            selecionado: false,
            frases: m.frases || 0
          };
        });
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarIcones(): void {
    this.iconesModuloSvg = ICONES_MODULO.map(icone => icone.svg);
    this.iconesModuloNomes = ICONES_MODULO.map(icone => icone.nome);
    this.iconesModulo = this.iconesModuloSvg.map(svg => this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  private makeIconSvg(raw: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  /**
   * Retorna o SVG bruto do ícone do módulo. Usa o valor persistido no backend
   * e, apenas para módulos legados sem ícone salvo, recorre a um padrão estável
   * derivado do id (nunca aleatório).
   */
  private resolverIconeSvg(iconeBackend: string | null | undefined, id: number): string {
    if (iconeBackend && iconeBackend.trim()) {
      return iconeBackend;
    }
    return iconeModuloPadrao(id);
  }

  toggleModulo(mod: Modulo, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    mod.selecionado = !mod.selecionado;
  }

  selecionarTodos(): void {
    this.modulos.forEach(m => m.selecionado = true);
  }

  limparSelecao(): void {
    this.modulos.forEach(m => m.selecionado = false);
  }

  // ===== REORDENAÇÃO DOS MÓDULOS =====

  /**
   * Move o módulo uma posição. O clique não deve marcar/desmarcar o módulo, por
   * isso interrompe a propagação para o `(click)` do card.
   */
  moverModulo(index: number, direcao: DirecaoMovimento, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.isProprietario) return;
    this.reordenacao.mover(index, direcao);
  }

  get modulosSelecionados(): Modulo[] {
    return this.modulos.filter(m => m.selecionado);
  }

  get podeIniciar(): boolean {
    return this.modulosSelecionados.length > 0;
  }

  estrelas(nota: number): boolean[] {
    const notaArredondada = Math.ceil(nota);
    return Array.from({ length: 5 }, (_, i) => i < notaArredondada);
  }

  /** Nome do nível exibido no card de estatísticas; '—' para idiomas sem proficiência. */
  get proficienciaLabel(): string {
    const nomes: Record<Proficiencia, string> = {
      iniciante: 'Iniciante',
      basico: 'Básico',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
      fluente: 'Fluente'
    };
    return this.proficiencia ? nomes[this.proficiencia] : '—';
  }

  /** Posição do nível na escala (1 a 5); 0 quando não há proficiência. */
  get nivelProficiencia(): number {
    return this.proficiencia ? this.niveisProficiencia.indexOf(this.proficiencia) + 1 : 0;
  }

  iniciar(): void {
    if (!this.podeIniciar) return;
    // Abre o modal para o usuário escolher a ordem de execução (Aleatória ou
    // Ordem de Cadastro). A navegação acontece após a escolha.
    this.mostrarModalOrdem = true;
  }

  fecharModalOrdem(): void {
    this.mostrarModalOrdem = false;
  }

  /**
   * Confirma o modo de ordem escolhido, persiste a opção durante a sessão e
   * inicia o jogo. No modo aleatório os módulos vão embaralhados; na ordem de
   * cadastro vão na sequência exibida (o backend ordena as frases por cadastro).
   */
  iniciarComOrdem(ordem: 'aleatoria' | 'cadastro'): void {
    if (!this.podeIniciar) return;

    const ids = this.modulosSelecionados.map(m => String(m.id));
    const idsOrdenados = ordem === 'aleatoria'
      ? [...ids].sort(() => Math.random() - 0.5)
      : ids;

    // Persiste a escolha durante a sessão (sobrevive a recargas da aba).
    try {
      sessionStorage.setItem('crow:ordem-jogo', ordem);
    } catch { /* sessionStorage indisponível — segue sem persistir */ }

    this.mostrarModalOrdem = false;
    this.router.navigate(['/jogar'], {
      queryParams: {
        modulos: JSON.stringify(idsOrdenados),
        idIdioma: this.codigoIdioma,
        ordem,
        origem: this.origem
      }
    });
  }

  onAdicionarModulo(): void {
    if (this.modulos.length >= 20) {
      this.soundService.tocar('alerta');
      this.exibirMensagemSucesso('Limite de 20 módulos atingido.');
      return;
    }
    this.resetarDadosAdicao();
    this.mostrarModalAdicionarModulo = true;
  }

  private resetarDadosAdicao(): void {
    this.etapaAdicao = 1;
    this.nomeModuloAdicao = '';
    this.iconeModuloAdicao = null;
    this.iconeModuloAdicaoSvg = null;
    this.salvandoAdicao = false;
    this.erroAdicao = '';

    // Antes de trocar as listas: descarta os áudios escolhidos e não salvos.
    this.audioService.descartarTodos(this.audiosDaFraseAdicao());
    this.audioTraducaoCompleta = null;
    this.audioPergunta = null;
    this.audiosAlternativas = [null, null];

    this.modoFrase = null;

    this.revogarBlob(this.imagemPreview);
    this.imagemPreview = null;
    this.imagemFile = null;
    this.traducaoCompleta = '';
    this.palavrasTraducao = [{ palavra: '', traducao: '' }];
    this.traducoesAlternativas = [];
    this.observacoes = '';
    this.links = [''];

    this.pares.forEach(p => this.revogarBlob(p.imagem));
    this.pares = [
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' }
    ];

    this.tipoMidiaQuiz = null;
    this.revogarBlob(this.imagemQuiz);
    this.imagemQuiz = null;
    this.imagemQuizFile = null;
    this.videoQuiz = '';
    this.videoQuizEmbed = null;
    this.perguntaQuiz = '';
    this.alternativas = ['', ''];
    this.respostaCorreta = 0;
  }

  fecharModalAdicionarModulo(): void {
    if (this.salvandoAdicao) return;
    this.mostrarModalAdicionarModulo = false;
    this.resetarDadosAdicao();
  }

  selecionarIconeAdicao(icone: SafeHtml, index: number): void {
    this.iconeModuloAdicao = icone;
    this.iconeModuloAdicaoSvg = this.iconesModuloSvg[index];
  }

  get podeAvancarEtapa1Adicao(): boolean {
    return !!(this.iconeModuloAdicao && this.nomeModuloAdicao.trim());
  }

  get podeFinalizarAdicao(): boolean {
    if (!this.modoFrase) return false;

    if (this.modoFrase === 'traducao') {
      const palavrasValidas = this.palavrasTraducao.every(p => p.palavra.trim() && p.traducao.trim());
      return !!(this.traducaoCompleta.trim() && palavrasValidas);
    }
    if (this.modoFrase === 'pares') {
      return this.pares.every(p => p.palavra.trim() && p.traducao.trim());
    }
    if (this.modoFrase === 'quiz') {
      const alternativasValidas = this.alternativas.every(a => a.trim());
      return !!(this.perguntaQuiz.trim() && alternativasValidas && this.respostaCorreta !== null);
    }
    return false;
  }

  avancarEtapaAdicao(): void {
    if (this.etapaAdicao === 1 && this.podeAvancarEtapa1Adicao) {
      this.etapaAdicao = 2;
    }
  }

  voltarEtapaAdicao(): void {
    if (this.etapaAdicao === 2) {
      this.etapaAdicao = 1;
    }
  }

  confirmarAdicaoModulo(): void {
    if (this.salvandoAdicao) return;
    if (!this.podeAvancarEtapa1Adicao || !this.podeFinalizarAdicao) return;
    if (this.modulos.length >= 20) {
      this.fecharModalAdicionarModulo();
      return;
    }

    this.salvandoAdicao = true;
    this.erroAdicao = '';

    forkJoin([
      this.uploadImagensAdicaoPendentes(),
      this.audioService.enviarPendentes(this.audiosDaFraseAdicao(true))
    ]).subscribe({
      next: () => this.criarModuloEFrase(),
      error: (err) => this.tratarErroAdicao(err, 'Erro ao enviar imagens ou áudios.')
    });
  }

  private uploadImagensAdicaoPendentes(): Observable<any> {
    const uploads: Observable<any>[] = [];

    if (this.modoFrase === 'traducao' && this.imagemFile) {
      uploads.push(
        this.uploadService.uploadImagem(this.imagemFile).pipe(
          tap(res => { this.imagemPreview = res.path; this.imagemFile = null; })
        )
      );
    }

    if (this.modoFrase === 'pares') {
      this.pares.forEach((par, i) => {
        if (par.imagemFile) {
          uploads.push(
            this.uploadService.uploadImagem(par.imagemFile).pipe(
              tap(res => {
                this.pares[i].imagem = res.path;
                this.pares[i].imagemFile = undefined;
              })
            )
          );
        }
      });
    }

    if (this.modoFrase === 'quiz' && this.tipoMidiaQuiz === 'imagem' && this.imagemQuizFile) {
      uploads.push(
        this.uploadService.uploadImagem(this.imagemQuizFile).pipe(
          tap(res => { this.imagemQuiz = res.path; this.imagemQuizFile = null; })
        )
      );
    }

    return uploads.length ? forkJoin(uploads) : of(null);
  }

  private criarModuloEFrase(): void {
    const nome = this.nomeModuloAdicao.trim().substring(0, 80);
    const dadosModulo = { nome, icone: this.iconeModuloAdicaoSvg || '' };

    this.moduloService.criarModulo(this.codigoIdioma, dadosModulo).subscribe({
      next: (moduloCriado: any) => {
        this.fraseService.criarFrase(moduloCriado.id, this.getDadosFraseAdicao()).subscribe({
          next: () => {
            const iconeSvg = this.resolverIconeSvg(moduloCriado.icone, moduloCriado.id);
            const novoModulo: Modulo = {
              id: moduloCriado.id,
              nome: moduloCriado.nome || nome,
              iconeSvg,
              icone: this.makeIconSvg(iconeSvg),
              selecionado: false,
              frases: 1
            };
            this.modulos.push(novoModulo);
            this.salvandoAdicao = false;
            this.fecharModalAdicionarModulo();
            this.soundService.tocar('sucesso');
            this.exibirMensagemSucesso(`Módulo "${nome}" adicionado com sucesso!`);
          },
          error: (err) => this.tratarErroAdicao(err, 'Erro ao cadastrar frase.')
        });
      },
      error: (err) => this.tratarErroAdicao(err, 'Erro ao cadastrar módulo.')
    });
  }

  private tratarErroAdicao(err: any, fallback: string): void {
    this.salvandoAdicao = false;
    this.erroAdicao = err?.error?.message || fallback;
    this.soundService.tocar('erro');
    this.cdr.detectChanges();
  }

  /** Corpo da requisição da frase. Os áudios já foram enviados em `confirmarAdicaoModulo()`. */
  private getDadosFraseAdicao(): any {
    const base: any = { modo: (this.modoFrase || '').toUpperCase() };
    const audio = (url: string | null | undefined) => this.audioService.paraSalvar(url);

    if (this.modoFrase === 'traducao') {
      return {
        ...base,
        imagem: this.imagemPreview,
        traducaoCompleta: this.traducaoCompleta,
        audioTraducaoCompleta: audio(this.audioTraducaoCompleta),
        traducoesAlternativasJson: JSON.stringify(this.traducoesAlternativas.map(t => t.trim()).filter(t => t)),
        palavrasJson: JSON.stringify(this.palavrasTraducao.map(p => ({
          palavra: p.palavra,
          traducao: p.traducao,
          audioPalavra: audio(p.audioPalavra),
          audioTraducao: audio(p.audioTraducao)
        }))),
        observacoes: this.observacoes,
        linksJson: JSON.stringify(this.links.filter(l => l.trim()))
      };
    }
    if (this.modoFrase === 'pares') {
      const paresLimpos = this.pares.map(p => ({
        imagem: p.imagem,
        palavra: p.palavra,
        traducao: p.traducao,
        audioPalavra: audio(p.audioPalavra),
        audioTraducao: audio(p.audioTraducao)
      }));
      return { ...base, paresJson: JSON.stringify(paresLimpos) };
    }
    if (this.modoFrase === 'quiz') {
      return {
        ...base,
        imagemQuiz: this.imagemQuiz,
        videoQuiz: this.videoQuiz,
        pergunta: this.perguntaQuiz,
        audioPergunta: audio(this.audioPergunta),
        alternativasJson: JSON.stringify(this.alternativas),
        audiosAlternativasJson: JSON.stringify(this.audiosAlternativas.map(audio)),
        respostaCorreta: this.respostaCorreta
      };
    }
    return base;
  }

  // ===== HELPERS DA FRASE (adição de módulo) =====

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private revogarBlob(url: string | null | undefined): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Tradução Direta
  adicionarPalavra(): void {
    this.palavrasTraducao.push({ palavra: '', traducao: '' });
  }

  removerPalavra(index: number): void {
    const [removida] = this.palavrasTraducao.splice(index, 1);
    this.audioService.descartarTodos([removida?.audioPalavra, removida?.audioTraducao]);
  }

  adicionarLink(): void {
    if (this.links.length < 3) this.links.push('');
  }

  removerLink(index: number): void {
    this.links.splice(index, 1);
  }

  adicionarTraducaoAlt(): void {
    if (this.traducoesAlternativas.length < 5) this.traducoesAlternativas.push('');
  }

  removerTraducaoAlt(index: number): void {
    this.traducoesAlternativas.splice(index, 1);
  }

  onImagemSelecionada(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.revogarBlob(this.imagemPreview);
    this.imagemFile = file;
    this.imagemPreview = URL.createObjectURL(file);
  }

  removerImagem(event: Event): void {
    event.stopPropagation();
    this.revogarBlob(this.imagemPreview);
    this.imagemPreview = null;
    this.imagemFile = null;
  }

  // Selecionar Pares
  adicionarPar(): void {
    if (this.pares.length < 10) this.pares.push({ palavra: '', traducao: '' });
  }

  removerPar(index: number): void {
    if (this.pares.length > 3) {
      this.revogarBlob(this.pares[index].imagem);
      const [removido] = this.pares.splice(index, 1);
      this.audioService.descartarTodos([removido?.audioPalavra, removido?.audioTraducao]);
    }
  }

  onParImagemSelecionada(event: any, index: number): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.revogarBlob(this.pares[index].imagem);
    this.pares[index].imagemFile = file;
    this.pares[index].imagem = URL.createObjectURL(file);
  }

  removerImagemPar(event: Event, index: number): void {
    event.stopPropagation();
    this.revogarBlob(this.pares[index].imagem);
    this.pares[index].imagem = undefined;
    this.pares[index].imagemFile = undefined;
  }

  // Quiz
  adicionarAlternativa(): void {
    if (this.alternativas.length < 5) {
      this.alternativas.push('');
      this.audiosAlternativas.push(null);
    }
  }

  removerAlternativa(index: number): void {
    if (this.alternativas.length > 2) {
      this.alternativas.splice(index, 1);
      const [audioRemovido] = this.audiosAlternativas.splice(index, 1);
      this.audioService.descartar(audioRemovido);
      if (this.respostaCorreta === index) this.respostaCorreta = 0;
      else if (this.respostaCorreta > index) this.respostaCorreta--;
    }
  }

  marcarRespostaCorreta(index: number): void {
    this.respostaCorreta = index;
  }

  onQuizImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.revogarBlob(this.imagemQuiz);
    this.imagemQuizFile = file;
    this.imagemQuiz = URL.createObjectURL(file);
  }

  removerImagemQuiz(event: Event): void {
    event.stopPropagation();
    this.revogarBlob(this.imagemQuiz);
    this.imagemQuiz = null;
    this.imagemQuizFile = null;
  }

  onVideoQuizChange(url: string): void {
    if (!url || !url.trim()) {
      this.videoQuizEmbed = null;
      return;
    }
    let embedUrl = '';
    if (url.includes('youtube.com/embed/')) {
      embedUrl = url;
    } else if (url.includes('youtube.com/watch')) {
      const m = url.match(/[?&]v=([^&]+)/);
      if (m?.[1]) embedUrl = `https://www.youtube.com/embed/${m[1]}`;
    } else if (url.includes('youtu.be/')) {
      const m = url.match(/youtu\.be\/([^?]+)/);
      if (m?.[1]) {
        const params = url.includes('?') ? url.substring(url.indexOf('?')) : '';
        embedUrl = `https://www.youtube.com/embed/${m[1]}${params}`;
      }
    }
    this.videoQuizEmbed = embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
  }

  fecharModalAlertaMinimoModulos(): void {
    this.mostrarModalAlertaMinimoModulos = false;
  }

  /**
   * Retorna para a tela de origem informada no query param. Substitui o antigo
   * `window.history.back()`, que prendia o usuário em ciclo ao navegar entre o
   * idioma e o módulo de outro usuário.
   */
  voltar(): void {
    if (this.origem === 'buscar-idioma') {
      this.router.navigate(['/buscar-idioma']);
      return;
    }
    if (this.origem === 'visualizar-usuario' && this.codigoCriador) {
      this.router.navigate(['/visualizar-usuario'], {
        queryParams: { id: this.codigoCriador }
      });
      return;
    }
    this.router.navigate(['/home']);
  }

  visualizarModulo(mod: Modulo, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/visualizar-modulo'], {
      queryParams: { id: mod.id, idIdioma: this.codigoIdioma, origem: this.origem }
    });
  }

  // ===== COPIAR ID DO IDIOMA =====
  
  copiarIdIdioma(): void {
    navigator.clipboard.writeText(this.codigoIdioma).then(() => {
      this.soundService.tocar('sucesso');
      this.exibirMensagemSucesso('ID do Idioma copiado para a área de transferência!');
    }).catch(() => {
      this.soundService.tocar('erro');
      this.exibirMensagemSucesso('Não foi possível copiar o ID. Tente novamente.');
    });
  }

  get idIdiomaFormatado(): string {
    return this.codigoIdioma;
  }

  // ===== MODAL DE DENÚNCIA =====
  
  denunciarIdioma(): void {
    this.mostrarModalDenuncia = true;
  }

  fecharModalDenuncia(): void {
    this.mostrarModalDenuncia = false;
    this.limparCamposDenuncia();
  }

  limparCamposDenuncia(): void {
    this.denunciaImagensInapropriadas = false;
    this.denunciaVideosInapropriados = false;
    this.denunciaAudiosInapropriados = false;
    this.denunciaLinksInapropriados = false;
    this.denunciaFrasesInapropriadas = false;
    this.denunciaOutros = false;
    this.denunciaDescricao = '';
  }

  get podeEnviarDenuncia(): boolean {
    const temDenuncia = this.denunciaImagensInapropriadas ||
                        this.denunciaVideosInapropriados ||
                        this.denunciaAudiosInapropriados ||
                        this.denunciaLinksInapropriados ||
                        this.denunciaFrasesInapropriadas ||
                        this.denunciaOutros;
    
    if (this.denunciaOutros) {
      return temDenuncia && this.denunciaDescricao.trim().length > 0;
    }
    
    return temDenuncia;
  }

  enviarDenuncia(): void {
    if (!this.podeEnviarDenuncia) return;

    const tipos: string[] = [];
    if (this.denunciaImagensInapropriadas) tipos.push('Imagens Inapropriadas');
    if (this.denunciaVideosInapropriados) tipos.push('Vídeos Inapropriados');
    if (this.denunciaAudiosInapropriados) tipos.push('Áudios Inapropriados');
    if (this.denunciaLinksInapropriados) tipos.push('Links Inapropriados');
    if (this.denunciaFrasesInapropriadas) tipos.push('Frases Inapropriadas');
    if (this.denunciaOutros) tipos.push('Outros');

    // O backend espera os tipos serializados em JSON (campo tiposJson).
    this.idiomaService.denunciarIdioma(this.codigoIdioma, {
      tiposJson: JSON.stringify(tipos),
      descricao: this.denunciaDescricao
    }).subscribe({
      next: () => {
        this.fecharModalDenuncia();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso('Obrigado por sua colaboração! A moderação verificará e agirá assim que possível.');
      },
      error: (err) => {
        this.fecharModalDenuncia();
        this.soundService.tocar('erro');
        this.exibirMensagemSucesso(err?.error?.message || 'Erro ao enviar denúncia. Tente novamente.');
      }
    });
  }

  // ===== MODAL DE AVALIAÇÃO =====
  
  avaliarIdioma(): void {
    this.notaAvaliacao = 0;
    this.notaHover = 0;
    this.mostrarModalAvaliacao = true;
  }

  fecharModalAvaliacao(): void {
    this.mostrarModalAvaliacao = false;
    this.notaAvaliacao = 0;
    this.notaHover = 0;
  }

  selecionarNota(nota: number): void {
    this.notaAvaliacao = nota;
  }

  hoverNota(nota: number): void {
    this.notaHover = nota;
  }

  resetHover(): void {
    this.notaHover = 0;
  }

  enviarAvaliacao(): void {
    if (this.notaAvaliacao === 0) return;

    this.idiomaService.avaliarIdioma(this.codigoIdioma, this.notaAvaliacao).subscribe({
      next: (resultado) => {
        this.avaliacao = resultado.novaMedia;
        this.totalAvaliacoes = resultado.totalAvaliacoes;
        this.fecharModalAvaliacao();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
      },
      error: (err) => {
        this.fecharModalAvaliacao();
        this.soundService.tocar('erro');
        this.exibirMensagemSucesso(err?.error?.message || 'Erro ao enviar avaliação. Tente novamente.');
      }
    });
  }

  // ===== MODAL DE IMPORTAÇÃO =====
  
  importarIdioma(): void {
    // Carrega os idiomas do usuário ANTES de abrir o modal, garantindo que a
    // decisão entre "confirmação" e "exclusão" use a contagem real (corrige
    // o problema de o modal abrir sempre na etapa de confirmação).
    this.idiomaService.getIdiomasUsuario().subscribe({
      next: (idiomas) => {
        this.idiomasUsuario = idiomas.map((i: any) => ({
          codigo: i.codigo,
          nome: i.nome,
          bandeira: i.bandeira,
          selecionado: false
        }));
        this.etapaImportacao = this.idiomasUsuario.length >= 4 ? 'exclusao' : 'confirmacao';
        this.mostrarModalImportacao = true;
        if (this.etapaImportacao === 'exclusao') {
          this.soundService.tocar('alerta');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.idiomasUsuario = [];
        this.etapaImportacao = 'confirmacao';
        this.mostrarModalImportacao = true;
        this.cdr.detectChanges();
      }
    });
  }

  fecharModalImportacao(): void {
    this.mostrarModalImportacao = false;
    this.etapaImportacao = 'confirmacao';
    this.limparSelecaoIdiomas();
  }

  limparSelecaoIdiomas(): void {
    this.idiomasUsuario.forEach(i => i.selecionado = false);
  }

  toggleIdiomaImportacao(idioma: IdiomaUsuario): void {
    idioma.selecionado = !idioma.selecionado;
  }

  get idiomasSelecionadosParaExclusao(): IdiomaUsuario[] {
    return this.idiomasUsuario.filter(i => i.selecionado);
  }

  get podeExcluirEImportar(): boolean {
    return this.idiomasSelecionadosParaExclusao.length > 0;
  }

  confirmarImportacao(): void {
    this.idiomaService.importarIdioma(this.codigoIdioma).subscribe({
      next: () => {
        this.fecharModalImportacao();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
      },
      error: (err) => {
        this.fecharModalImportacao();
        this.soundService.tocar('erro');
        this.exibirMensagemSucesso(err.error?.message || 'Erro ao importar idioma.');
      }
    });
  }

  excluirEImportar(): void {
    if (!this.podeExcluirEImportar) return;

    // Exclui de fato os idiomas selecionados no backend e, só após a confirmação,
    // realiza a importação — garantindo persistência e respeito ao limite de 4.
    const exclusoes = this.idiomasSelecionadosParaExclusao.map(i =>
      this.idiomaService.excluirIdioma(i.codigo));

    forkJoin(exclusoes).subscribe({
      next: () => {
        this.idiomaService.importarIdioma(this.codigoIdioma).subscribe({
          next: () => {
            this.fecharModalImportacao();
            this.soundService.tocar('sucesso');
            this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
          },
          error: (err) => {
            this.fecharModalImportacao();
            this.soundService.tocar('erro');
            this.exibirMensagemSucesso(err.error?.message || 'Erro ao importar idioma.');
          }
        });
      },
      error: () => {
        this.fecharModalImportacao();
        this.soundService.tocar('erro');
        this.exibirMensagemSucesso('Erro ao excluir os idiomas selecionados.');
      }
    });
  }

  // ===== MODAL DE EDITAR MÓDULO =====
  
  editarModulo(mod: Modulo): void {
    this.moduloEmEdicao = mod;
    this.nomeModuloEdicao = mod.nome;
    // Pré-seleciona o ícone atualmente em uso pelo módulo.
    this.iconeModuloEdicaoSvg = mod.iconeSvg;
    this.salvandoEdicao = false;
    this.erroEdicao = '';
    this.mostrarModalEditarModulo = true;
  }

  fecharModalEditarModulo(): void {
    if (this.salvandoEdicao) return;
    this.mostrarModalEditarModulo = false;
    this.moduloEmEdicao = null;
    this.nomeModuloEdicao = '';
    this.iconeModuloEdicaoSvg = null;
    this.erroEdicao = '';
  }

  selecionarIconeEdicao(index: number): void {
    this.iconeModuloEdicaoSvg = this.iconesModuloSvg[index];
  }

  get podeConfirmarEdicao(): boolean {
    const nomeValido = this.nomeModuloEdicao.trim().length > 0;
    const nomeDiferente = this.nomeModuloEdicao.trim() !== this.moduloEmEdicao?.nome;
    const iconeDiferente = !!this.iconeModuloEdicaoSvg
      && this.iconeModuloEdicaoSvg !== this.moduloEmEdicao?.iconeSvg;

    return nomeValido && !!this.iconeModuloEdicaoSvg && (nomeDiferente || iconeDiferente);
  }

  confirmarEdicaoModulo(): void {
    if (this.salvandoEdicao) return;
    if (!this.podeConfirmarEdicao || !this.moduloEmEdicao) return;

    const modulo = this.moduloEmEdicao;
    const nome = this.nomeModuloEdicao.trim().substring(0, 80);
    const iconeSvg = this.iconeModuloEdicaoSvg || modulo.iconeSvg;

    this.salvandoEdicao = true;
    this.erroEdicao = '';

    this.moduloService.editarModulo(this.codigoIdioma, modulo.id, { nome, icone: iconeSvg }).subscribe({
      next: (atualizado: any) => {
        modulo.nome = atualizado?.nome || nome;
        modulo.iconeSvg = this.resolverIconeSvg(atualizado?.icone ?? iconeSvg, modulo.id);
        modulo.icone = this.makeIconSvg(modulo.iconeSvg);
        this.salvandoEdicao = false;
        this.fecharModalEditarModulo();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso(`Módulo "${modulo.nome}" editado com sucesso!`);
      },
      error: (err) => {
        this.salvandoEdicao = false;
        this.erroEdicao = err?.error?.message || 'Erro ao editar módulo.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
      }
    });
  }

  // ===== MODAL DE EXCLUIR MÓDULO =====
  
  removerModuloConfirmacao(mod: Modulo): void {
    this.soundService.tocar('alerta');
    if (this.modulos.length <= 1) {
      this.mostrarModalAlertaMinimoModulos = true;
      return;
    }

    this.moduloEmExclusao = mod;
    this.mostrarModalExcluirModulo = true;
  }

  fecharModalExcluirModulo(): void {
    if (this.salvandoExclusao) return;
    this.mostrarModalExcluirModulo = false;
    this.moduloEmExclusao = null;
    this.erroExclusao = '';
  }

  confirmarExclusaoModulo(): void {
    if (!this.moduloEmExclusao || this.salvandoExclusao) return;

    const modulo = this.moduloEmExclusao;
    const nomeModulo = modulo.nome;
    this.salvandoExclusao = true;
    this.erroExclusao = '';

    // Persiste a exclusão no backend ANTES de remover da lista local.
    this.moduloService.excluirModulo(this.codigoIdioma, modulo.id).subscribe({
      next: () => {
        this.modulos = this.modulos.filter(m => m.id !== modulo.id);
        this.limparSelecao();
        this.salvandoExclusao = false;
        this.fecharModalExcluirModulo();
        this.soundService.tocar('exclusao');
        this.exibirMensagemSucesso(`Módulo "${nomeModulo}" excluído com sucesso!`);
      },
      error: (err) => {
        this.salvandoExclusao = false;
        this.erroExclusao = err?.error?.message || 'Erro ao excluir o módulo. Tente novamente.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
      }
    });
  }

  // ===== MENSAGEM DE SUCESSO =====
  
  exibirMensagemSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mostrarMensagemSucesso = true;
    
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mostrarMensagemSucesso = false;
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }

  get idUsuarioFormatado(): string {
    return this.codigoCriador;
  }

  /**
   * Abre o perfil público do criador. Leva junto o código deste idioma e a
   * origem atual, para o Voltar do perfil retornar exatamente para cá.
   */
  navegarParaUsuario(): void {
    if (!this.codigoCriador) return;
    this.router.navigate(['/visualizar-usuario'], {
      queryParams: {
        id: this.codigoCriador,
        origem: 'visualizar-idioma',
        idioma: this.codigoIdioma,
        origemIdioma: this.origem
      }
    });
  }
}
