import { Routes } from '@angular/router';

export const PRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pro.component').then(m => m.ProComponent)
  }
];
