import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { RoomsService } from '../../../rooms/services/rooms.service';
import type { UserProfile } from '../../../../shared/models/auth.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="h">Find Users</div>
        <div class="p">Search for someone to start a conversation.</div>

        <div class="search">
          <input 
            placeholder="Search by username or name..." 
            (input)="onSearch($event)"
            autoFocus
          />
        </div>

        <div class="list scroll">
          <div *ngFor="let u of users()" class="user-item" (click)="startChat(u)">
            <div class="avatar">{{ u.username[0].toUpperCase() }}</div>
            <div class="info">
              <div class="name">{{ u.fullName || u.username }}</div>
              <div class="un">@{{ u.username }}</div>
            </div>
            <div class="action">Chat</div>
          </div>
          <div class="empty" *ngIf="users().length === 0 && !loading()">
            No users found. Try searching for someone else.
          </div>
          <div class="loading" *ngIf="loading()">Searching...</div>
        </div>

        <button class="btn ghost" (click)="close.emit()">Close</button>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 20px;
    }
    .modal-card {
      width: min(480px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow-xl);
      padding: 24px;
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }
    .h { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
    .p { color: var(--muted); font-size: 14px; margin-bottom: 16px; }
    .search input {
      width: 100%;
      height: 44px;
      border-radius: 14px;
      padding: 0 14px;
      border: 1px solid var(--border);
      background: var(--input);
      color: var(--text);
      outline: none;
      margin-bottom: 16px;
    }
    .list {
      flex: 1;
      overflow: auto;
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }
    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .user-item:hover {
      background: var(--panel-2);
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--primary);
      color: white;
      display: grid;
      place-items: center;
      font-weight: 700;
    }
    .info { flex: 1; min-width: 0; }
    .name { font-weight: 600; font-size: 14px; }
    .un { font-size: 12px; color: var(--muted); }
    .action {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
    }
    .empty, .loading {
      padding: 40px 20px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
    }
    .btn.ghost {
      align-self: flex-end;
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      font-weight: 600;
    }
  `
})
export class UserSearchComponent {
  @Output() close = new EventEmitter<void>();
  
  readonly users = signal<UserProfile[]>([]);
  readonly loading = signal(false);
  
  private readonly auth = inject(AuthService);
  private readonly rooms = inject(RoomsService);
  private readonly router = inject(Router);

  onSearch(evt: Event) {
    const q = (evt.target as HTMLInputElement).value;
    if (!q || q.length < 2) {
      this.users.set([]);
      return;
    }
    
    this.loading.set(true);
    this.auth.searchUsers(q).subscribe({
      next: (users) => {
        // Filter out self
        const me = this.auth.me();
        this.users.set(users.filter(u => u.userId !== me?.userId && u.username !== me?.username));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startChat(user: UserProfile) {
    this.rooms.getOrCreateDM(user.username).subscribe({
      next: (room) => {
        this.close.emit();
        this.router.navigate(['/chat'], { queryParams: { roomId: room.roomId } });
      }
    });
  }
}
