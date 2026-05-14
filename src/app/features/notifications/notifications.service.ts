import { Injectable } from '@angular/core';
import { ApiClientService } from '../../core/services/api-client.service';
import type { NotificationItem } from '../../shared/models/chat.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  constructor(private readonly api: ApiClientService) {}

  getUserNotifications(userId: string) {
    return this.api.get<NotificationItem[]>(`/notifications/user/${encodeURIComponent(userId)}`);
  }
}

