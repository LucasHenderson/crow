import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IdiomaBusca as Idioma, Proficiencia } from '../../models/idioma.model';
import { UsuarioVisualizar as Usuario } from '../../models/usuario.model';
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

  /** Confirmação temporária ao copiar o código público do usuário. */
  readonly estadoCopiaId: EstadoCopia;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    clipboard: ClipboardService
  ) {
    this.estadoCopiaId = clipboard.criarEstado();
  }

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('id');
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
   * Volta para a página de onde o usuário veio (respeita o histórico);
   * sem histórico, cai na listagem de usuários.
   */
  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/buscar-usuario']);
    }
  }
}