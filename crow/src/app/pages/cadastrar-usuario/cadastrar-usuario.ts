import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NovoUsuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

type CamposSenha = {
  senha: boolean;
  confirmarSenha: boolean;
};

@Component({
  selector: 'app-cadastrar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.css',
})
export class CadastrarUsuario {

  novoUsuario: NovoUsuario = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    aceitouTermos: false
  };

  camposVisiveis: CamposSenha = {
    senha: false,
    confirmarSenha: false
  };

  enviandoFormulario = false;
  erroCadastro = '';

  // Verificação de email
  emailVerificado = false;
  codigoEnviado = false;
  codigoDigitado = '';
  enviandoCodigo = false;
  verificandoCodigo = false;
  mensagemEmail = '';
  erroEmail = false;
  private emailVerificadoValor = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  formularioValido(): boolean {
    return !!(
      this.novoUsuario.nome.trim() &&
      this.novoUsuario.email.trim() &&
      this.novoUsuario.senha &&
      this.novoUsuario.confirmarSenha &&
      this.novoUsuario.aceitouTermos &&
      this.emailVerificado
    );
  }

  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  // --- Verificação de Email ---

  onEmailChange(): void {
    if (this.emailVerificado && this.novoUsuario.email !== this.emailVerificadoValor) {
      this.emailVerificado = false;
      this.codigoEnviado = false;
      this.codigoDigitado = '';
      this.mensagemEmail = '';
      this.erroEmail = false;
      this.emailVerificadoValor = '';
    }
  }

  podeEnviarCodigo(): boolean {
    return this.validarEmail(this.novoUsuario.email) && !this.enviandoCodigo && !this.emailVerificado;
  }

  enviarCodigo(): void {
    if (!this.validarEmail(this.novoUsuario.email)) {
      this.mensagemEmail = 'Informe um email válido.';
      this.erroEmail = true;
      return;
    }

    this.enviandoCodigo = true;
    this.mensagemEmail = '';
    this.erroEmail = false;

    this.authService.enviarCodigoVerificacao(this.novoUsuario.email).subscribe({
      next: () => {
        this.enviandoCodigo = false;
        this.codigoEnviado = true;
        this.mensagemEmail = 'Código enviado! Verifique sua caixa de entrada.';
        this.erroEmail = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.enviandoCodigo = false;
        this.mensagemEmail = err.error?.message || 'Erro ao enviar código. Tente novamente.';
        this.erroEmail = true;
        this.cdr.detectChanges();
      }
    });
  }

  verificarCodigo(): void {
    if (!this.codigoDigitado || this.codigoDigitado.length !== 6) {
      this.mensagemEmail = 'Digite o código de 6 dígitos.';
      this.erroEmail = true;
      return;
    }

    this.verificandoCodigo = true;
    this.mensagemEmail = '';
    this.erroEmail = false;

    this.authService.verificarCodigo(this.novoUsuario.email, this.codigoDigitado).subscribe({
      next: (res) => {
        this.verificandoCodigo = false;
        if (res.valido) {
          this.emailVerificado = true;
          this.emailVerificadoValor = this.novoUsuario.email;
          this.mensagemEmail = 'Email verificado com sucesso!';
          this.erroEmail = false;
        } else {
          this.mensagemEmail = 'Código inválido ou expirado. Tente novamente.';
          this.erroEmail = true;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.verificandoCodigo = false;
        this.mensagemEmail = 'Erro ao verificar código. Tente novamente.';
        this.erroEmail = true;
        this.cdr.detectChanges();
      }
    });
  }

  permitirApenasNumerosCodigo(event: KeyboardEvent): boolean {
    const tecla = event.key;
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(tecla)) {
      return true;
    }
    if (!/^\d$/.test(tecla)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // --- Cadastro ---

  cadastrar(): void {
    this.erroCadastro = '';

    if (!this.validarCamposObrigatorios()) {
      return;
    }

    if (!this.validarEmail(this.novoUsuario.email)) {
      this.erroCadastro = 'Por favor, insira um email válido.';
      return;
    }

    if (!this.emailVerificado) {
      this.erroCadastro = 'Por favor, verifique seu email antes de continuar.';
      return;
    }

    if (!this.validarSenha()) {
      return;
    }

    if (!this.novoUsuario.aceitouTermos) {
      this.erroCadastro = 'Você precisa aceitar os termos de uso e política de privacidade.';
      return;
    }

    this.enviandoFormulario = true;

    this.authService.register({
      nome: this.novoUsuario.nome,
      email: this.novoUsuario.email,
      senha: this.novoUsuario.senha
    }).subscribe({
      next: () => {
        this.enviandoFormulario = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.enviandoFormulario = false;
        this.erroCadastro = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  private validarCamposObrigatorios(): boolean {
    if (!this.novoUsuario.nome.trim() || this.novoUsuario.nome.trim().length < 8) {
      this.erroCadastro = 'Por favor, informe seu nome completo (mínimo 8 caracteres).';
      return false;
    }

    if (!this.novoUsuario.email.trim()) {
      this.erroCadastro = 'Por favor, informe seu email.';
      return false;
    }

    if (!this.novoUsuario.senha) {
      this.erroCadastro = 'Por favor, informe uma senha.';
      return false;
    }

    if (!this.novoUsuario.confirmarSenha) {
      this.erroCadastro = 'Por favor, confirme sua senha.';
      return false;
    }

    return true;
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private validarSenha(): boolean {
    if (this.novoUsuario.senha.length < 6) {
      this.erroCadastro = 'A senha deve ter no mínimo 6 caracteres.';
      return false;
    }

    if (this.novoUsuario.senha !== this.novoUsuario.confirmarSenha) {
      this.erroCadastro = 'As senhas não coincidem.';
      return false;
    }

    const temLetra = /[a-zA-Z]/.test(this.novoUsuario.senha);
    const temNumero = /[0-9]/.test(this.novoUsuario.senha);

    if (!temLetra || !temNumero) {
      this.erroCadastro = 'A senha deve conter pelo menos uma letra e um número.';
      return false;
    }

    return true;
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  getForcaSenha(): number {
    const senha = this.novoUsuario.senha;

    if (!senha) return 0;

    let forca = 0;

    if (senha.length >= 6) forca++;
    if (senha.length >= 10) forca++;

    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^a-zA-Z0-9]/.test(senha)) forca++;

    return Math.min(forca, 4);
  }

  getTextoForcaSenha(): string {
    const forca = this.getForcaSenha();

    switch(forca) {
      case 0: return '';
      case 1: return 'Fraca';
      case 2: return 'Média';
      case 3: return 'Boa';
      case 4: return 'Forte';
      default: return '';
    }
  }

  getClasseForcaSenha(): string {
    const forca = this.getForcaSenha();

    switch(forca) {
      case 1: return 'fraca';
      case 2: return 'media';
      case 3: return 'boa';
      case 4: return 'forte';
      default: return '';
    }
  }
}
