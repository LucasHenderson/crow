import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioBusca, UsuarioVisualizar } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarUsuarios(q?: string): Observable<UsuarioBusca[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.http.get<UsuarioBusca[]>(`${this.apiUrl}/usuarios/buscar${params}`);
  }

  listarTodos(): Observable<UsuarioBusca[]> {
    return this.http.get<UsuarioBusca[]>(`${this.apiUrl}/usuarios`);
  }

  /** Perfil público de outro usuário — não inclui email nem dados de contato. */
  getUsuarioPorCodigo(codigo: string): Observable<UsuarioVisualizar> {
    return this.http.get<UsuarioVisualizar>(`${this.apiUrl}/usuarios/${codigo}`);
  }

  /** Idiomas públicos criados pelo usuário (perfil público). */
  getIdiomasPublicosDoUsuario(codigo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/${codigo}/idiomas`);
  }

  atualizarPerfil(dados: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/me`, dados);
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/usuarios/me/senha`, { senhaAtual, novaSenha });
  }
}
