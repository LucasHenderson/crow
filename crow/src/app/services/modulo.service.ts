import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Modulo } from '../models/modulo.model';

@Injectable({ providedIn: 'root' })
export class ModuloService {

  getModulosPorIdioma(idiomaId: string): Observable<Modulo[]> {
    return of([]).pipe(delay(300));
  }

  criarModulo(idiomaId: string, dados: any): Observable<Modulo> {
    const novo: Modulo = {
      id: Date.now(),
      nome: dados.nome,
      icone: dados.icone || '',
      selecionado: false,
      frases: 0
    };
    return of(novo).pipe(delay(300));
  }

  editarModulo(idiomaId: string, id: number, dados: any): Observable<Modulo> {
    return of({ id, ...dados } as Modulo).pipe(delay(300));
  }

  excluirModulo(idiomaId: string, id: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }
}
