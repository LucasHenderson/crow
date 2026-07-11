import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { adminGuard, comunGuard } from './guards/role.guard';

export const routes: Routes = [{
  path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rotas de Autenticação (sem guard)
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
  // Rotas do Usuário Comum (bloqueadas para admin)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard, comunGuard],
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
        path: 'visualizar-usuario',
        loadComponent: () => import('./pages/visualizar-usuario/visualizar-usuario').then((m) => m.VisualizarUsuario),
      },
      {
        path: 'buscar-usuario',
        loadComponent: () => import('./pages/buscar-usuario/buscar-usuario').then((m) => m.BuscarUsuario),
      },
    ]
  },
  // Rota do Administrador (bloqueada para user comum)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'controle-adm',
        loadComponent: () => import('./pages/controle-adm/controle-adm').then((m) => m.ControleAdm),
      }
    ]
  }
];
