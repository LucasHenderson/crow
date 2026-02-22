import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IdiomaBusca as Idioma, Proficiencia } from '../../models/idioma.model';
import { UsuarioVisualizar as Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-visualizar-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private usuarioService: UsuarioService
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
        this.idiomas = data.idiomas || [];
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  /**
   * Copia o ID do usuário para a área de transferência
   */
  copiarId(): void {
    navigator.clipboard.writeText(this.usuario.codigo).then(() => {
      console.log('ID copiado:', this.usuario.codigo);
      // Aqui você pode adicionar um toast/notificação de sucesso
      // this.showToast('ID copiado para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar ID:', err);
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
    const nomes = {
      'iniciante': 'Iniciante',
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente'
    };
    return nomes[proficiencia];
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
   * Seleciona um idioma para visualização
   */
  selecionarIdioma(idioma: Idioma): void {
    console.log('Idioma selecionado:', idioma);
    this.router.navigate(['/visualizar-idioma']);
  }

  /**
   * Volta para a listagem anterior
   */
  voltar(): void {
    this.router.navigate(['/buscar-usuario']);
  }
}