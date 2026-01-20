import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [{ 
  path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rotas de Autenticação
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'cadastrar-usuario',
        loadComponent: () => import('./pages/cadastrar-usuario/cadastrar-usuario').then((m) => m.CadastrarUsuario),
      },
      {
        path: 'recuperar-senha',
        loadComponent: () => import('./pages/recuperar-senha/recuperar-senha').then((m) => m.RecuperarSenha),
      },
    ],
  },
  // Rotas Principais
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
      },
      {
        path: 'buscar-idioma',
        loadComponent: () => import('./pages/buscar-idioma/buscar-idioma').then((m) => m.BuscarIdioma),
      },
      {
        path: 'cadastrar-idioma',
        loadComponent: () => import('./pages/cadastrar-idioma/cadastrar-idioma').then((m) => m.CadastrarIdioma),
      },
      {
        path: 'visualizar-idioma',
        loadComponent: () => import('./pages/visualizar-idioma/visualizar-idioma').then((m) => m.VisualizarIdioma),
      },
      {
        path: 'visualizar-modulo',
        loadComponent: () => import('./pages/visualizar-modulo/visualizar-modulo').then((m) => m.VisualizarModulo),
      },
      {
        path: 'jogar',
        loadComponent: () => import('./pages/jogar/jogar').then((m) => m.Jogar),
      },
      {
        path: 'cadastrar-frase',
        loadComponent: () => import('./pages/cadastrar-frase/cadastrar-frase').then((m) => m.CadastrarFrase),
      },
      {
        path: 'cadastrar-modulo',
        loadComponent: () => import('./pages/cadastrar-modulo/cadastrar-modulo').then((m) => m.CadastrarModulo),
      },
      {
        path: 'visualizar-usuario',
        loadComponent: () => import('./pages/visualizar-usuario/visualizar-usuario').then((m) => m.VisualizarUsuario),
      },
    ]
  }
];
