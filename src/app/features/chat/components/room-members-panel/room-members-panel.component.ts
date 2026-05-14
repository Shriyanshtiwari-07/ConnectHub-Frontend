import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { RoomMember } from '../../../../shared/models/chat.models';
import { RoomsService } from '../../../rooms/services/rooms.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-members-panel',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="panel" [class.open]="open">
      <div class="head">
        <div class="t">Channel Members</div>
        <button class="x" (click)="close.emit()">✕</button>
      </div>

      <div class="list scroll" *ngIf="members().length; else empty">
        <div class="member-row clickable" *ngFor="let m of members()" (click)="viewProfile(m.username)">
          <div class="col-av">
            <div class="av">
              <img *ngIf="m.avatarUrl; else fb" [src]="m.avatarUrl" alt="avatar" />
              <ng-template #fb>{{ m.username.slice(0, 2).toUpperCase() }}</ng-template>
            </div>
            <div class="status-dot" [class.off]="(m.status ?? 'INVISIBLE') === 'INVISIBLE'"></div>
          </div>
          
          <div class="col-meta">
            <div class="name-row">
              <span class="name">{{ m.fullName ?? m.username }}</span>
              <span class="role-badge" [class.admin]="m.role === 'ADMIN'">{{ m.role }}</span>
            </div>
            <div class="sub-info">
              <span>{{ m.status ?? 'OFFLINE' }}</span>
              <span *ngIf="m.lastSeenAt as ls" class="ls">· {{ lastSeen(ls) }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty">
          <div class="empty-icon">👥</div>
          <p>No members found</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    .panel {
      width: 0;
      overflow: hidden;
      border-left: 1px solid var(--border);
      background: var(--panel);
      transition: width 240ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .panel.open {
      width: 320px;
    }
    .head {
      height: var(--topbar-height, 64px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      border-bottom: 1px solid var(--border);
    }
    .t {
      font-weight: 800;
      font-size: 15px;
      font-family: var(--font-display);
    }
    .x {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--chip);
      color: var(--text);
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.2s;
    }
    .x:hover { background: var(--danger); color: white; border-color: var(--danger); }

    .list {
      height: calc(100% - var(--topbar-height, 64px));
      overflow: auto;
      padding: 12px;
    }
    
    .member-row {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 12px;
      padding: 10px;
      border-radius: 14px;
      transition: all 0.2s;
      margin-bottom: 4px;
    }
    .member-row.clickable { cursor: pointer; }
    .member-row.clickable:hover {
      background: var(--chip);
      transform: translateX(-4px);
    }

    .col-av { position: relative; width: 44px; height: 44px; }
    .av {
      width: 100%;
      height: 100%;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      display: grid;
      place-items: center;
      font-weight: 800;
      overflow: hidden;
    }
    .av img { width: 100%; height: 100%; object-fit: cover; }
    
    .status-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--success);
      border: 2px solid var(--panel);
      box-shadow: 0 0 8px var(--success);
    }
    .status-dot.off { background: #4b5563; box-shadow: none; }

    .col-meta { min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
    
    .name-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .name {
      font-weight: 700;
      font-size: 14px;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .role-badge {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 6px;
      background: var(--chip);
      color: var(--muted);
      border: 1px solid var(--border);
    }
    .role-badge.admin {
      color: var(--warning);
      border-color: rgba(255, 177, 30, 0.3);
      background: rgba(255, 177, 30, 0.1);
    }

    .sub-info {
      font-size: 12px;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ls { opacity: 0.7; }

    .empty {
      padding: 60px 20px;
      text-align: center;
      color: var(--muted);
    }
    .empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.2; }

    @media (max-width: 768px) {
      .panel.open {
        width: 100%;
        position: fixed;
        right: 0;
        top: var(--topbar-height, 64px);
        bottom: 0;
        z-index: 200;
      }
    }
  `,
})
export class RoomMembersPanelComponent {
  @Input({ required: true }) roomId!: string;
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  readonly members = signal<RoomMember[]>([]);

  constructor(
    private readonly rooms: RoomsService,
    private readonly router: Router,
  ) {
    effect(() => {
      if (!this.open || !this.roomId) return;
      this.rooms.getMembers(this.roomId).subscribe({
        next: (m: RoomMember[]) => this.members.set(m),
        error: () => this.members.set([]),
      });
    });
  }

  viewProfile(username?: string) {
    if (!username) return;
    this.router.navigate(['/profile', username]);
  }

  lastSeen(ts: string) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}

