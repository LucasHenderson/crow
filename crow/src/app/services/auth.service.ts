import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Usuario, NovoUsuario } from '../models/usuario.model';

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUsuarioDoStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, senha: string): Observable<AuthResponse> {
    const mockUser: Usuario = {
      id: 'USR-2024-001',
      nome: 'Lucas Henderson',
      email: email,
      telefone: '(63) 99999-9999',
      dataEntrada: '2023-01-15',
      status: 'ativo',
      role: 'admin'
    };
    const response: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      usuario: mockUser
    };
    return of(response).pipe(
      delay(500),
      tap(res => {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.currentUserSubject.next(res.usuario);
      })
    );
  }

  register(dados: { nome: string; email: string; senha: string; telefone?: string }): Observable<AuthResponse> {
    const mockUser: Usuario = {
      id: 'USR-' + Date.now(),
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone || '',
      dataEntrada: new Date().toISOString().split('T')[0],
      status: 'ativo',
      role: 'comum'
    };
    const response: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      usuario: mockUser
    };
    return of(response).pipe(
      delay(500),
      tap(res => {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.currentUserSubject.next(res.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUsuarioLogado(): Observable<Usuario | null> {
    const user = this.getUsuarioDoStorage();
    return of(user).pipe(delay(300));
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getRole(): string | null {
    const user = this.getCurrentUser();
    return user ? (user.role || null) : null;
  }

  private getUsuarioDoStorage(): Usuario | null {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }
}
