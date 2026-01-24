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
  proficiencia?: string;
  visibilidade?: 'publico' | 'privado';
}

interface IdiomaOpcao {
  nome: string;
  bandeira: string;
}

interface Log {
  id: string;
  data: string;
  adminId: string;
  adminNome: string;
  acao: string;
  detalhes: string;
  tipo: 'denuncia' | 'usuario' | 'idioma';
}

type AbaAtiva = 'denuncias' | 'usuarios' | 'idiomas' | 'logs';

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
  logs: Log[] = [];
  
  // Filtros
  filtroDenunciaStatus = 'todas';
  filtroUsuarioStatus = 'todos';
  buscaUsuario = '';
  buscaIdioma = '';
  filtroLogTipo = 'todos';
  buscaDenuncia = '';
  buscaLog = '';
  filtroLogDataInicio = '';
  filtroLogDataFim = '';
  
  // Paginação - Denúncias
  paginaAtualDenuncias = 1;
  itensPorPaginaDenuncias = 6;
  
  // Paginação - Usuários
  paginaAtualUsuarios = 1;
  itensPorPaginaUsuarios = 9;
  
  // Paginação - Idiomas
  paginaAtualIdiomas = 1;
  itensPorPaginaIdiomas = 6;
  
  // Paginação - Logs
  paginaAtualLogs = 1;
  itensPorPaginaLogs = 10;
  
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
  telefoneUsuarioEdicao = '';
  novaSenhaUsuario = '';
  confirmarSenhaUsuario = '';
  camposVisiveis = {
    novaSenha: false,
    confirmarSenha: false
  };
  
  // Campos de edição de idioma
  nomeIdiomaEdicao = '';
  descricaoIdiomaEdicao = '';
  idiomaSelecionadoEdicao: IdiomaOpcao | null = null;
  proficienciaIdiomaEdicao = '';
  visibilidadeIdiomaEdicao: 'publico' | 'privado' = 'publico';
  
  // Dropdowns idioma
  mostrarIdiomasEdicao = false;
  mostrarProficienciaEdicao = false;
  buscaIdiomaEdicao = '';
  
  // Opções disponíveis
  idiomasDisponiveis: IdiomaOpcao[] = [
    { nome: 'Alemão', bandeira: '../../../assets/imgs/Germany-Flag.svg.png' },
    { nome: 'Árabe', bandeira: '../../../assets/imgs/United-Arab-Emirates-Flag.svg.png' },
    { nome: 'Chinês (Mandarim)', bandeira: '../../../assets/imgs/China-Flag.svg' },
    { nome: 'Coreano', bandeira: '../../../assets/imgs/South-Korea-Flag.svg.webp' },
    { nome: 'Espanhol', bandeira: '../../../assets/imgs/Spain-Flag.svg' },
    { nome: 'Francês', bandeira: '../../../assets/imgs/France-Flag.png' },
    { nome: 'Inglês (Estados Unidos)', bandeira: '../../../assets/imgs/United-States-Flag.svg' },
    { nome: 'Inglês (Reino Unido)', bandeira: '../../../assets/imgs/United-Kingdom-Flag.svg.png' },
    { nome: 'Italiano', bandeira: '../../../assets/imgs/Italy-Flag.svg' },
    { nome: 'Japonês', bandeira: '../../../assets/imgs/Japan-Flag.png' },
    { nome: 'Português (Brasil)', bandeira: '../../../assets/imgs/Brazil-Flag.svg' },
    { nome: 'Português (Portugal)', bandeira: '../../../assets/imgs/Portugal-Flag.svg.png' },
    { nome: 'Russo', bandeira: '../../../assets/imgs/Russia-Flag.svg' }
  ].sort((a, b) => a.nome.localeCompare(b.nome));
  
  proficiencias = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Fluente'];
  
  // Mensagem de sucesso
  mensagemSucesso = '';
  
  // ID do admin logado (simulado)
  adminLogadoId = 'ADM-001';
  adminLogadoNome = 'Administrador Principal';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDenuncias();
    this.carregarUsuarios();
    this.carregarIdiomas();
    this.carregarLogs();
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
      },
      {
        id: 4,
        idiomaId: 'IDM004',
        idiomaNome: 'Alemão',
        usuarioId: 'USR321',
        usuarioNome: 'Ana Oliveira',
        data: '2024-01-17T09:20:00',
        tipos: ['Outros'],
        descricao: 'Conteúdo político não relacionado ao ensino do idioma',
        status: 'rejeitada'
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
      },
      {
        id: 'USR-2024-004',
        nome: 'Mariana Costa',
        email: 'mariana@gmail.com',
        telefone: '(85) 98888-7777',
        dataEntrada: '2023-08-05',
        status: 'ativo'
      },
      {
        id: 'USR-2024-005',
        nome: 'Roberto Alves',
        email: 'roberto@hotmail.com',
        telefone: '(41) 97777-6666',
        dataEntrada: '2023-09-12',
        status: 'ativo'
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
        totalAvaliacoes: 234,
        proficiencia: 'Avançado',
        visibilidade: 'publico'
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
        totalAvaliacoes: 512,
        proficiencia: 'Intermediário',
        visibilidade: 'publico'
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
        totalAvaliacoes: 178,
        proficiencia: 'Básico',
        visibilidade: 'privado'
      }
    ];
  }

  carregarLogs(): void {
    this.logs = [
      {
        id: 'LOG-001',
        data: '2024-01-20T15:30:00',
        adminId: 'ADM-001',
        adminNome: 'Administrador Principal',
        acao: 'Alterou status de denúncia',
        detalhes: 'Denúncia #1 - Status alterado de "Pendente" para "Analisando"',
        tipo: 'denuncia'
      },
      {
        id: 'LOG-002',
        data: '2024-01-20T14:15:00',
        adminId: 'ADM-002',
        adminNome: 'João Moderador',
        acao: 'Desativou usuário',
        detalhes: 'Usuário "Carlos Eduardo Santos" (USR-2024-003) foi desativado',
        tipo: 'usuario'
      },
      {
        id: 'LOG-003',
        data: '2024-01-20T11:45:00',
        adminId: 'ADM-001',
        adminNome: 'Administrador Principal',
        acao: 'Editou idioma',
        detalhes: 'Idioma "Japonês" (IDM001) - Descrição atualizada',
        tipo: 'idioma'
      },
      {
        id: 'LOG-004',
        data: '2024-01-19T16:20:00',
        adminId: 'ADM-001',
        adminNome: 'Administrador Principal',
        acao: 'Resolveu denúncia',
        detalhes: 'Denúncia #3 - Status alterado para "Resolvida"',
        tipo: 'denuncia'
      },
      {
        id: 'LOG-005',
        data: '2024-01-19T10:30:00',
        adminId: 'ADM-002',
        adminNome: 'João Moderador',
        acao: 'Ativou usuário',
        detalhes: 'Usuário "Mariana Costa" (USR-2024-004) foi reativado',
        tipo: 'usuario'
      }
    ];
  }

  // ===== DENÚNCIAS =====
  
  get denunciasFiltradas(): Denuncia[] {
    let filtradas = this.denuncias;
    
    if (this.filtroDenunciaStatus !== 'todas') {
      filtradas = filtradas.filter(d => d.status === this.filtroDenunciaStatus);
    }
    
    if (this.buscaDenuncia.trim()) {
      const termo = this.buscaDenuncia.toLowerCase();
      filtradas = filtradas.filter(d => 
        d.id.toString().includes(termo) ||
        d.usuarioNome.toLowerCase().includes(termo)
      );
    }
    
    return filtradas;
  }

  get denunciasPaginadas(): Denuncia[] {
    const inicio = (this.paginaAtualDenuncias - 1) * this.itensPorPaginaDenuncias;
    const fim = inicio + this.itensPorPaginaDenuncias;
    return this.denunciasFiltradas.slice(inicio, fim);
  }

  get totalPaginasDenuncias(): number {
    return Math.ceil(this.denunciasFiltradas.length / this.itensPorPaginaDenuncias);
  }

  get paginasDenuncias(): number[] {
    return Array.from({ length: this.totalPaginasDenuncias }, (_, i) => i + 1);
  }

  mudarPaginaDenuncias(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasDenuncias) {
      this.paginaAtualDenuncias = pagina;
    }
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
    
    const statusAnterior = this.denunciaSelecionada.status;
    this.denunciaSelecionada.status = status;
    
    // Registrar log
    this.registrarLog(
      'denuncia',
      'Alterou status de denúncia',
      `Denúncia #${this.denunciaSelecionada.id} - Status alterado de "${this.getStatusTexto(statusAnterior)}" para "${this.getStatusTexto(status)}"`
    );
    
    this.fecharModalDenuncia();
    this.exibirMensagemSucesso('Status da denúncia atualizado com sucesso!');
  }

  visualizarIdiomaDenuncia(): void {
    if (!this.denunciaSelecionada) return;
    console.log('Navegando para idioma:', this.denunciaSelecionada.idiomaId);
    this.router.navigate(['/visualizar-idioma']);
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

  temTipoOutros(): boolean {
    return this.denunciaSelecionada?.tipos.includes('Outros') || false;
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

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaAtualUsuarios - 1) * this.itensPorPaginaUsuarios;
    const fim = inicio + this.itensPorPaginaUsuarios;
    return this.usuariosFiltrados.slice(inicio, fim);
  }

  get totalPaginasUsuarios(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.itensPorPaginaUsuarios);
  }

  get paginasUsuarios(): number[] {
    return Array.from({ length: this.totalPaginasUsuarios }, (_, i) => i + 1);
  }

  mudarPaginaUsuarios(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasUsuarios) {
      this.paginaAtualUsuarios = pagina;
    }
  }

  getInitials(nome: string): string {
    if (!nome) return 'U';
    
    const names = nome.trim().split(' ');
    
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    
    return nome.substring(0, 2).toUpperCase();
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEmEdicao = { ...usuario };
    this.nomeUsuarioEdicao = usuario.nome;
    this.emailUsuarioEdicao = usuario.email;
    this.telefoneUsuarioEdicao = usuario.telefone;
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
    this.telefoneUsuarioEdicao = '';
    this.novaSenhaUsuario = '';
    this.confirmarSenhaUsuario = '';
    this.camposVisiveis = { novaSenha: false, confirmarSenha: false };
  }

  get podeConfirmarEdicaoUsuario(): boolean {
    if (!this.usuarioEmEdicao) return false;
    
    const nomeValido = this.nomeUsuarioEdicao.trim().length >= 8;
    const emailValido = this.validarEmail(this.emailUsuarioEdicao);
    const telefoneValido = this.telefoneUsuarioEdicao.replace(/\D/g, '').length >= 10;
    
    const dadosAlterados = 
      this.nomeUsuarioEdicao !== this.usuarioEmEdicao.nome ||
      this.emailUsuarioEdicao !== this.usuarioEmEdicao.email ||
      this.telefoneUsuarioEdicao !== this.usuarioEmEdicao.telefone;
    
    const senhaValida = !this.novaSenhaUsuario || (
      this.novaSenhaUsuario.length >= 6 &&
      this.novaSenhaUsuario === this.confirmarSenhaUsuario
    );
    
    return nomeValido && emailValido && telefoneValido && senhaValida && (dadosAlterados || !!this.novaSenhaUsuario);
  }

  confirmarEdicaoUsuario(): void {
    if (!this.podeConfirmarEdicaoUsuario || !this.usuarioEmEdicao) return;
    
    const usuario = this.usuarios.find(u => u.id === this.usuarioEmEdicao!.id);
    if (usuario) {
      const nomeAnterior = usuario.nome;
      const emailAnterior = usuario.email;
      const telefoneAnterior = usuario.telefone;
      
      usuario.nome = this.nomeUsuarioEdicao.trim();
      usuario.email = this.emailUsuarioEdicao.trim();
      usuario.telefone = this.telefoneUsuarioEdicao.trim();
      
      // Registrar log
      const alteracoes: string[] = [];
      if (nomeAnterior !== usuario.nome) alteracoes.push(`Nome: "${nomeAnterior}" → "${usuario.nome}"`);
      if (emailAnterior !== usuario.email) alteracoes.push(`Email: "${emailAnterior}" → "${usuario.email}"`);
      if (telefoneAnterior !== usuario.telefone) alteracoes.push(`Telefone: "${telefoneAnterior}" → "${usuario.telefone}"`);
      if (this.novaSenhaUsuario) alteracoes.push('Senha atualizada');
      
      this.registrarLog(
        'usuario',
        'Editou usuário',
        `Usuário "${usuario.nome}" (${usuario.id}) - ${alteracoes.join(', ')}`
      );
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
      
      // Registrar log
      this.registrarLog(
        'usuario',
        novoStatus === 'ativo' ? 'Ativou usuário' : 'Desativou usuário',
        `Usuário "${usuario.nome}" (${usuario.id}) foi ${novoStatus === 'ativo' ? 'ativado' : 'desativado'}`
      );
      
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

  aplicarMascaraTelefone(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }
    
    if (valor.length > 6) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (valor.length > 0) {
      valor = valor.replace(/^(\d*)/, '($1');
    }
    
    this.telefoneUsuarioEdicao = valor;
  }

  getForcaSenha(): number {
    const senha = this.novaSenhaUsuario;
    
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

  get idiomasPaginados(): Idioma[] {
    const inicio = (this.paginaAtualIdiomas - 1) * this.itensPorPaginaIdiomas;
    const fim = inicio + this.itensPorPaginaIdiomas;
    return this.idiomasFiltrados.slice(inicio, fim);
  }

  get totalPaginasIdiomas(): number {
    return Math.ceil(this.idiomasFiltrados.length / this.itensPorPaginaIdiomas);
  }

  get paginasIdiomas(): number[] {
    return Array.from({ length: this.totalPaginasIdiomas }, (_, i) => i + 1);
  }

  mudarPaginaIdiomas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasIdiomas) {
      this.paginaAtualIdiomas = pagina;
    }
  }

  get idiomasFiltradosEdicao(): IdiomaOpcao[] {
    if (!this.buscaIdiomaEdicao.trim()) return this.idiomasDisponiveis;
    const termo = this.buscaIdiomaEdicao.toLowerCase();
    return this.idiomasDisponiveis.filter(i => i.nome.toLowerCase().includes(termo));
  }

  toggleIdiomasEdicao(): void {
    this.mostrarIdiomasEdicao = !this.mostrarIdiomasEdicao;
    this.mostrarProficienciaEdicao = false;
  }

  toggleProficienciaEdicao(): void {
    this.mostrarProficienciaEdicao = !this.mostrarProficienciaEdicao;
    this.mostrarIdiomasEdicao = false;
  }

  selecionarIdiomaEdicao(idioma: IdiomaOpcao): void {
    this.idiomaSelecionadoEdicao = idioma;
    this.mostrarIdiomasEdicao = false;
    this.buscaIdiomaEdicao = '';
  }

  selecionarProficienciaEdicao(nivel: string): void {
    this.proficienciaIdiomaEdicao = nivel;
    this.mostrarProficienciaEdicao = false;
  }

  fecharDropdownsEdicao(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.campo')) {
      this.mostrarIdiomasEdicao = false;
      this.mostrarProficienciaEdicao = false;
    }
  }

  editarIdioma(idioma: Idioma): void {
    this.idiomaEmEdicao = { ...idioma };
    this.nomeIdiomaEdicao = idioma.nome;
    this.descricaoIdiomaEdicao = idioma.descricao;
    this.idiomaSelecionadoEdicao = this.idiomasDisponiveis.find(i => i.nome === idioma.nome) || null;
    this.proficienciaIdiomaEdicao = idioma.proficiencia || 'Básico';
    this.visibilidadeIdiomaEdicao = idioma.visibilidade || 'publico';
    this.mostrarModalEditarIdioma = true;
  }

  fecharModalEditarIdioma(): void {
    this.mostrarModalEditarIdioma = false;
    this.idiomaEmEdicao = null;
    this.nomeIdiomaEdicao = '';
    this.descricaoIdiomaEdicao = '';
    this.idiomaSelecionadoEdicao = null;
    this.proficienciaIdiomaEdicao = '';
    this.visibilidadeIdiomaEdicao = 'publico';
    this.buscaIdiomaEdicao = '';
    this.mostrarIdiomasEdicao = false;
    this.mostrarProficienciaEdicao = false;
  }

  get podeConfirmarEdicaoIdioma(): boolean {
    if (!this.idiomaEmEdicao) return false;
    
    const nomeValido = this.nomeIdiomaEdicao.trim().length > 0;
    const descricaoValida = this.descricaoIdiomaEdicao.trim().length > 0;
    const idiomaValido = !!this.idiomaSelecionadoEdicao;
    const proficienciaValida = !!this.proficienciaIdiomaEdicao;
    
    const dadosAlterados = 
      this.nomeIdiomaEdicao !== this.idiomaEmEdicao.nome ||
      this.descricaoIdiomaEdicao !== this.idiomaEmEdicao.descricao ||
      this.idiomaSelecionadoEdicao?.nome !== this.idiomaEmEdicao.nome ||
      this.proficienciaIdiomaEdicao !== this.idiomaEmEdicao.proficiencia ||
      this.visibilidadeIdiomaEdicao !== this.idiomaEmEdicao.visibilidade;
    
    return nomeValido && descricaoValida && idiomaValido && proficienciaValida && dadosAlterados;
  }

  confirmarEdicaoIdioma(): void {
    if (!this.podeConfirmarEdicaoIdioma || !this.idiomaEmEdicao || !this.idiomaSelecionadoEdicao) return;
    
    const idioma = this.idiomas.find(i => i.id === this.idiomaEmEdicao!.id);
    if (idioma) {
      const nomeAnterior = idioma.nome;
      const descricaoAnterior = idioma.descricao;
      
      idioma.nome = this.nomeIdiomaEdicao.trim();
      idioma.bandeira = this.idiomaSelecionadoEdicao.bandeira;
      idioma.descricao = this.descricaoIdiomaEdicao.trim();
      idioma.proficiencia = this.proficienciaIdiomaEdicao;
      idioma.visibilidade = this.visibilidadeIdiomaEdicao;
      
      // Registrar log
      const alteracoes: string[] = [];
      if (nomeAnterior !== idioma.nome) alteracoes.push(`Nome: "${nomeAnterior}" → "${idioma.nome}"`);
      if (descricaoAnterior !== idioma.descricao) alteracoes.push('Descrição atualizada');
      
      this.registrarLog(
        'idioma',
        'Editou idioma',
        `Idioma "${idioma.nome}" (${idioma.id}) - ${alteracoes.join(', ')}`
      );
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
    const idIdioma = this.idiomaEmExclusao.id;
    
    this.idiomas = this.idiomas.filter(i => i.id !== this.idiomaEmExclusao!.id);
    
    // Registrar log
    this.registrarLog(
      'idioma',
      'Excluiu idioma',
      `Idioma "${nomeIdioma}" (${idIdioma}) foi excluído permanentemente`
    );
    
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

  // ===== LOGS =====
  
  get logsFiltrados(): Log[] {
    let logs = this.logs;
    
    if (this.filtroLogTipo !== 'todos') {
      logs = logs.filter(log => log.tipo === this.filtroLogTipo);
    }
    
    if (this.buscaLog.trim()) {
      const termo = this.buscaLog.toLowerCase();
      logs = logs.filter(log => 
        log.id.toLowerCase().includes(termo) ||
        log.adminNome.toLowerCase().includes(termo) ||
        log.adminId.toLowerCase().includes(termo)
      );
    }
    
    if (this.filtroLogDataInicio) {
      const dataInicio = new Date(this.filtroLogDataInicio);
      logs = logs.filter(log => new Date(log.data) >= dataInicio);
    }
    
    if (this.filtroLogDataFim) {
      const dataFim = new Date(this.filtroLogDataFim);
      dataFim.setHours(23, 59, 59, 999);
      logs = logs.filter(log => new Date(log.data) <= dataFim);
    }
    
    return logs;
  }

  get logsPaginados(): Log[] {
    const inicio = (this.paginaAtualLogs - 1) * this.itensPorPaginaLogs;
    const fim = inicio + this.itensPorPaginaLogs;
    return this.logsFiltrados.slice(inicio, fim);
  }

  get totalPaginasLogs(): number {
    return Math.ceil(this.logsFiltrados.length / this.itensPorPaginaLogs);
  }

  get paginasLogs(): number[] {
    return Array.from({ length: this.totalPaginasLogs }, (_, i) => i + 1);
  }

  mudarPaginaLogs(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasLogs) {
      this.paginaAtualLogs = pagina;
    }
  }

  registrarLog(tipo: Log['tipo'], acao: string, detalhes: string): void {
    const logId = `LOG-${String(this.logs.length + 1).padStart(3, '0')}`;
    
    const novoLog: Log = {
      id: logId,
      data: new Date().toISOString(),
      adminId: this.adminLogadoId,
      adminNome: this.adminLogadoNome,
      acao,
      detalhes,
      tipo
    };
    
    this.logs.unshift(novoLog);
  }

  getLogTipoClass(tipo: Log['tipo']): string {
    switch(tipo) {
      case 'denuncia': return 'log-denuncia';
      case 'usuario': return 'log-usuario';
      case 'idioma': return 'log-idioma';
      default: return '';
    }
  }

  getLogTipoIcone(tipo: Log['tipo']): string {
    switch(tipo) {
      case 'denuncia': return 'alert-triangle';
      case 'usuario': return 'user';
      case 'idioma': return 'globe';
      default: return 'file-text';
    }
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