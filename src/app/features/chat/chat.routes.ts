import { Routes } from '@angular/router';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/chat-layout/chat-layout.component').then((m) => m.ChatLayoutComponent),
  },
];

