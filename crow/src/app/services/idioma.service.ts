import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Idioma, IdiomaAdm, IdiomaBusca } from '../models/idioma.model';

@Injectable({ providedIn: 'root' })
export class IdiomaService {

  getIdiomasUsuario(): Observable<Idioma[]> {
    return of([
      {
        id: 'IDM-2024-001',
        nome: 'Inglês',
        bandeira: '../../../assets/imgs/United-States-Flag.svg',
        nota: 4,
        modulos: 18,
        descricao: 'Idioma global, utilizado em negócios, tecnologia e viagens ao redor do mundo.',
        proficiencia: 'Avançado',
        visibilidade: 'publico' as const
      }
    ]).pipe(delay(300));
  }

  buscarIdiomas(): Observable<IdiomaBusca[]> {
    return of([
      { id: '000001', nome: 'Japonês para iniciantes', idioma: 'Japonês', bandeira: '../../../assets/imgs/Japan-Flag.png', modulos: 5, avaliacao: 5, criadoEm: new Date('2024-05-01'), proficiencia: 'iniciante' as const },
      { id: '000002', nome: 'Inglês para informática', idioma: 'Inglês', bandeira: '../../../assets/imgs/United-States-Flag.svg', modulos: 18, avaliacao: 4, criadoEm: new Date('2024-04-12'), proficiencia: 'intermediario' as const }
    ]).pipe(delay(300));
  }

  getIdiomaPorId(id: string): Observable<IdiomaAdm> {
    return of({
      id,
      nome: 'Japonês para iniciantes',
      bandeira: '../../../assets/imgs/Japan-Flag.png',
      descricao: 'Aprender japonês básico para viagens e conversação do dia a dia',
      criadorId: 'USR-2024-001',
      criadorNome: 'Lucas Henderson',
      modulos: 5,
      avaliacao: 4.3,
      totalAvaliacoes: 2134,
      proficiencia: 'Iniciante',
      visibilidade: 'publico' as const
    }).pipe(delay(300));
  }

  criarIdioma(dados: any): Observable<Idioma> {
    const novo: Idioma = {
      id: 'IDM-' + Date.now(),
      nome: dados.nome,
      bandeira: dados.bandeira || '',
      nota: 0,
      modulos: 0,
      descricao: dados.descricao || '',
      proficiencia: dados.proficiencia,
      visibilidade: dados.visibilidade
    };
    return of(novo).pipe(delay(300));
  }

  editarIdioma(id: string, dados: any): Observable<Idioma> {
    return of({ id, ...dados } as Idioma).pipe(delay(300));
  }

  excluirIdioma(id: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  importarIdioma(idiomaId: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  avaliarIdioma(idiomaId: string, nota: number): Observable<{ novaMedia: number; totalAvaliacoes: number }> {
    return of({ novaMedia: nota, totalAvaliacoes: 1 }).pipe(delay(300));
  }

  denunciarIdioma(idiomaId: string, dados: any): Observable<void> {
    return of(undefined).pipe(delay(300));
  }
}
