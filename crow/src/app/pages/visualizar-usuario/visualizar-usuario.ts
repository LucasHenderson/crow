import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IdiomaBusca as Idioma, OrigemIdioma, Proficiencia, normalizarOrigem } from '../../models/idioma.model';
import { OrigemUsuario, UsuarioVisualizar as Usuario, normalizarOrigemUsuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { ClipboardService, EstadoCopia } from '../../services/clipboard.service';

@Component({
  selector: 'app-visualizar-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-usuario.html',
  styleUrl: './visualizar-usuario.css'
})
export class VisualizarUsuario implements OnInit, OnDestroy {

  usuario: Usuario = {
    codigo: '',
    nome: '',
    dataEntrada: new Date()
  };

  idiomas: Idioma[] = [];
  carregando = true;

  /** Tela de onde o perfil foi aberto — define para onde o botão Voltar leva. */
  origem: OrigemUsuario = 'buscar-usuario';
  /** Código do idioma de partida e a origem que ele tinha, quando `origem` é `visualizar-idioma`. */
  private idiomaDeOrigem = '';
  private origemDoIdioma: OrigemIdioma = 'home';

  /** Confirmação temporária ao copiar o código público do usuário. */
  readonly estadoCopiaId: EstadoCopia;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    clipboard: ClipboardService
  ) {
    this.estadoCopiaId = clipboard.criarEstado();
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.origem = normalizarOrigemUsuario(qp.get('origem'));
    this.idiomaDeOrigem = qp.get('idioma') || '';
    this.origemDoIdioma = normalizarOrigem(qp.get('origemIdioma'));
    const codigo = qp.get('id');
    if (codigo) {
      this.carregarUsuario(codigo);
    }
  }

  ngOnDestroy(): void {
    this.estadoCopiaId.destruir();
  }

  private carregarUsuario(codigo: string): void {
    this.carregando = true;
    this.usuarioService.getUsuarioPorCodigo(codigo).subscribe({
      next: (data) => {
        this.usuario = data;
        this.carregando = false;
        // App em modo zoneless: a atualização assíncrona não dispara
        // change detection sozinha — força a renderização dos dados.
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });

    this.usuarioService.getIdiomasPublicosDoUsuario(codigo).subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas;
        this.cdr.detectChanges();
      },
      error: () => {
        this.idiomas = [];
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Copia o ID do usuário e exibe a confirmação por alguns segundos.
   */
  copiarId(): void {
    this.estadoCopiaId.copiar(this.usuario.codigo);
  }

  /**
   * Retorna as iniciais do nome do usuário
   */
  getInitials(): string {
    if (!this.usuario.nome) return 'U';
    
    const names = this.usuario.nome.trim().split(' ');
    
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    
    return this.usuario.nome.charAt(0).toUpperCase();
  }

  /**
   * Retorna o nome formatado da proficiência
   */
  getNomeProficiencia(proficiencia: Proficiencia): string {
    const nomes: Record<string, string> = {
      'iniciante': 'Iniciante',
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente'
    };
    return nomes[proficiencia] || '—';
  }

  /**
   * Retorna array de booleanos para renderizar estrelas
   */
  estrelas(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  /**
   * Calcula a porcentagem de progresso dos módulos
   */
  calcularProgresso(modulos: number): number {
    return Math.round((modulos / 20) * 100);
  }

  /**
   * Abre a página de visualização do idioma selecionado.
   */
  selecionarIdioma(idioma: Idioma): void {
    if (!idioma?.codigo) return;
    this.router.navigate(['/visualizar-idioma'], {
      queryParams: { id: idioma.codigo, origem: 'visualizar-usuario' }
    });
  }

  /**
   * Retorna para a tela de origem informada na URL: o idioma de onde o perfil
   * foi aberto (com a origem que ele tinha) ou a busca de usuários. Substitui
   * o antigo `location.back()`, que fazia pingue-pongue com a tela do idioma.
   */
  voltar(): void {
    if (this.origem === 'visualizar-idioma' && this.idiomaDeOrigem) {
      this.router.navigate(['/visualizar-idioma'], {
        queryParams: { id: this.idiomaDeOrigem, origem: this.origemDoIdioma }
      });
      return;
    }
    this.router.navigate(['/buscar-usuario']);
  }
}