import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class Topbar implements OnInit, OnDestroy {

  menuAberto = false;
  nomeUsuario = '';
  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.nomeUsuario = user?.nome?.split(' ')[0] || '';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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

  logout(): void {
    this.authService.logout();
    this.fecharMenu();
    this.router.navigate(['/login']);
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