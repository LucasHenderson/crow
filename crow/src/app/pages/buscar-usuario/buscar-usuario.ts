import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioBusca as Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-buscar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscar-usuario.html',
  styleUrl: './buscar-usuario.css',
})
export class BuscarUsuario implements OnInit {

  busca = '';

  mostrarOrdenacao = false;
  criterio: 'nome' | 'idiomas' = 'nome';
  direcao: 'asc' | 'desc' = 'asc';

  paginaAtual = 1;
  porPagina = 9;
  carregando = true;

  usuarios: Usuario[] = [];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.usuarioService.buscarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  /**
   * Fecha os menus ao clicar fora
   */
  @HostListener('document:click', ['$event'])
  fecharMenus(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.ordenar-wrapper')) {
      this.mostrarOrdenacao = false;
    }
  }

  /**
   * Alterna visibilidade do menu de ordenação
   */
  toggleOrdenacao(): void {
    this.mostrarOrdenacao = !this.mostrarOrdenacao;
  }

  /**
   * 🔍 BUSCA - Filtra usuários baseado no texto de busca
   */
  onBuscar(valor: string): void {
    this.busca = valor.trim();
    this.paginaAtual = 1;
  }

  /**
   * 📊 ORDENAÇÃO - Altera o critério de ordenação
   */
  alterarCriterio(novo: 'nome' | 'idiomas'): void {
    if (this.criterio === novo) {
      this.toggleDirecao();
    } else {
      this.criterio = novo;
      this.direcao = 'asc';
    }
    this.paginaAtual = 1;
    this.mostrarOrdenacao = false;
  }

  /**
   * Inverte a direção da ordenação
   */
  toggleDirecao(): void {
    this.direcao = this.direcao === 'asc' ? 'desc' : 'asc';
  }

  /**
   * 📄 PAGINAÇÃO - Avança para próxima página
   */
  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas()) {
      this.paginaAtual++;
      this.scrollToTop();
    }
  }

  /**
   * Volta para página anterior
   */
  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.scrollToTop();
    }
  }

  /**
   * Scroll suave para o topo ao mudar de página
   */
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Retorna usuários filtrados pela busca
   */
  get usuariosFiltrados(): Usuario[] {
    let resultado = this.usuarios;

    // Filtro de busca (nome ou ID)
    if (this.busca) {
      const termo = this.busca.toLowerCase();
      resultado = resultado.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.id.toLowerCase().includes(termo)
      );
    }

    return this.ordenarUsuarios(resultado);
  }

  /**
   * Ordena os usuários baseado no critério selecionado
   */
  private ordenarUsuarios(usuarios: Usuario[]): Usuario[] {
    return [...usuarios].sort((a, b) => {
      const valA = this.criterio === 'nome'
        ? a.nome.toLowerCase()
        : a.quantidadeIdiomas;

      const valB = this.criterio === 'nome'
        ? b.nome.toLowerCase()
        : b.quantidadeIdiomas;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.direcao === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return this.direcao === 'asc' 
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }

  /**
   * Retorna usuários da página atual
   */
  get paginados(): Usuario[] {
    const inicio = (this.paginaAtual - 1) * this.porPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.porPagina);
  }

  /**
   * Calcula o total de páginas
   */
  totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.porPagina);
  }

  /**
   * Retorna as iniciais do nome do usuário
   */
  getInitials(nome: string): string {
    if (!nome) return 'U';
    
    const names = nome.trim().split(' ');
    
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    
    return nome.charAt(0).toUpperCase();
  }

  /**
   * Retorna o texto do contador de idiomas
   */
  getTextoIdiomas(quantidade: number): string {
    if (quantidade === 0) return 'Nenhum idioma';
    if (quantidade === 1) return '1 idioma';
    return `${quantidade} idiomas`;
  }

  /**
   * Texto dinâmico para o título dos resultados
   */
  get resultadosTexto(): string {
    const total = this.usuariosFiltrados.length;
    
    if (this.busca) {
      return total === 0 
        ? 'NENHUM RESULTADO' 
        : total === 1 
          ? '1 RESULTADO ENCONTRADO'
          : `${total} RESULTADOS ENCONTRADOS`;
    }
    
    return total === 1 
      ? '1 USUÁRIO CADASTRADO' 
      : `${total} USUÁRIOS CADASTRADOS`;
  }

  /**
   * Seleciona um usuário para visualização detalhada
   */
  selecionarUsuario(usuario: Usuario): void {
    console.log('Usuário selecionado:', usuario);
    this.router.navigate(['/visualizar-usuario']);
  }
}