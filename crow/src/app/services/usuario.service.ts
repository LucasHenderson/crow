import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioBusca } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarUsuarios(q?: string): Observable<UsuarioBusca[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.http.get<UsuarioBusca[]>(`${this.apiUrl}/usuarios/buscar${params}`);
  }

  listarTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  getUsuarioPorId(id: number | string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
  }

  /** Idiomas públicos criados pelo usuário (perfil público). */
  getIdiomasPublicosDoUsuario(id: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/${id}/idiomas`);
  }

  atualizarPerfil(dados: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/me`, dados);
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/usuarios/me/senha`, { senhaAtual, novaSenha });
  }
}
