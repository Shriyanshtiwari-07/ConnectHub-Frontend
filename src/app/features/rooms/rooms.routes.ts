import { Routes } from '@angular/router';

export const ROOMS_ROUTES: Routes = [
  {
    path: 'create',
    loadComponent: () => import('./components/create-room/create-room.component').then((m) => m.CreateRoomComponent),
  },
  {
    path: ':roomId/settings',
    loadComponent: () =>
      import('./components/room-settings/room-settings.component').then((m) => m.UserSettingsComponent),
  },
  {
    path: ':roomId/members',
    loadComponent: () => import('./components/room-members/room-members.component').then((m) => m.RoomMembersComponent),
  },
  {
    path: ':roomId/add-member',
    loadComponent: () => import('./components/add-member/add-member.component').then((m) => m.AddMemberComponent),
  },
  { path: '**', redirectTo: '/chat' },
];

