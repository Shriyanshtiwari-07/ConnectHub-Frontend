import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: ':username',
    loadComponent: () => import('./profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('../rooms/components/room-settings/room-settings.component').then((m) => m.UserSettingsComponent),
  },
];

