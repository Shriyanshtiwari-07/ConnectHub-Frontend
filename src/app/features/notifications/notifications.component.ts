import { Component, effect, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import type { NotificationItem } from '../../shared/models/chat.models';
import { NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="page">
      <div class="card">
        <div class="head">
          <div>
            <div class="h">Notifications</div>
            <div class="p">In-app notification center (API-ready).</div>
          </div>
          <button class="btn ghost" (click)="refresh()">Refresh</button>
        </div>

        <div class="list" *ngIf="items().length; else empty">
          <div class="n" *ngFor="let n of items()" [class.unread]="!n.isRead">
            <div class="title">{{ n.title }}</div>
            <div class="msg">{{ n.message }}</div>
            <div class="meta">{{ n.type }} · {{ when(n.createdAt) }}</div>
          </div>
        </div>

        <ng-template #empty>
          <div class="empty">No notifications.</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: `
    .page {
      height: calc(100dvh - 56px);
      display: grid;
      place-items: center;
      padding: 16px;
    }
    .card {
      width: min(820px, 100%);
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--panel);
      box-shadow: var(--shadow-lg);
      padding: 16px;
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .h {
      font-weight: 900;
      font-size: 18px;
      margin-bottom: 4px;
    }
    .p {
      color: var(--muted);
      font-size: 13px;
    }
    .btn {
      height: 38px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      font-weight: 800;
      cursor: pointer;
    }
    .btn.ghost {
      background: transparent;
      color: var(--text);
    }
    .list {
      display: grid;
      gap: 10px;
    }
    .n {
      border: 1px solid var(--border);
      background: var(--panel-2);
      border-radius: 16px;
      padding: 12px;
    }
    .n.unread {
      border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
    }
    .title {
      font-weight: 900;
      margin-bottom: 4px;
    }
    .msg {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 6px;
    }
    .meta {
      font-size: 11px;
      color: var(--muted);
      font-weight: 700;
    }
    .empty {
      padding: 14px 4px;
      color: var(--muted);
    }
  `,
})
export class NotificationsComponent {
  readonly items = signal<NotificationItem[]>([]);

  constructor(
    private readonly auth: AuthService,
    private readonly notif: NotificationsService,
  ) {
    effect(() => {
      this.refresh();
    });
  }

  refresh() {
    const me = this.auth.me();
    if (!me?.userId) return;
    this.notif.getUserNotifications(me.userId).subscribe({
      next: (n) => this.items.set(n),
      error: () => this.items.set([]),
    });
  }

  when(ts: string) {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}

