import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import type { Room } from '../../../../shared/models/chat.models';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="card" [class.active]="active">
      <div class="avatar-col">
        <div class="avatar">
          <img *ngIf="room.avatarUrl; else fallback" [src]="room.avatarUrl" alt="avatar" />
          <ng-template #fallback>
            <div class="fallback">{{ initials }}</div>
          </ng-template>
          <span class="presence" [class.online]="room.status === 'ONLINE'" *ngIf="room.type === 'DM'"></span>
        </div>
      </div>

      <div class="meta">
        <div class="row header-row">
          <div class="name">{{ room.name }}</div>
          <div class="time" *ngIf="room.lastMessageAt">{{ timeLabel }}</div>
        </div>
        <div class="row preview-row">
          <div class="preview" [class.unread-text]="(room.unreadCount ?? 0) > 0" [class.deleted]="room.lastMessageIsDeleted">
            <span class="sender" *ngIf="room.type === 'GROUP' && room.lastMessageSender && !room.lastMessageIsDeleted">{{ room.lastMessageSender }}: </span>
            <span class="content-text">{{ preview }}</span>
          </div>
          <div class="unread-badge" *ngIf="(room.unreadCount ?? 0) > 0">
            {{ room.unreadCount }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .card {
      display: grid;
      grid-template-columns: 56px 1fr;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 1px solid rgba(var(--border-rgb), 0.5);
    }
    .card:hover {
      background: var(--chip);
    }
    .card.active {
      background: rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .card.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
    }
    .card.active .name {
      font-weight: 800;
      color: var(--primary);
    }
    
    .avatar-col {
      display: flex;
      align-items: center;
    }
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      font-weight: 800;
      color: white;
      font-size: 16px;
    }
    .presence {
      position: absolute;
      right: -1px;
      bottom: -1px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--muted);
      border: 3px solid var(--panel);
    }
    .presence.online {
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    
    .meta {
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }
    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }
    .name {
      font-weight: 700;
      font-size: 16px;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.2px;
    }
    .time {
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      white-space: nowrap;
      opacity: 0.8;
    }
    .preview {
      font-size: 14px;
      line-height: 1.4;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .preview.deleted {
      font-style: italic;
      color: #94a3b8;
      opacity: 0.8;
    }
    .unread-text {
      color: var(--text);
      font-weight: 600;
    }
    .sender {
      color: var(--primary);
      font-weight: 700;
      font-size: 13px;
    }
    .content-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .unread-badge {
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      background: var(--primary);
      color: white;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.4);
      animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `,
})
export class RoomCardComponent {
  @Input({ required: true }) room!: Room;
  @Input() active = false;

  get initials() {
    const parts = (this.room.name ?? 'Room').trim().split(/\s+/g).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join('');
  }

  get timeLabel() {
    const ts = this.room.lastMessageAt;
    if (!ts) return '';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  }

  get preview() {
    if (this.room.lastMessageIsDeleted) {
      return 'This message was deleted';
    }
    
    let content = '';
    const type = this.room.lastMessageType;
    
    if (type === 'IMAGE') {
      content = '📷 Photo';
    } else if (type === 'FILE') {
      content = '📎 Document';
    } else if (type === 'AUDIO') {
      content = '🎤 Voice note';
    } else {
      content = this.room.lastMessageContent || this.room.description || 'Start a conversation';
    }

    if (content.length > 40) {
      return content.substring(0, 40) + '...';
    }
    return content;
  }
}

