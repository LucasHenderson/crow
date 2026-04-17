import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type CamposSenha = {
  novaSenha: boolean;
  confirmarSenha: boolean;
};

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
})
export class RecuperarSenha {

  // Controle de etapas (1: Email, 2: Código, 3: Nova Senha)
  etapaAtual = 1;
  totalEtapas = 3;

  // Etapa 1: Email
  email = '';
  emailErro = '';

  // Etapa 2: Código de verificação
  codigoDigitado = '';
  codigoErro = '';
  enviandoCodigo = false;
  verificandoCodigo = false;
  mensagemCodigo = '';

  // Etapa 3: Nova senha
  novaSenha = '';
  confirmarSenha = '';
  senhaErro = '';
  camposVisiveis: CamposSenha = {
    novaSenha: false,
    confirmarSenha: false
  };

  // Controles
  carregando = false;

  // Modal de sucesso
  mostrarModalSucesso = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  proximaEtapa(): void {
    if (this.etapaAtual === 1) {
      if (!this.validarEmail()) return;
      this.verificarEmailCadastrado();
    }
    else if (this.etapaAtual === 2) {
      if (!this.validarCodigo()) return;
      this.verificarCodigoBackend();
    }
  }

  private verificarEmailCadastrado(): void {
    this.carregando = true;
    this.emailErro = '';

    this.authService.emailExiste(this.email).subscribe({
      next: (res) => {
        if (!res.existe) {
          this.carregando = false;
          this.emailErro = 'Este email não está cadastrado.';
          this.forcarAtualizacao();
          return;
        }
        this.enviarCodigoVerificacao();
      },
      error: () => {
        this.carregando = false;
        this.emailErro = 'Erro ao verificar email. Tente novamente.';
        this.forcarAtualizacao();
      }
    });
  }

  private forcarAtualizacao(): void {
    this.cdr.detectChanges();
  }

  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
      this.codigoErro = '';
      this.mensagemCodigo = '';
    }
  }

  private validarEmail(): boolean {
    this.emailErro = '';

    if (!this.email.trim()) {
      this.emailErro = 'Por favor, informe seu email.';
      return false;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(this.email)) {
      this.emailErro = 'Por favor, insira um email válido.';
      return false;
    }

    return true;
  }

  enviarCodigoVerificacao(): void {
    this.carregando = true;
    this.emailErro = '';
    this.enviandoCodigo = true;

    this.authService.enviarCodigoVerificacao(this.email).subscribe({
      next: () => {
        this.carregando = false;
        this.enviandoCodigo = false;
        this.etapaAtual = 2;
        this.mensagemCodigo = 'Código enviado! Verifique sua caixa de entrada.';
        this.forcarAtualizacao();
      },
      error: (err) => {
        this.carregando = false;
        this.enviandoCodigo = false;
        this.emailErro = err.error?.message || 'Erro ao enviar código. Tente novamente.';
        this.forcarAtualizacao();
      }
    });
  }

  reenviarCodigo(): void {
    this.codigoErro = '';
    this.mensagemCodigo = '';
    this.codigoDigitado = '';
    this.enviarCodigoVerificacao();
  }

  private validarCodigo(): boolean {
    this.codigoErro = '';

    if (!this.codigoDigitado) {
      this.codigoErro = 'Por favor, informe o código de verificação.';
      return false;
    }

    if (this.codigoDigitado.length !== 6) {
      this.codigoErro = 'O código deve ter 6 dígitos.';
      return false;
    }

    return true;
  }

  verificarCodigoBackend(): void {
    this.verificandoCodigo = true;
    this.carregando = true;
    this.codigoErro = '';

    this.authService.verificarCodigo(this.email, this.codigoDigitado).subscribe({
      next: (res) => {
        this.verificandoCodigo = false;
        this.carregando = false;
        if (res.valido) {
          this.etapaAtual = 3;
        } else {
          this.codigoErro = 'Código inválido ou expirado. Tente novamente.';
        }
        this.forcarAtualizacao();
      },
      error: () => {
        this.verificandoCodigo = false;
        this.carregando = false;
        this.codigoErro = 'Erro ao verificar código. Tente novamente.';
        this.forcarAtualizacao();
      }
    });
  }

  permitirApenasNumeros(event: KeyboardEvent): boolean {
    const tecla = event.key;

    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(tecla)) {
      return true;
    }

    if (!/^\d$/.test(tecla)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  podeConfirmarSenha(): boolean {
    return !!(
      this.novaSenha &&
      this.confirmarSenha &&
      this.novaSenha.length >= 6 &&
      this.novaSenha === this.confirmarSenha
    );
  }

  confirmarNovaSenha(): void {
    this.senhaErro = '';

    if (!this.novaSenha || this.novaSenha.length < 6) {
      this.senhaErro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.senhaErro = 'As senhas não coincidem.';
      return;
    }

    const temLetra = /[a-zA-Z]/.test(this.novaSenha);
    const temNumero = /[0-9]/.test(this.novaSenha);

    if (!temLetra || !temNumero) {
      this.senhaErro = 'A senha deve conter pelo menos uma letra e um número.';
      return;
    }

    this.carregando = true;

    this.authService.redefinirSenha(this.email, this.novaSenha).subscribe({
      next: () => {
        this.carregando = false;
        this.mostrarModalSucesso = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        this.senhaErro = err.error?.message || 'Erro ao redefinir senha. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  fecharModalSucesso(): void {
    this.mostrarModalSucesso = false;
    this.router.navigate(['/login']);
  }

  irParaLogin(): void {
    this.mostrarModalSucesso = false;
    this.router.navigate(['/login']);
  }

  getForcaSenha(): number {
    const senha = this.novaSenha;

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

  cancelar(): void {
    this.router.navigate(['/login']);
  }

  getProgresso(): number {
    return (this.etapaAtual / this.totalEtapas) * 100;
  }
}
