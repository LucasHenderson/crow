import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(campo: 'senha'): void {
    this.camposVisiveis[campo] = !this.camposVisiveis[campo];
  }

  entrar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, senha } = this.loginForm.value;
    this.carregando = true;
    this.erroLogin = '';

    this.authService.login(email, senha).subscribe({
      next: () => {
        this.carregando = false;
        const role = this.authService.getRole();
        this.router.navigate([role === 'admin' ? '/controle-adm' : '/home']);
      },
      error: (err) => {
        this.carregando = false;
        this.erroLogin = err.error?.message || 'Email ou senha incorretos.';
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

  get podeEnviar(): boolean {
    return this.loginForm.valid && !this.carregando;
  }
}