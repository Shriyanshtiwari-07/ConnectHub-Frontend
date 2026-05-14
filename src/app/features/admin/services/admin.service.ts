import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/services/api-client.service';
import { UserProfile } from '../../../shared/models/auth.models';

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  proUsers: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly api: ApiClientService) {}

  getUsers() {
    return this.api.get<UserProfile[]>('/admin/users');
  }

  toggleUserStatus(userId: string, status: string) {
    return this.api.patch<UserProfile>(`/admin/users/${userId}/status`, { status });
  }

  updateUserRole(userId: string, role: string) {
    return this.api.patch<UserProfile>(`/admin/users/${userId}/role`, { role });
  }

  deleteUser(userId: string) {
    return this.api.delete(`/admin/users/${userId}`);
  }

  getStats() {
    return this.api.get<AdminStats>('/admin/stats');
  }

  getRooms() {
    return this.api.get<any[]>('/admin/rooms');
  }

  deleteRoom(roomId: string) {
    return this.api.delete(`/admin/rooms/${roomId}`);
  }

  broadcast(title: string, message: string) {
    return this.api.post('/admin/broadcast', { title, message });
  }
}
