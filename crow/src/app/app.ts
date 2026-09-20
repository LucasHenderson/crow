import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { SoundService } from './services/sound.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('crow');

  constructor(
    private themeService: ThemeService,
    private soundService: SoundService
  ) {
    // Aplica o tema salvo (ou o padrão escuro) assim que a aplicação inicia.
    this.themeService.init();
    // Lê a preferência de sons; o contexto de áudio só nasce no primeiro clique.
    this.soundService.init();
  }
}
