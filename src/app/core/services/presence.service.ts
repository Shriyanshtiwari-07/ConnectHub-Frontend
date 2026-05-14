import { Injectable, signal, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { WebsocketService } from './websocket.service';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

export interface PresenceInfo {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'DND';
  lastSeen?: string;
}

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private readonly api = inject(ApiClientService);
  private readonly ws = inject(WebsocketService);
  private readonly auth = inject(AuthService);

  readonly presenceMap = signal<Record<string, PresenceInfo>>({});

  constructor() {
    this.ws.subscribePresence().subscribe(payload => {
      this.updateLocalPresence(payload.userId, payload.status as any, payload.lastSeenAt);
    });
  }

  reportOnline() {
    const me = this.auth.me();
    if (!me) return;

    const params = {
      userId: me.username,
      deviceType: 'WEB',
      sessionId: 'web-session-' + Math.random().toString(36).substring(2, 9)
    };

    this.api.post('/presence/online', {}, params).subscribe({
      next: () => console.log('Reported online status'),
      error: (err) => console.error('Failed to report online status', err)
    });
  }

  getPresence(userId: string) {
    return this.api.get<Record<string, any>>(`/presence/${userId}`).pipe(
      tap(data => {
        // Presence data is usually a map of sessions
        const isOnline = Object.keys(data).length > 0;
        this.updateLocalPresence(userId, isOnline ? 'ONLINE' : 'OFFLINE');
      })
    );
  }

  private updateLocalPresence(userId: string, status: 'ONLINE' | 'OFFLINE', lastSeen?: string) {
    this.presenceMap.update(map => ({
      ...map,
      [userId]: { userId, status, lastSeen }
    }));
  }
}
