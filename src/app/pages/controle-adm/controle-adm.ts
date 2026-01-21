import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Denuncia {
  id: number;
  idiomaId: string;
  idiomaNome: string;
  usuarioId: string;
  usuarioNome: string;
  data: string;
  tipos: string[];
  descricao?: string;
  status: 'pendente' | 'analisando' | 'resolvida' | 'rejeitada';
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataEntrada: string;
  status: 'ativo' | 'inativo';
}

interface Idioma {
  id: string;
  nome: string;
  bandeira: string;
  descricao: string;
  criadorId: string;
  criadorNome: string;
  modulos: number;
  avaliacao: number;
  totalAvaliacoes: number;
}

type AbaAtiva = 'denuncias' | 'usuarios' | 'idiomas';

@Component({
  selector: 'app-controle-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controle-adm.html',
  styleUrl: './controle-adm.css',
})
export class ControleAdm implements OnInit {
  
  // Controle de abas
  abaAtiva: AbaAtiva = 'denuncias';
  
  // Dados
  denuncias: Denuncia[] = [];
  usuarios: Usuario[] = [];
  idiomas: Idioma[] = [];
  
  // Filtros
  filtroDenunciaStatus = 'todas';
  filtroUsuarioStatus = 'todos';
  buscaUsuario = '';
  buscaIdioma = '';
  
  // Modais
  mostrarModalDenuncia = false;
  mostrarModalEditarUsuario = false;
  mostrarModalDesativarUsuario = false;
  mostrarModalEditarIdioma = false;
  mostrarModalExcluirIdioma = false;
  mostrarMensagemSucesso = false;
  
  // Dados dos modais
  denunciaSelecionada: Denuncia | null = null;
  usuarioEmEdicao: Usuario | null = null;
  usuarioEmDesativacao: Usuario | null = null;
  idiomaEmEdicao: Idioma | null = null;
  idiomaEmExclusao: Idioma | null = null;
  
  // Campos de edição de usuário
  nomeUsuarioEdicao = '';
  emailUsuarioEdicao = '';
  novaSenhaUsuario = '';
  confirmarSenhaUsuario = '';
  camposVisiveis = {
    novaSenha: false,
    confirmarSenha: false
  };
  
  // Campos de edição de idioma
  nomeIdiomaEdicao = '';
  descricaoIdiomaEdicao = '';
  
  // Mensagem de sucesso
  mensagemSucesso = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDenuncias();
    this.carregarUsuarios();
    this.carregarIdiomas();
  }

  // ===== NAVEGAÇÃO DE ABAS =====
  
  mudarAba(aba: AbaAtiva): void {
    this.abaAtiva = aba;
  }

  // ===== CARREGAMENTO DE DADOS =====
  
  carregarDenuncias(): void {
    this.denuncias = [
      {
        id: 1,
        idiomaId: 'IDM001',
        idiomaNome: 'Japonês',
        usuarioId: 'USR123',
        usuarioNome: 'João Silva',
        data: '2024-01-20T14:30:00',
        tipos: ['Imagens Inapropriadas', 'Frases Inapropriadas'],
        descricao: 'Conteúdo ofensivo nos módulos 2 e 3',
        status: 'pendente'
      },
      {
        id: 2,
        idiomaId: 'IDM002',
        idiomaNome: 'Espanhol',
        usuarioId: 'USR456',
        usuarioNome: 'Maria Santos',
        data: '2024-01-19T10:15:00',
        tipos: ['Links Inapropriados'],
        status: 'analisando'
      },
      {
        id: 3,
        idiomaId: 'IDM003',
        idiomaNome: 'Francês',
        usuarioId: 'USR789',
        usuarioNome: 'Pedro Costa',
        data: '2024-01-18T16:45:00',
        tipos: ['Vídeos Inapropriados'],
        descricao: 'Vídeos com conteúdo não relacionado ao idioma',
        status: 'resolvida'
      }
    ];
  }

  carregarUsuarios(): void {
    this.usuarios = [
      {
        id: 'USR-2024-001',
        nome: 'Lucas Henderson',
        email: 'lucas@gmail.com',
        telefone: '(63) 99999-9999',
        dataEntrada: '2023-01-15',
        status: 'ativo'
      },
      {
        id: 'USR-2024-002',
        nome: 'Ana Paula Oliveira',
        email: 'ana.oliveira@gmail.com',
        telefone: '(11) 98765-4321',
        dataEntrada: '2023-03-22',
        status: 'ativo'
      },
      {
        id: 'USR-2024-003',
        nome: 'Carlos Eduardo Santos',
        email: 'carlos.santos@hotmail.com',
        telefone: '(21) 97654-3210',
        dataEntrada: '2023-06-10',
        status: 'inativo'
      }
    ];
  }

  carregarIdiomas(): void {
    this.idiomas = [
      {
        id: 'IDM001',
        nome: 'Japonês',
        bandeira: '../../../assets/imgs/Japan-Flag.png',
        descricao: 'Aprenda japonês básico para viagens',
        criadorId: 'USR-2024-001',
        criadorNome: 'Lucas Henderson',
        modulos: 15,
        avaliacao: 4.5,
        totalAvaliacoes: 234
      },
      {
        id: 'IDM002',
        nome: 'Espanhol',
        bandeira: '../../../assets/imgs/Spain-Flag.svg',
        descricao: 'Espanhol para conversação do dia a dia',
        criadorId: 'USR-2024-002',
        criadorNome: 'Ana Paula Oliveira',
        modulos: 18,
        avaliacao: 4.8,
        totalAvaliacoes: 512
      },
      {
        id: 'IDM003',
        nome: 'Francês',
        bandeira: '../../../assets/imgs/France-Flag.png',
        descricao: 'Francês básico e intermediário',
        criadorId: 'USR-2024-003',
        criadorNome: 'Carlos Eduardo Santos',
        modulos: 12,
        avaliacao: 4.2,
        totalAvaliacoes: 178
      }
    ];
  }

  // ===== DENÚNCIAS =====
  
  get denunciasFiltradas(): Denuncia[] {
    if (this.filtroDenunciaStatus === 'todas') {
      return this.denuncias;
    }
    return this.denuncias.filter(d => d.status === this.filtroDenunciaStatus);
  }

  visualizarDenuncia(denuncia: Denuncia): void {
    this.denunciaSelecionada = denuncia;
    this.mostrarModalDenuncia = true;
  }

  fecharModalDenuncia(): void {
    this.mostrarModalDenuncia = false;
    this.denunciaSelecionada = null;
  }

  alterarStatusDenuncia(status: Denuncia['status']): void {
    if (!this.denunciaSelecionada) return;
    
    this.denunciaSelecionada.status = status;
    console.log('Status da denúncia alterado:', status);
    
    this.fecharModalDenuncia();
    this.exibirMensagemSucesso('Status da denúncia atualizado com sucesso!');
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: Denuncia['status']): string {
    switch(status) {
      case 'pendente': return 'status-pendente';
      case 'analisando': return 'status-analisando';
      case 'resolvida': return 'status-resolvida';
      case 'rejeitada': return 'status-rejeitada';
      default: return '';
    }
  }

  getStatusTexto(status: Denuncia['status']): string {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'analisando': return 'Analisando';
      case 'resolvida': return 'Resolvida';
      case 'rejeitada': return 'Rejeitada';
      default: return '';
    }
  }

  // ===== USUÁRIOS =====
  
  get usuariosFiltrados(): Usuario[] {
    let usuarios = this.usuarios;
    
    if (this.filtroUsuarioStatus !== 'todos') {
      usuarios = usuarios.filter(u => u.status === this.filtroUsuarioStatus);
    }
    
    if (this.buscaUsuario.trim()) {
      const termo = this.buscaUsuario.toLowerCase();
      usuarios = usuarios.filter(u => 
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.id.toLowerCase().includes(termo)
      );
    }
    
    return usuarios;
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEmEdicao = { ...usuario };
    this.nomeUsuarioEdicao = usuario.nome;
    this.emailUsuarioEdicao = usuario.email;
    this.novaSenhaUsuario = '';
    this.confirmarSenhaUsuario = '';
    this.mostrarModalEditarUsuario = true;
  }

  fecharModalEditarUsuario(): void {
    this.mostrarModalEditarUsuario = false;
    this.usuarioEmEdicao = null;
    this.limparCamposUsuario();
  }

  limparCamposUsuario(): void {
    this.nomeUsuarioEdicao = '';
    this.emailUsuarioEdicao = '';
    this.novaSenhaUsuario = '';
    this.confirmarSenhaUsuario = '';
    this.camposVisiveis = { novaSenha: false, confirmarSenha: false };
  }

  get podeConfirmarEdicaoUsuario(): boolean {
    if (!this.usuarioEmEdicao) return false;
    
    const nomeValido = this.nomeUsuarioEdicao.trim().length >= 8;
    const emailValido = this.validarEmail(this.emailUsuarioEdicao);
    
    const dadosAlterados = 
      this.nomeUsuarioEdicao !== this.usuarioEmEdicao.nome ||
      this.emailUsuarioEdicao !== this.usuarioEmEdicao.email;
    
    const senhaValida = !this.novaSenhaUsuario || (
      this.novaSenhaUsuario.length >= 6 &&
      this.novaSenhaUsuario === this.confirmarSenhaUsuario
    );
    
    return nomeValido && emailValido && senhaValida && (dadosAlterados || !!this.novaSenhaUsuario);
  }

  confirmarEdicaoUsuario(): void {
    if (!this.podeConfirmarEdicaoUsuario || !this.usuarioEmEdicao) return;
    
    const usuario = this.usuarios.find(u => u.id === this.usuarioEmEdicao!.id);
    if (usuario) {
      usuario.nome = this.nomeUsuarioEdicao.trim();
      usuario.email = this.emailUsuarioEdicao.trim();
      
      if (this.novaSenhaUsuario) {
        console.log('Nova senha definida para:', usuario.id);
      }
    }
    
    this.fecharModalEditarUsuario();
    this.exibirMensagemSucesso(`Usuário "${usuario?.nome}" atualizado com sucesso!`);
  }

  abrirModalDesativarUsuario(usuario: Usuario): void {
    this.usuarioEmDesativacao = usuario;
    this.mostrarModalDesativarUsuario = true;
  }

  fecharModalDesativarUsuario(): void {
    this.mostrarModalDesativarUsuario = false;
    this.usuarioEmDesativacao = null;
  }

  confirmarAlteracaoStatusUsuario(): void {
    if (!this.usuarioEmDesativacao) return;
    
    const usuario = this.usuarios.find(u => u.id === this.usuarioEmDesativacao!.id);
    if (usuario) {
      const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
      usuario.status = novoStatus;
      
      const acao = novoStatus === 'ativo' ? 'ativada' : 'desativada';
      this.fecharModalDesativarUsuario();
      this.exibirMensagemSucesso(`Conta de "${usuario.nome}" ${acao} com sucesso!`);
    }
  }

  togglePassword(field: 'novaSenha' | 'confirmarSenha'): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ===== IDIOMAS =====
  
  get idiomasFiltrados(): Idioma[] {
    if (!this.buscaIdioma.trim()) return this.idiomas;
    
    const termo = this.buscaIdioma.toLowerCase();
    return this.idiomas.filter(i => 
      i.nome.toLowerCase().includes(termo) ||
      i.criadorNome.toLowerCase().includes(termo) ||
      i.id.toLowerCase().includes(termo)
    );
  }

  editarIdioma(idioma: Idioma): void {
    this.idiomaEmEdicao = { ...idioma };
    this.nomeIdiomaEdicao = idioma.nome;
    this.descricaoIdiomaEdicao = idioma.descricao;
    this.mostrarModalEditarIdioma = true;
  }

  fecharModalEditarIdioma(): void {
    this.mostrarModalEditarIdioma = false;
    this.idiomaEmEdicao = null;
    this.nomeIdiomaEdicao = '';
    this.descricaoIdiomaEdicao = '';
  }

  get podeConfirmarEdicaoIdioma(): boolean {
    if (!this.idiomaEmEdicao) return false;
    
    const nomeValido = this.nomeIdiomaEdicao.trim().length > 0;
    const descricaoValida = this.descricaoIdiomaEdicao.trim().length > 0;
    
    const dadosAlterados = 
      this.nomeIdiomaEdicao !== this.idiomaEmEdicao.nome ||
      this.descricaoIdiomaEdicao !== this.idiomaEmEdicao.descricao;
    
    return nomeValido && descricaoValida && dadosAlterados;
  }

  confirmarEdicaoIdioma(): void {
    if (!this.podeConfirmarEdicaoIdioma || !this.idiomaEmEdicao) return;
    
    const idioma = this.idiomas.find(i => i.id === this.idiomaEmEdicao!.id);
    if (idioma) {
      idioma.nome = this.nomeIdiomaEdicao.trim();
      idioma.descricao = this.descricaoIdiomaEdicao.trim();
    }
    
    this.fecharModalEditarIdioma();
    this.exibirMensagemSucesso(`Idioma "${idioma?.nome}" atualizado com sucesso!`);
  }

  excluirIdioma(idioma: Idioma): void {
    this.idiomaEmExclusao = idioma;
    this.mostrarModalExcluirIdioma = true;
  }

  fecharModalExcluirIdioma(): void {
    this.mostrarModalExcluirIdioma = false;
    this.idiomaEmExclusao = null;
  }

  confirmarExclusaoIdioma(): void {
    if (!this.idiomaEmExclusao) return;
    
    const nomeIdioma = this.idiomaEmExclusao.nome;
    this.idiomas = this.idiomas.filter(i => i.id !== this.idiomaEmExclusao!.id);
    
    this.fecharModalExcluirIdioma();
    this.exibirMensagemSucesso(`Idioma "${nomeIdioma}" excluído com sucesso!`);
  }

  visualizarIdioma(idioma: Idioma): void {
    console.log('Visualizar idioma:', idioma.nome);
    this.router.navigate(['/visualizar-idioma']);
  }

  estrelas(nota: number): boolean[] {
    const notaArredondada = Math.ceil(nota);
    return Array.from({ length: 5 }, (_, i) => i < notaArredondada);
  }

  // ===== MENSAGEM DE SUCESSO =====
  
  exibirMensagemSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mostrarMensagemSucesso = true;
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.mostrarMensagemSucesso = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }
}