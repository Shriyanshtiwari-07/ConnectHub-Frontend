import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'oauth2/callback',
        loadComponent: () => import('./components/callback.component').then((m) => m.CallbackComponent),
      },
    ],
  },
];

