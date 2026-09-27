import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IdiomaAdm } from '../../models/idioma.model';
import { ModuloAdm } from '../../models/modulo.model';
import { Frase, PalavraTrad, Par } from '../../models/frase.model';
import { AdminService } from '../../services/admin.service';
import { SoundService } from '../../services/sound.service';

/** Módulo pronto para o template: ícone sanitizado, frases enriquecidas e estado do acordeão. */
interface ModuloVisualizacao {
  modulo: ModuloAdm;
  icone: SafeHtml;
  frases: Frase[];
  expandido: boolean;
}

/**
 * Visualização administrativa de um idioma (`/visualizar-idioma-adm?id=IDM-...`).
 *
 * O administrador é moderador, não editor: esta tela mostra os dados do
 * idioma, seus módulos e, dentro de cada um, as frases — tudo somente leitura.
 * A única ação disponível é excluir o idioma inteiro, com aviso por e-mail ao
 * proprietário. Não existe aqui nenhum botão de cadastro, edição ou exclusão
 * de módulo ou frase, de propósito.
 */
@Component({
  selector: 'app-visualizar-idioma-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-idioma-adm.html',
  styleUrl: './visualizar-idioma-adm.css',
})
export class VisualizarIdiomaAdm implements OnInit {

  /** Código público do idioma (IDM-...), recebido pelo query param `id`. */
  codigo = '';
  idioma: IdiomaAdm | null = null;
  modulos: ModuloVisualizacao[] = [];
  carregando = true;
  /** Mensagem de erro do carregamento (idioma inexistente, sem permissão, etc.). */
  erroCarregamento = '';
  /** Fica verdadeiro depois da exclusão: a página troca o conteúdo pelo aviso de remoção. */
  excluido = false;

  // Modal Excluir Idioma — limite igual ao do ExcluirIdiomaRequest do backend
  mostrarModalExcluir = false;
  readonly limiteMensagemExclusao = 1000;
  mensagemExclusao = '';
  excluindo = false;
  erroExclusao = '';

  // Mensagem de sucesso
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';

  private readonly iconesModo: Record<string, string> = {
    traducao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>',
    pares: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 2 2 4-4"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>'
  };

  /** Ícone de módulo padrão para registros sem SVG salvo — o mesmo desenho das telas de usuário. */
  private readonly iconeModuloPadrao =
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private adminService: AdminService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.codigo = this.route.snapshot.queryParamMap.get('id') || '';
    // A lista de idiomas costuma estar rolada; a página nova começa do topo.
    window.scrollTo({ top: 0 });
    this.carregar();
  }

  // ===== CARREGAMENTO =====

  carregar(): void {
    if (!this.codigo) {
      this.carregando = false;
      this.erroCarregamento = 'Nenhum idioma informado.';
      return;
    }

    this.carregando = true;
    this.erroCarregamento = '';

    this.adminService.getIdiomaCompletoAdmin(this.codigo).subscribe({
      next: (completo) => {
        this.idioma = completo.idioma;
        this.modulos = completo.modulos.map(m => ({
          modulo: m.modulo,
          icone: this.sanitizer.bypassSecurityTrustHtml(
            m.modulo.icone && m.modulo.icone.trim() ? m.modulo.icone : this.iconeModuloPadrao
          ),
          frases: m.frases.map(f => this.enriquecerFrase(f)),
          expandido: false
        }));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        this.erroCarregamento = err?.error?.message || 'Não foi possível carregar o idioma.';
        this.cdr.detectChanges();
      }
    });
  }

  /** Mesmo tratamento de `visualizar-modulo`: campos *Json viram arrays e o vídeo vira URL de embed. */
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

  // ===== NAVEGAÇÃO =====

  /** Volta para o controle administrativo já na aba de idiomas. */
  voltar(): void {
    this.router.navigate(['/controle-adm'], { queryParams: { aba: 'idiomas' } });
  }

  // ===== MÓDULOS (acordeão) =====

  alternarModulo(item: ModuloVisualizacao): void {
    item.expandido = !item.expandido;
  }

  get todosExpandidos(): boolean {
    return this.modulos.length > 0 && this.modulos.every(m => m.expandido);
  }

  alternarTodos(): void {
    const expandir = !this.todosExpandidos;
    this.modulos.forEach(m => m.expandido = expandir);
  }

  get totalFrases(): number {
    return this.modulos.reduce((total, m) => total + m.frases.length, 0);
  }

  // ===== APRESENTAÇÃO =====

  estrelas(nota: number): boolean[] {
    const notaArredondada = Math.ceil(nota || 0);
    return Array.from({ length: 5 }, (_, i) => i < notaArredondada);
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  proficienciaLabel(valor: string | undefined): string {
    const mapa: Record<string, string> = {
      'iniciante': 'Iniciante',
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente'
    };
    return valor ? (mapa[valor.toLowerCase()] || valor) : '—';
  }

  visibilidadeLabel(valor: string | undefined): string {
    return valor === 'privado' ? 'Privado' : 'Público';
  }

  formatarData(iso: string | null | undefined): string {
    if (!iso) return '—';
    const data = new Date(iso);
    if (isNaN(data.getTime())) return '—';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }

  // ===== EXCLUSÃO =====

  abrirModalExcluir(): void {
    if (!this.idioma) return;
    this.mensagemExclusao = '';
    this.erroExclusao = '';
    this.excluindo = false;
    this.mostrarModalExcluir = true;
    this.soundService.tocar('alerta');
  }

  fecharModalExcluir(): void {
    if (this.excluindo) return;
    this.mostrarModalExcluir = false;
    this.mensagemExclusao = '';
    this.erroExclusao = '';
  }

  /**
   * Exclui o idioma e avisa o proprietário por e-mail. A mensagem é opcional:
   * em branco, o backend envia o aviso padrão da equipe de moderação.
   */
  confirmarExclusao(): void {
    if (!this.idioma || this.excluindo) return;

    const nomeIdioma = this.idioma.nome;
    const mensagem = this.mensagemExclusao.trim();
    this.excluindo = true;
    this.erroExclusao = '';

    this.adminService.excluirIdiomaAdmin(this.idioma.codigo, mensagem ? { mensagem } : {}).subscribe({
      next: () => {
        this.excluindo = false;
        this.mostrarModalExcluir = false;
        this.excluido = true;
        this.modulos = [];
        this.soundService.tocar('exclusao');
        this.exibirMensagemSucesso(`Idioma "${nomeIdioma}" excluído. O proprietário foi avisado por e-mail.`);
      },
      error: (err) => {
        this.excluindo = false;
        this.erroExclusao = err?.error?.message || 'Erro ao excluir idioma.';
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
      this.cdr.detectChanges();
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }
}
