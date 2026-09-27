import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SoundService } from '../../services/sound.service';

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
  /** Administrador não tem perfil próprio na plataforma: o menu mostra só "Sair". */
  isAdmin = false;
  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    public soundService: SoundService
  ) {}

  /** Alterna o tema (persistido pelo ThemeService); a animação parte do botão clicado. */
  alternarTema(evento: Event): void {
    this.themeService.toggle(evento.currentTarget as Element);
  }

  /**
   * Liga/desliga os efeitos sonoros (persistido pelo SoundService). Ao ligar,
   * toca uma amostra: é a única confirmação de que o áudio funciona neste
   * navegador, e o clique garante o gesto exigido pela política de autoplay.
   */
  alternarSons(): void {
    this.soundService.toggle();
    if (this.soundService.ativo()) {
      this.soundService.tocar('acerto');
    }
  }

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.nomeUsuario = this.capitalizar(user?.nome?.trim().split(/\s+/)[0] || '');
      this.isAdmin = user?.role === 'admin';
    });
  }

  /**
   * Deixa apenas a primeira letra maiuscula ("lucas" e "LUCAS" viram "Lucas").
   */
  private capitalizar(nome: string): string {
    if (!nome) {
      return '';
    }
    return nome.charAt(0).toLocaleUpperCase('pt-BR') + nome.slice(1).toLocaleLowerCase('pt-BR');
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
   * Fecha o menu ao navegar para o perfil (a navegação é feita pelo routerLink)
   */
  perfil(): void {
    this.fecharMenu();
  }
}