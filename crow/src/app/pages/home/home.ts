import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { Idioma, IdiomaOpcao, IDIOMAS_DISPONIVEIS, PROFICIENCIAS } from '../../models';
import { IdiomaService } from '../../services/idioma.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {

  idiomas: Idioma[] = [];
  carregando = true;
  salvandoEdicao = false;
  excluindoIdioma = false;
  erroEdicao = '';
  erroExclusao = '';
  private navSub?: Subscription;

  // Controle dos modals
  mostrarModalEdicao = false;
  mostrarModalExclusao = false;
  mostrarModalOpcoes = false; // NOVO: Modal de opções ao adicionar idioma
  
  // Mensagem de sucesso
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';
  
  // Dados de edição
  idiomaEmEdicao: Idioma | null = null;
  indiceEdicao = -1;
  
  // Campos do formulário de edição
  nomeEdicao = '';
  idiomaSelecionadoEdicao: IdiomaOpcao | null = null;
  descricaoEdicao = '';
  proficienciaEdicao = '';
  visibilidadeEdicao: 'publico' | 'privado' = 'publico';
  
  // Dropdowns
  mostrarIdiomasEdicao = false;
  mostrarProficienciaEdicao = false;
  buscaIdiomaEdicao = '';
  
  // Dados de exclusão
  idiomaEmExclusao: Idioma | null = null;
  indiceExclusao = -1;
  
  // Opções disponíveis
  idiomasDisponiveis = IDIOMAS_DISPONIVEIS;

  proficiencias = PROFICIENCIAS;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private idiomaService: IdiomaService
  ) {}

  ngOnInit(): void {
    const state = history.state as { mensagemSucesso?: string } | null;
    if (state?.mensagemSucesso) {
      this.exibirMensagemSucesso(state.mensagemSucesso);
      history.replaceState({}, '');
    }
    this.carregarIdiomas();

    this.navSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(event => event.urlAfterRedirects === '/home' || event.urlAfterRedirects.startsWith('/home?'))
    ).subscribe(() => this.carregarIdiomas());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  carregarIdiomas(): void {
    this.carregando = true;
    this.cdr.markForCheck();
    this.idiomaService.getIdiomasUsuario().subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas.map((i: any) => ({
          ...i,
          nota: i.nota ?? Math.round(i.avaliacao ?? 0)
        }));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar idiomas:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapProficienciaParaBackend(nivel: string): string {
    const mapa: { [k: string]: string } = {
      'Iniciante': 'INICIANTE',
      'Básico': 'BASICO',
      'Intermediário': 'INTERMEDIARIO',
      'Avançado': 'AVANCADO',
      'Fluente': 'FLUENTE'
    };
    return mapa[nivel] || nivel.toUpperCase();
  }

  /**
   * Abre o modal de opções para adicionar idioma
   */
  adicionarIdioma(): void {
    if (this.idiomas.length >= 4) {
      console.warn('Limite máximo de 4 idiomas atingido');
      return;
    }
    this.mostrarModalOpcoes = true;
  }

  /**
   * Fecha o modal de opções
   */
  fecharModalOpcoes(): void {
    this.mostrarModalOpcoes = false;
  }

  /**
   * Navega para buscar idioma
   */
  buscarIdioma(): void {
    console.log('Navegar para Buscar Idioma');
    this.fecharModalOpcoes();
    this.router.navigate(['/buscar-idioma']);
  }

  /**
   * Navega para buscar usuário
   */
  buscarUsuario(): void {
    console.log('Navegar para Buscar Usuário');
    this.fecharModalOpcoes();
    this.router.navigate(['/buscar-usuario']);
  }

  /**
   * Navega para criar novo idioma
   */
  novoIdioma(): void {
    console.log('Navegar para Cadastrar Novo Idioma');
    this.fecharModalOpcoes();
    this.router.navigate(['/cadastrar-idioma']);
  }

  /**
   * Gerar idioma com IA (desabilitado por enquanto)
   */
  gerarIdiomaIA(): void {
    console.log('Funcionalidade de IA em desenvolvimento');
    // Será implementado em breve
  }

  /**
   * Seleciona um idioma para visualização
   */
  selecionarIdioma(idioma: Idioma): void {
    if (!idioma?.id) return;
    this.router.navigate(['/visualizar-idioma'], { queryParams: { id: idioma.id } });
  }

  /**
   * Abre o modal de edição
   */
  editarIdioma(idioma: Idioma, index: number): void {
    this.idiomaEmEdicao = { ...idioma };
    this.indiceEdicao = index;

    const nomeLinguagem = (idioma as any).idioma || idioma.nome;

    this.nomeEdicao = idioma.nome;
    this.idiomaSelecionadoEdicao = this.idiomasDisponiveis.find(i => i.nome === nomeLinguagem) || null;
    this.descricaoEdicao = idioma.descricao;
    this.proficienciaEdicao = this.mapProficienciaParaLabel(idioma.proficiencia);
    this.visibilidadeEdicao = (idioma.visibilidade?.toLowerCase() as 'publico' | 'privado') || 'publico';

    this.mostrarModalEdicao = true;
  }

  private mapProficienciaParaLabel(valor: string | undefined): string {
    if (!valor) return 'Básico';
    const mapa: { [k: string]: string } = {
      'iniciante': 'Iniciante',
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente'
    };
    return mapa[valor.toLowerCase()] || valor;
  }

  /**
   * Salva as alterações do idioma
   */
  salvarEdicao(): void {
    if (this.salvandoEdicao) return;
    if (!this.podeAvancarEdicao() || !this.idiomaEmEdicao?.id || !this.idiomaSelecionadoEdicao) {
      this.erroEdicao = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.salvandoEdicao = true;
    this.erroEdicao = '';
    this.cdr.markForCheck();

    const dados = {
      nome: this.nomeEdicao.trim(),
      idioma: this.idiomaSelecionadoEdicao.nome,
      bandeira: this.idiomaSelecionadoEdicao.bandeira,
      descricao: this.descricaoEdicao,
      proficiencia: this.mapProficienciaParaBackend(this.proficienciaEdicao),
      visibilidade: this.visibilidadeEdicao.toUpperCase()
    };

    this.idiomaService.editarIdioma(this.idiomaEmEdicao.id, dados).subscribe({
      next: () => {
        const nome = this.nomeEdicao;
        this.salvandoEdicao = false;
        this.fecharModalEdicao();
        this.cdr.detectChanges();
        this.exibirMensagemSucesso(`Idioma "${nome}" editado com sucesso!`);
        this.carregarIdiomas();
      },
      error: (err) => {
        this.salvandoEdicao = false;
        this.erroEdicao = err?.error?.message || 'Erro ao editar idioma.';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Fecha o modal de edição
   */
  fecharModalEdicao(): void {
    this.mostrarModalEdicao = false;
    this.idiomaEmEdicao = null;
    this.indiceEdicao = -1;
    this.erroEdicao = '';
    this.limparCamposEdicao();
  }

  /**
   * Limpa os campos de edição
   */
  limparCamposEdicao(): void {
    this.nomeEdicao = '';
    this.idiomaSelecionadoEdicao = null;
    this.descricaoEdicao = '';
    this.proficienciaEdicao = '';
    this.visibilidadeEdicao = 'publico';
    this.buscaIdiomaEdicao = '';
    this.mostrarIdiomasEdicao = false;
    this.mostrarProficienciaEdicao = false;
  }

  /**
   * Abre o modal de exclusão
   */
  excluirIdioma(idioma: Idioma, index: number): void {
    this.idiomaEmExclusao = idioma;
    this.indiceExclusao = index;
    this.mostrarModalExclusao = true;
  }

  /**
   * Confirma a exclusão do idioma
   */
  confirmarExclusao(): void {
    if (this.excluindoIdioma) return;
    if (!this.idiomaEmExclusao?.id) {
      this.erroExclusao = 'Idioma inválido.';
      return;
    }

    this.excluindoIdioma = true;
    this.erroExclusao = '';
    this.cdr.markForCheck();
    const nomeIdioma = this.idiomaEmExclusao.nome;

    this.idiomaService.excluirIdioma(this.idiomaEmExclusao.id).subscribe({
      next: () => {
        this.excluindoIdioma = false;
        this.fecharModalExclusao();
        this.cdr.detectChanges();
        this.exibirMensagemSucesso(`Idioma "${nomeIdioma}" excluído com sucesso!`);
        this.carregarIdiomas();
      },
      error: (err) => {
        this.excluindoIdioma = false;
        this.erroExclusao = err?.error?.message || 'Erro ao excluir idioma.';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Fecha o modal de exclusão
   */
  fecharModalExclusao(): void {
    this.mostrarModalExclusao = false;
    this.idiomaEmExclusao = null;
    this.indiceExclusao = -1;
    this.erroExclusao = '';
  }

  /**
   * Retorna array de booleanos para renderizar estrelas
   */
  estrelasArray(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  /**
   * Calcula o progresso percentual baseado nos módulos
   */
  calcularProgresso(modulos: number): number {
    return Math.round((modulos / 20) * 100);
  }

  // ===== FUNÇÕES DO MODAL DE EDIÇÃO =====

  get idiomasFiltradosEdicao(): IdiomaOpcao[] {
    if (!this.buscaIdiomaEdicao.trim()) return this.idiomasDisponiveis;
    const termo = this.buscaIdiomaEdicao.toLowerCase();
    return this.idiomasDisponiveis.filter(i => i.nome.toLowerCase().includes(termo));
  }

  toggleIdiomasEdicao(): void {
    this.mostrarIdiomasEdicao = !this.mostrarIdiomasEdicao;
    this.mostrarProficienciaEdicao = false;
  }

  toggleProficienciaEdicao(): void {
    this.mostrarProficienciaEdicao = !this.mostrarProficienciaEdicao;
    this.mostrarIdiomasEdicao = false;
  }

  selecionarIdiomaEdicao(idioma: IdiomaOpcao): void {
    this.idiomaSelecionadoEdicao = idioma;
    this.mostrarIdiomasEdicao = false;
    this.buscaIdiomaEdicao = '';
  }

  selecionarProficienciaEdicao(nivel: string): void {
    this.proficienciaEdicao = nivel;
    this.mostrarProficienciaEdicao = false;
  }

  podeAvancarEdicao(): boolean {
    return !!(this.nomeEdicao.trim() && this.idiomaSelecionadoEdicao && this.descricaoEdicao.trim() && this.proficienciaEdicao && this.visibilidadeEdicao);
  }

  fecharDropdownsEdicao(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.campo')) {
      this.mostrarIdiomasEdicao = false;
      this.mostrarProficienciaEdicao = false;
    }
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
}