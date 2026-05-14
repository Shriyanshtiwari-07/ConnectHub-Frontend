import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/services/api-client.service';
import type { Room, RoomMember } from '../../../shared/models/chat.models';

@Injectable({ providedIn: 'root' })
export class RoomsService {
  constructor(private readonly api: ApiClientService) {}

  createRoom(payload: Partial<Room> & { memberUsernames?: string[] }) {
    return this.api.post<Room>('/rooms', payload);
  }

  getRoomsByUser() {
    return this.api.get<Room[]>('/rooms');
  }

  getOrCreateDM(recipientUsername: string) {
    return this.api.post<Room>('/rooms/dm', {}, { recipientUsername });
  }

  getRoom(roomId: string) {
    return this.api.get<Room>(`/rooms/${encodeURIComponent(roomId)}`);
  }

  getMembers(roomId: string) {
    return this.api.get<RoomMember[]>(`/rooms/${encodeURIComponent(roomId)}/members`);
  }

  addMember(roomId: string, username: string) {
    return this.api.post(`/rooms/${encodeURIComponent(roomId)}/members`, {}, { username });
  }

  removeMember(roomId: string, username: string) {
    return this.api.delete(`/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(username)}`);
  }

  makeAdmin(roomId: string, username: string) {
    return this.api.put(`/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(username)}/admin`, {});
  }

  leaveRoom(roomId: string) {
    return this.api.post(`/rooms/${encodeURIComponent(roomId)}/leave`, {});
  }

  deleteRoom(roomId: string) {
    return this.api.delete(`/rooms/${encodeURIComponent(roomId)}`);
  }
}

