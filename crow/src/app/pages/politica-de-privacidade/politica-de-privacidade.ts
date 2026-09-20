import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-politica-de-privacidade',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './politica-de-privacidade.html',
  styleUrl: './politica-de-privacidade.css',
})
export class PoliticaDePrivacidade {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  /** Volta para a página anterior (respeita o histórico) ou para o login. */
  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/login']);
    }
  }
}
