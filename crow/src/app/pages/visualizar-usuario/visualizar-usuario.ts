import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IdiomaBusca as Idioma, Proficiencia } from '../../models/idioma.model';
import { UsuarioVisualizar as Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-visualizar-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-usuario.html',
  styleUrl: './visualizar-usuario.css'
})
export class VisualizarUsuario implements OnInit {

  usuario: Usuario = {
    id: 0,
    codigo: '',
    nome: '',
    email: '',
    dataEntrada: new Date()
  };

  idiomas: Idioma[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.carregarUsuario(id);
    }
  }

  private carregarUsuario(id: string): void {
    this.carregando = true;
    this.usuarioService.getUsuarioPorId(id).subscribe({
      next: (data: any) => {
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

    this.usuarioService.getIdiomasPublicosDoUsuario(id).subscribe({
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
   * Copia o ID do usuário para a área de transferência
   */
  copiarId(): void {
    navigator.clipboard.writeText(this.usuario.codigo).catch(() => {
      // Clipboard indisponível (ex.: contexto não seguro) — ação é opcional.
    });
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
    if (!idioma?.id) return;
    this.router.navigate(['/visualizar-idioma'], {
      queryParams: { id: idioma.id }
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