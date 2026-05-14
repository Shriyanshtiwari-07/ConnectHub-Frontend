import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/services/api-client.service';
import type { Message } from '../../../shared/models/chat.models';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  constructor(private readonly api: ApiClientService) {}

  getRoomMessages(roomId: string) {
    return this.api.get<Message[]>(`/messages/room/${encodeURIComponent(roomId)}`);
  }

  searchMessages(q: string, roomId?: string) {
    return this.api.get<Message[]>('/messages/search', { q, roomId });
  }

  deleteMessage(messageId: string) {
    return this.api.delete<{ message: string }>(`/chat/messages/${encodeURIComponent(messageId)}`);
  }

  editMessage(messageId: string, content: string) {
    return this.api.patch<Message>(`/chat/messages/${encodeURIComponent(messageId)}`, { content });
  }

  getUnreadCount() {
    return this.api.get<number>('/messages/unread-count');
  }

  getUnreadByChat() {
    return this.api.get<Record<string, number>>('/messages/unread-by-chat');
  }

  markAsRead(roomId: string) {
    return this.api.put(`/chat/mark-read/${encodeURIComponent(roomId)}`, {});
  }
}

