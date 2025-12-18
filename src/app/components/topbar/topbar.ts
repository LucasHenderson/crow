import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class Topbar implements OnInit {

  menuAberto = false;
  nomeUsuario = 'Lucas';

  ngOnInit(): void {
    // Aqui você pode buscar o nome do usuário do localStorage ou de um serviço
    this.carregarNomeUsuario();
  }

  /**
   * Carrega o nome do usuário do localStorage ou serviço de autenticação
   */
  private carregarNomeUsuario(): void {
    // Exemplo: buscar do localStorage
    const usuario = localStorage.getItem('nomeUsuario');
    if (usuario) {
      this.nomeUsuario = usuario;
    }
    
    // Ou buscar de um serviço de autenticação
    // this.authService.getUsuarioAtual().subscribe(user => {
    //   this.nomeUsuario = user.nome;
    // });
  }

  /**
   * Alterna a visibilidade do menu dropdown
   */
  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  /**
   * Fecha o menu dropdown
   */
  fecharMenu(): void {
    this.menuAberto = false;
  }

  /**
   * Toggle para sidebar mobile (implementar conforme necessidade)
   */
  toggleSidebar(): void {
    console.log('Toggle sidebar');
    // Emitir evento para componente pai ou serviço
    // this.sidebarService.toggle();
  }

  /**
   * Fecha o menu ao clicar fora da área do usuário
   */
  @HostListener('document:click', ['$event'])
  cliqueFora(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Verifica se o clique foi fora da área do usuário
    if (!target.closest('.user-area')) {
      this.fecharMenu();
    }
  }

  /**
   * Fecha o menu ao pressionar ESC
   */
  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    this.fecharMenu();
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    console.log('Realizando logout...');
    
    // Limpar dados do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('nomeUsuario');
    
    // Ou chamar serviço de autenticação
    // this.authService.logout();
    
    this.fecharMenu();
    
    // A navegação para /login já é feita pelo routerLink no template
  }

  /**
   * Navega para configurações
   */
  configuracoes(): void {
    console.log('Abrindo configurações...');
    this.fecharMenu();
    // Navegação já é tratada pelo routerLink
  }

  /**
   * Navega para perfil
   */
  perfil(): void {
    console.log('Abrindo perfil...');
    this.fecharMenu();
    // Navegação já é tratada pelo routerLink
  }
}