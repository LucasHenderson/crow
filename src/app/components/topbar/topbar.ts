import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class Topbar {

  menuAberto = false;

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu() {
    this.menuAberto = false;
  }

  @HostListener('document:click', ['$event'])
  cliqueFora(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-area')) {
      this.menuAberto = false;
    }
  }

  logout() {
    alert('Logout realizado');
  }

  configuracoes() {
    alert('Abrir configurações');
  }
}
