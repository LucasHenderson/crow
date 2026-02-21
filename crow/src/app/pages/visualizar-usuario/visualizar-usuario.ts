import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IdiomaBusca as Idioma, Proficiencia } from '../../models/idioma.model';
import { UsuarioVisualizar as Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-visualizar-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visualizar-usuario.html',
  styleUrl: './visualizar-usuario.css'
})
export class VisualizarUsuario implements OnInit {

  usuario: Usuario = {
    id: 'USR-2024-001',
    nome: 'Lucas Henderson',
    email: 'lucas@gmail.com',
    dataEntrada: new Date('2023-01-15')
  };

  // Lista de idiomas do usuário (0 a 4 idiomas)
  idiomas: Idioma[] = [
    {
      id: '000001',
      nome: 'Japonês para iniciantes',
      idioma: 'Japonês',
      bandeira: '../../../assets/imgs/Japan-Flag.png',
      modulos: 5,
      avaliacao: 5,
      criadoEm: new Date('2024-05-01'),
      proficiencia: 'iniciante'
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/United-States-Flag.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12'),
      proficiencia: 'avancado'
    },
    {
      id: '000003',
      nome: 'Comidas Russas',
      idioma: 'Russo',
      bandeira: '../../../assets/imgs/Russia-Flag.svg',
      modulos: 15,
      avaliacao: 3,
      criadoEm: new Date('2024-03-22'),
      proficiencia: 'intermediario'
    }
  ];

  // Descomente para testar estado vazio:
  // idiomas: Idioma[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Carregar dados do usuário (pode vir de um serviço ou rota)
    this.carregarUsuario();
  }

  /**
   * Carrega os dados do usuário
   * Em produção, isso viria de um serviço ou parâmetro de rota
   */
  private carregarUsuario(): void {
    // Exemplo: buscar ID da rota
    // const userId = this.route.snapshot.paramMap.get('id');
    // this.userService.getUsuario(userId).subscribe(user => {
    //   this.usuario = user;
    //   this.idiomas = user.idiomas;
    // });
  }

  /**
   * Copia o ID do usuário para a área de transferência
   */
  copiarId(): void {
    navigator.clipboard.writeText(this.usuario.id).then(() => {
      console.log('ID copiado:', this.usuario.id);
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