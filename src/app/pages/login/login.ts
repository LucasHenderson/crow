import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;

  camposVisiveis = {
    senha: false
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
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
    // Marca todos os campos como tocados para exibir erros
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.warn('Formulário inválido. Verifique os campos.');
      return;
    }

    // Dados do formulário
    const { email, senha } = this.loginForm.value;
    
    console.log('Tentativa de login:', { email, senha: '***' });

    // Simulação de login bem-sucedido
    // Aqui você implementaria a chamada ao seu serviço de autenticação
    this.realizarLogin(email, senha);
  }

  private realizarLogin(email: string, senha: string): void {
    // Simulação de autenticação
    // Em produção, substituir por chamada real ao backend
    
    // Exemplo de validação simples (remover em produção)
    if (email && senha.length >= 6) {
      console.log('Login realizado com sucesso!');
      
      // Armazena o token (exemplo)
      // localStorage.setItem('authToken', 'seu-token-aqui');
      
      // Navega para a página home
      // this.router.navigate(['/home']);
      
      alert('Login realizado com sucesso!');
    } else {
      console.error('Credenciais inválidas');
      alert('Email ou senha incorretos');
    }
  }

  // Getters para facilitar acesso aos controles no template
  get email() {
    return this.loginForm.get('email');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

  // Verifica se o formulário pode ser enviado
  get podeEnviar(): boolean {
    return this.loginForm.valid;
  }
}