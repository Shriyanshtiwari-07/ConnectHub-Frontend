import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { RoomsService } from '../../../rooms/services/rooms.service';
import type { UserProfile } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="h">Add to Group</div>
        <div class="p">Select users to add to this conversation.</div>

        <div class="search">
          <input 
            placeholder="Search users..." 
            (input)="onSearch($event)"
            autoFocus
          />
        </div>

        <div class="list scroll">
          <div *ngFor="let u of users()" class="user-item" (click)="invite(u)">
            <div class="avatar">{{ u.username[0].toUpperCase() }}</div>
            <div class="info">
              <div class="name">{{ u.fullName || u.username }}</div>
              <div class="un">@{{ u.username }}</div>
            </div>
            <div class="action">Add</div>
          </div>
          <div class="empty" *ngIf="users().length === 0 && !loading()">
            No users found.
          </div>
          <div class="loading" *ngIf="loading()">Searching...</div>
        </div>

        <button class="btn ghost" (click)="close.emit()">Cancel</button>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: grid;
      place-items: center;
      padding: 20px;
    }
    .modal-card {
      width: min(400px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow-xl);
      padding: 24px;
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }
    .h { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
    .p { color: var(--muted); font-size: 13px; margin-bottom: 16px; }
    .search input {
      width: 100%;
      height: 40px;
      border-radius: 12px;
      padding: 0 12px;
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
      gap: 6px;
      margin-bottom: 16px;
    }
    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .user-item:hover {
      background: var(--panel-2);
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--primary);
      color: white;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 13px;
    }
    .info { flex: 1; min-width: 0; }
    .name { font-weight: 600; font-size: 13px; }
    .un { font-size: 11px; color: var(--muted); }
    .action {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary);
      padding: 3px 8px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
    }
    .empty, .loading {
      padding: 20px;
      text-align: center;
      color: var(--muted);
      font-size: 13px;
    }
    .btn.ghost {
      align-self: flex-end;
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    }
  `
})
export class InviteModalComponent {
  @Input({ required: true }) roomId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() invited = new EventEmitter<UserProfile>();
  
  readonly users = signal<UserProfile[]>([]);
  readonly loading = signal(false);
  
  private readonly auth = inject(AuthService);
  private readonly roomsApi = inject(RoomsService);

  onSearch(evt: Event) {
    const q = (evt.target as HTMLInputElement).value;
    if (!q || q.length < 2) {
      this.users.set([]);
      return;
    }
    
    this.loading.set(true);
    this.auth.searchUsers(q).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  invite(user: UserProfile) {
    this.roomsApi.addMember(this.roomId, user.username).subscribe({
      next: () => {
        this.invited.emit(user);
        this.close.emit();
      }
    });
  }
}
