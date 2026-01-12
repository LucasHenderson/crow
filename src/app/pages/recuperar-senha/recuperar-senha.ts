import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type MetodoRecuperacao = 'email' | 'sms' | null;

type CamposSenha = {
  novaSenha: boolean;
  confirmarSenha: boolean;
};

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
})
export class RecuperarSenha {
  
  etapaAtual = 1;

  // ETAPA 1: Email
  email = '';

  // ETAPA 2: Método de recuperação
  metodoRecuperacao: MetodoRecuperacao = null;

  // ETAPA 3: Código de verificação
  codigo = '';
  codigoEnviado = '123456'; // Simulação - em produção viria do backend

  // ETAPA 4: Nova senha
  novaSenha = '';
  confirmarSenha = '';
  
  camposVisiveis: CamposSenha = {
    novaSenha: false,
    confirmarSenha: false
  };

  constructor(private router: Router) {}

  /**
   * Valida o formato do email
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Permite apenas números no campo de código
   */
  permitirApenasNumeros(event: KeyboardEvent): boolean {
    const tecla = event.key;
    
    if (
      tecla === 'Backspace' || 
      tecla === 'Delete' || 
      tecla === 'Tab' || 
      tecla === 'ArrowLeft' || 
      tecla === 'ArrowRight' ||
      tecla === 'Home' ||
      tecla === 'End'
    ) {
      return true;
    }
    
    if (!/^\d$/.test(tecla)) {
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  /**
   * Alterna a visibilidade dos campos de senha
   */
  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  /**
   * Retorna a força da senha (0 a 4)
   */
  getForcaSenha(): number {
    const senha = this.novaSenha;
    
    if (!senha) return 0;
    
    let forca = 0;
    
    // Comprimento
    if (senha.length >= 6) forca++;
    if (senha.length >= 10) forca++;
    
    // Complexidade
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^a-zA-Z0-9]/.test(senha)) forca++;
    
    return Math.min(forca, 4);
  }

  /**
   * Retorna o texto da força da senha
   */
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

  /**
   * Retorna a classe CSS da força da senha
   */
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

  /**
   * Verifica se pode avançar da etapa 1
   */
  podeAvancarEtapa1(): boolean {
    return !!(this.email.trim() && this.validarEmail(this.email));
  }

  /**
   * Verifica se pode avançar da etapa 2
   */
  podeAvancarEtapa2(): boolean {
    return this.metodoRecuperacao !== null;
  }

  /**
   * Verifica se pode avançar da etapa 3
   */
  podeAvancarEtapa3(): boolean {
    return this.codigo.length === 6 && this.codigo === this.codigoEnviado;
  }

  /**
   * Verifica se pode finalizar (etapa 4)
   */
  podeFinalizar(): boolean {
    if (!this.novaSenha || !this.confirmarSenha) return false;
    if (this.novaSenha.length < 6) return false;
    if (this.novaSenha !== this.confirmarSenha) return false;
    
    // Validação adicional: pelo menos uma letra e um número
    const temLetra = /[a-zA-Z]/.test(this.novaSenha);
    const temNumero = /[0-9]/.test(this.novaSenha);
    
    return temLetra && temNumero;
  }

  /**
   * Avança para a próxima etapa
   */
  avancarEtapa(): void {
    if (this.etapaAtual === 1 && !this.podeAvancarEtapa1()) {
      alert('Por favor, insira um email válido.');
      return;
    }

    if (this.etapaAtual === 2 && !this.podeAvancarEtapa2()) {
      alert('Por favor, selecione um método de recuperação.');
      return;
    }

    if (this.etapaAtual === 3) {
      if (this.codigo.length !== 6) {
        alert('Por favor, digite o código de 6 dígitos.');
        return;
      }
      if (this.codigo !== this.codigoEnviado) {
        alert('Código incorreto. Tente novamente.');
        return;
      }
    }

    if (this.etapaAtual < 4) {
      this.etapaAtual++;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Simular envio de código quando avança para etapa 3
      if (this.etapaAtual === 3) {
        this.enviarCodigo();
      }
    }
  }

  /**
   * Volta para a etapa anterior
   */
  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Simula o envio do código
   */
  enviarCodigo(): void {
    const metodo = this.metodoRecuperacao === 'email' ? 'email' : 'SMS';
    console.log(`Código enviado via ${metodo}:`, this.codigoEnviado);
    
    // Em produção, aqui seria feita a chamada ao backend
    // this.authService.enviarCodigoRecuperacao(this.email, this.metodoRecuperacao)
  }

  /**
   * Reenviar código de verificação
   */
  reenviarCodigo(): void {
    // Gerar novo código (em produção viria do backend)
    this.codigoEnviado = Math.floor(100000 + Math.random() * 900000).toString();
    this.codigo = '';
    
    const metodo = this.metodoRecuperacao === 'email' ? 'email' : 'SMS';
    alert(`Novo código enviado via ${metodo}!`);
    console.log('Novo código:', this.codigoEnviado);
  }

  /**
   * Finaliza o processo e redireciona para login
   */
  finalizar(): void {
    if (!this.podeFinalizar()) return;

    // Aqui seria feita a chamada ao backend para atualizar a senha
    console.log('Nova senha definida com sucesso');
    console.log('Email:', this.email);
    
    // Simular salvamento
    setTimeout(() => {
      alert('Senha alterada com sucesso! Faça login com sua nova senha.');
      this.router.navigate(['/login']);
    }, 500);
  }

  /**
   * Cancela o processo e volta para login
   */
  cancelar(): void {
    if (confirm('Deseja cancelar a recuperação de senha?')) {
      this.router.navigate(['/login']);
    }
  }
}