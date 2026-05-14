import { Component, EventEmitter, Input, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import type { Room, RoomMember } from '../../../../shared/models/chat.models';

@Component({
  selector: 'app-user-profile-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-container">
      <header>
        <button class="back-btn" (click)="close.emit()">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <h3>User Profile</h3>
      </header>

      <div class="scroll-area" *ngIf="otherUser()">
        <div class="user-header">
          <div class="avatar Large">
            <img *ngIf="otherUser()?.avatarUrl; else noAvatar" [src]="otherUser()?.avatarUrl" alt="" />
            <ng-template #noAvatar>{{ otherUser()?.fullName?.[0] || otherUser()?.username?.[0]?.toUpperCase() }}</ng-template>
          </div>
          <h2>{{ otherUser()?.fullName || otherUser()?.username }}</h2>
          <p class="username">@{{ otherUser()?.username }}</p>
          <div class="status-badge" [class.online]="otherUser()?.status === 'ONLINE'">
            {{ otherUser()?.status || 'OFFLINE' }}
          </div>
        </div>

        <div class="info-sections">
          <div class="section" *ngIf="otherUser()?.bio">
            <h4>About</h4>
            <p class="bio">{{ otherUser()?.bio }}</p>
          </div>

          <div class="section">
            <h4>Email</h4>
            <p class="detail">{{ otherUser()?.email || 'Not provided' }}</p>
          </div>

          <div class="section" *ngIf="otherUser()?.status === 'ONLINE'">
            <h4>Active Now</h4>
            <p class="detail">Currently online and available</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .panel-container {
      width: 100%;
      height: 100%;
      background: var(--surface-bg, #1a1a1a);
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--border, rgba(255,255,255,0.1));
      color: var(--text);
    }
    header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
    }
    .back-btn { background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .back-btn:hover { background: rgba(255,255,255,0.05); }
    h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    
    .scroll-area { flex: 1; overflow-y: auto; padding-bottom: 40px; }
    
    .user-header {
      padding: 40px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
      margin-bottom: 16px;
    }
    .avatar.Large {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: var(--primary, #007bff);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      border: 4px solid var(--surface-bg);
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    h2 { margin: 0; font-size: 1.6rem; font-weight: 800; text-align: center; }
    .username { color: var(--primary); font-weight: 600; font-size: 1rem; margin: 4px 0 12px 0; opacity: 0.8; }
    
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(255,255,255,0.1);
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge.online {
      background: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
    }

    .info-sections { padding: 0 24px; display: flex; flex-direction: column; gap: 32px; }
    .section h4 { margin: 0 0 8px 0; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
    .bio { line-height: 1.6; font-size: 0.95rem; margin: 0; color: rgba(255,255,255,0.9); }
    .detail { font-size: 1rem; margin: 0; color: var(--text); font-weight: 500; }
  `
})
export class UserProfilePanelComponent {
  @Input({ required: true }) room: Room | null = null;
  @Output() close = new EventEmitter<void>();

  private readonly auth = inject(AuthService);

  me = computed(() => this.auth.me());

  otherUser = computed(() => {
    if (!this.room || !this.room.members) return null;
    const me = this.me();
    // Find the member who is not 'me'
    return this.room.members.find(m => m.username !== me?.username) || this.room.members[0];
  });
}
