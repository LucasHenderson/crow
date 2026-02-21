import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Usuario, UsuarioBusca } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  buscarUsuarios(): Observable<UsuarioBusca[]> {
    return of([
      { id: 'USR-2024-001', nome: 'Lucas Henderson', email: 'lucas@gmail.com', dataEntrada: new Date('2023-01-15'), quantidadeIdiomas: 3 },
      { id: 'USR-2024-002', nome: 'Ana Silva', email: 'ana@gmail.com', dataEntrada: new Date('2023-03-20'), quantidadeIdiomas: 2 }
    ]).pipe(delay(300));
  }

  getUsuarioPorId(id: string): Observable<Usuario> {
    return of({
      id,
      nome: 'Lucas Henderson',
      email: 'lucas@gmail.com',
      telefone: '(63) 99999-9999',
      dataEntrada: '2023-01-15',
      status: 'ativo' as const,
      role: 'comum' as const
    }).pipe(delay(300));
  }

  atualizarPerfil(dados: Partial<Usuario>): Observable<Usuario> {
    return of({ ...dados, id: dados.id || '' } as Usuario).pipe(delay(300));
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }
}
