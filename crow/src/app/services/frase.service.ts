import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Frase } from '../models/frase.model';

@Injectable({ providedIn: 'root' })
export class FraseService {

  getFrasesPorModulo(moduloId: string): Observable<Frase[]> {
    return of([]).pipe(delay(300));
  }

  criarFrase(moduloId: string, dados: any): Observable<Frase> {
    const nova: Frase = {
      id: Date.now(),
      modo: dados.modo,
      ...dados
    };
    return of(nova).pipe(delay(300));
  }

  editarFrase(moduloId: string, id: number, dados: any): Observable<Frase> {
    return of({ id, ...dados } as Frase).pipe(delay(300));
  }

  excluirFrase(moduloId: string, id: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  getFrasesParaJogo(moduloIds: string[]): Observable<Frase[]> {
    return of([]).pipe(delay(300));
  }
}
