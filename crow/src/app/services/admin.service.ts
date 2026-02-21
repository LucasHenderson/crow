import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Denuncia } from '../models/denuncia.model';
import { Usuario } from '../models/usuario.model';
import { IdiomaAdm } from '../models/idioma.model';
import { Log } from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

  getDenuncias(): Observable<Denuncia[]> {
    return of([]).pipe(delay(300));
  }

  alterarStatusDenuncia(id: number, status: string, responsavel: any): Observable<Denuncia> {
    return of({ id, status } as any).pipe(delay(300));
  }

  getUsuariosAdmin(): Observable<Usuario[]> {
    return of([]).pipe(delay(300));
  }

  editarUsuarioAdmin(id: string, dados: any): Observable<Usuario> {
    return of({ id, ...dados } as Usuario).pipe(delay(300));
  }

  alterarStatusUsuario(id: string, novoStatus: string): Observable<Usuario> {
    return of({ id, status: novoStatus } as any).pipe(delay(300));
  }

  getIdiomasAdmin(): Observable<IdiomaAdm[]> {
    return of([]).pipe(delay(300));
  }

  excluirIdiomaAdmin(id: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  getLogs(): Observable<Log[]> {
    return of([]).pipe(delay(300));
  }

  registrarLog(tipo: string, acao: string, detalhes: string): Observable<Log> {
    return of({
      id: 'LOG-' + Date.now(),
      data: new Date().toISOString(),
      adminId: 'ADM-001',
      adminNome: 'Administrador',
      acao,
      detalhes,
      tipo: tipo as any
    }).pipe(delay(300));
  }
}
