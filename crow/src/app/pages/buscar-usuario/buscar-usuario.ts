import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioBusca as Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-buscar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscar-usuario.html',
  styleUrl: './buscar-usuario.css',
})
export class BuscarUsuario {

  busca = '';
  
  mostrarOrdenacao = false;
  criterio: 'nome' | 'idiomas' = 'nome';
  direcao: 'asc' | 'desc' = 'asc';
  
  paginaAtual = 1;
  porPagina = 9;

  usuarios: Usuario[] = [
    {
      id: 'USR-2024-001',
      nome: 'Lucas Henderson',
      email: 'lucas@gmail.com',
      dataEntrada: new Date('2023-01-15'),
      quantidadeIdiomas: 3
    },
    {
      id: 'USR-2024-002',
      nome: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      dataEntrada: new Date('2023-03-22'),
      quantidadeIdiomas: 4
    },
    {
      id: 'USR-2024-003',
      nome: 'João Pedro Oliveira',
      email: 'joao.oliveira@email.com',
      dataEntrada: new Date('2023-05-10'),
      quantidadeIdiomas: 2
    },
    {
      id: 'USR-2024-004',
      nome: 'Ana Carolina Ferreira',
      email: 'ana.ferreira@email.com',
      dataEntrada: new Date('2023-07-18'),
      quantidadeIdiomas: 1
    },
    {
      id: 'USR-2024-005',
      nome: 'Carlos Eduardo Lima',
      email: 'carlos.lima@email.com',
      dataEntrada: new Date('2023-08-25'),
      quantidadeIdiomas: 0
    },
    {
      id: 'USR-2024-006',
      nome: 'Fernanda Costa Rodrigues',
      email: 'fernanda.costa@email.com',
      dataEntrada: new Date('2023-09-12'),
      quantidadeIdiomas: 4
    },
    {
      id: 'USR-2024-007',
      nome: 'Rafael Souza Mendes',
      email: 'rafael.souza@email.com',
      dataEntrada: new Date('2023-10-08'),
      quantidadeIdiomas: 2
    },
    {
      id: 'USR-2024-008',
      nome: 'Juliana Alves Pereira',
      email: 'juliana.alves@email.com',
      dataEntrada: new Date('2023-11-20'),
      quantidadeIdiomas: 3
    },
    {
      id: 'USR-2024-009',
      nome: 'Bruno Henrique Martins',
      email: 'bruno.martins@email.com',
      dataEntrada: new Date('2024-01-05'),
      quantidadeIdiomas: 1
    },
    {
      id: 'USR-2024-010',
      nome: 'Patricia Gomes Azevedo',
      email: 'patricia.gomes@email.com',
      dataEntrada: new Date('2024-02-14'),
      quantidadeIdiomas: 4
    },
    {
      id: 'USR-2024-011',
      nome: 'Ricardo Barbosa Santos',
      email: 'ricardo.barbosa@email.com',
      dataEntrada: new Date('2024-03-30'),
      quantidadeIdiomas: 0
    },
    {
      id: 'USR-2024-012',
      nome: 'Camila Rodrigues Freitas',
      email: 'camila.freitas@email.com',
      dataEntrada: new Date('2024-04-17'),
      quantidadeIdiomas: 2
    }
  ];

  constructor(private router: Router) {}

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