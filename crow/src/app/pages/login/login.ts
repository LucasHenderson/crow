import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;
  erroLogin = '';
  carregando = false;

  camposVisiveis = {
    senha: false
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
    private soundService: SoundService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Alterna o tema (persistido pelo ThemeService); a animação parte do botão clicado. */
  alternarTema(evento: Event): void {
    this.themeService.toggle(evento.currentTarget as Element);
  }

  togglePassword(campo: 'senha'): void {
    this.camposVisiveis[campo] = !this.camposVisiveis[campo];
  }

  entrar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.soundService.tocar('erro');
      return;
    }

    const { email, senha } = this.loginForm.value;
    this.carregando = true;
    this.erroLogin = '';

    this.authService.login(email, senha).subscribe({
      next: () => {
        this.carregando = false;
        this.soundService.tocar('sucesso');
        const role = this.authService.getRole();
        this.router.navigate([role === 'admin' ? '/controle-adm' : '/home']);
      },
      error: (err) => {
        this.carregando = false;
        this.erroLogin = err.error?.message || 'Email ou senha incorretos.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
      }
    });
  }

  esqueceuSenha(): void {
    this.router.navigate(['/recuperar-senha']);
  }

  cadastrarUsuario(): void {
    this.router.navigate(['/cadastrar-usuario']);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

}
