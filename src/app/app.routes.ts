import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
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
    ]
  }
];
