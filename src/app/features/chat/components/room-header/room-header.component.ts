import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import type { Room } from '../../../../shared/models/chat.models';
import type { PresenceInfo } from '../../../../core/services/presence.service';

@Component({
  selector: 'app-room-header',
  standalone: true,
  imports: [NgIf],
  template: `
    <header class="header">
      <div class="left" (click)="room?.type === 'GROUP' ? openMembers.emit() : null">
        <button class="back-btn" (click)="onBack(); $event.stopPropagation()">←</button>
        <div class="avatar-box">
          <img *ngIf="room?.avatarUrl; else fallbackImg" [src]="room?.avatarUrl" />
          <ng-template #fallbackImg>
            <div class="fallback">{{ initials }}</div>
          </ng-template>
        </div>
        <div class="meta">
          <div class="name">{{ room?.name ?? 'Chat' }}</div>
          <div class="status" [class.online]="isOnline">
            <span *ngIf="room?.type === 'GROUP'">Group Chat</span>
            <span *ngIf="room?.type === 'DM'">{{ statusLabel }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="h-icon" (click)="openRoomSettings.emit()" title="Settings">⚙️</button>
        <button class="h-icon" (click)="deleteRoom.emit()" title="Delete">🗑️</button>
      </div>
    </header>
  `,
  styles: `
    .header {
      height: 64px;
      padding: 0 20px;
      background: var(--panel);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text);
      border-bottom: 1px solid var(--border);
    }
    .left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      cursor: pointer;
    }
    .back-btn {
      display: none;
      background: transparent;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
    }
    @media (max-width: 768px) { .back-btn { display: block; } }

    .avatar-box {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #6a7175;
      overflow: hidden;
      display: grid;
      place-items: center;
    }
    .avatar-box img { width: 100%; height: 100%; object-fit: cover; }
    .fallback { font-weight: 600; color: white; }

    .meta { min-width: 0; display: flex; flex-direction: column; }
    .name { font-weight: 500; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status { font-size: 13px; color: var(--muted); }
    .status.online { color: var(--success); }

    .actions { display: flex; gap: 4px; }
    .h-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #aebac1;
      cursor: pointer;
      display: grid;
      place-items: center;
      font-size: 18px;
    }
    .h-icon:hover { background: rgba(255,255,255,0.05); }
  `,
})
export class RoomHeaderComponent {
  @Input({ required: true }) room: Room | null = null;
  @Input() onlineCount = 0;
  @Input() peerPresence: PresenceInfo | null = null;

  @Output() openRoomSettings = new EventEmitter<void>();
  @Output() openMembers = new EventEmitter<void>();
  @Output() openInvite = new EventEmitter<void>();
  @Output() deleteRoom = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  onBack() {
    this.goBack.emit();
  }

  get initials() {
    const name = this.room?.name ?? 'Chat';
    const parts = name.trim().split(/\s+/g).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join('');
  }

  get isOnline() {
    if (this.room?.type === 'GROUP') return this.onlineCount > 0;
    return this.peerPresence?.status === 'ONLINE';
  }

  get statusLabel() {
    if (this.isOnline) return 'Online';
    if (this.peerPresence?.lastSeen) {
      const d = new Date(this.peerPresence.lastSeen);
      if (!isNaN(d.getTime())) {
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
          return 'Last seen today at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return 'Last seen ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
    return 'Offline';
  }
}

