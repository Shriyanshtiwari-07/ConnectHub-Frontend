import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsService } from '../../../rooms/services/rooms.service';
import { AuthService } from '../../../../core/services/auth.service';
import type { UserProfile } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <header>
          <h2>Create New Group</h2>
          <button class="close-btn" (click)="close.emit()">×</button>
        </header>

        <main>
          <div class="form-group">
            <label>Group Name</label>
            <input type="text" [(ngModel)]="groupName" placeholder="e.g. Marketing Team" />
          </div>

          <div class="form-group">
            <label>Group Avatar URL (Optional)</label>
            <input type="text" [(ngModel)]="avatarUrl" placeholder="https://example.com/icon.png" />
          </div>

          <div class="member-selection">
            <label>Select Members ({{selectedUsers().length}})</label>
            <div class="search-box">
              <input type="text" (input)="onSearch($event)" placeholder="Search users..." />
            </div>
            
            <div class="user-list">
              <div 
                *ngFor="let user of filteredUsers()" 
                class="user-item" 
                [class.selected]="isSelected(user)"
                (click)="toggleUser(user)"
              >
                <img [src]="user.avatarUrl || 'assets/default-avatar.png'" alt="" />
                <div class="user-info">
                  <span class="name">{{user.fullName || user.username}}</span>
                  <span class="username">@{{user.username}}</span>
                </div>
                <div class="checkbox" [class.checked]="isSelected(user)"></div>
              </div>
            </div>
          </div>
        </main>

        <footer>
          <button class="cancel-btn" (click)="close.emit()">Cancel</button>
          <button 
            class="create-btn" 
            [disabled]="!groupName || selectedUsers().length === 0 || isLoading()"
            (click)="createGroup()"
          >
            {{ isLoading() ? 'Creating...' : 'Create Group' }}
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    .modal-content {
      background: var(--surface-bg, #fff);
      color: var(--text-main, #333);
      width: 100%;
      max-width: 450px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }
    header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #eee);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h2 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
    }
    main {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--text-muted);
    }
    input[type="text"] {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-color, #eee);
      border-radius: 8px;
      background: var(--input-bg, #f9f9f9);
      color: var(--text-main);
      box-sizing: border-box;
    }
    .member-selection {
      display: flex;
      flex-direction: column;
      height: 300px;
    }
    .search-box {
      margin-bottom: 12px;
    }
    .user-list {
      flex: 1;
      overflow-y: auto;
      border: 1px solid var(--border-color, #eee);
      border-radius: 8px;
    }
    .user-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .user-item:hover {
      background: var(--hover-bg, #f0f0f0);
    }
    .user-item.selected {
      background: var(--primary-light, #e3f2fd);
    }
    .user-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
    }
    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .user-info .name { font-weight: 500; }
    .user-info .username { font-size: 0.75rem; color: var(--text-muted); }
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color, #ccc);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .checkbox.checked {
      background: var(--primary-color, #007bff);
      border-color: var(--primary-color, #007bff);
    }
    .checkbox.checked::after {
      content: '✓';
      color: #fff;
      font-size: 12px;
    }
    footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #eee);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    button {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    .cancel-btn { background: none; color: var(--text-muted); }
    .create-btn {
      background: var(--primary-color, #007bff);
      color: #fff;
    }
    .create-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `
})
export class CreateGroupModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() groupCreated = new EventEmitter<any>();

  private readonly roomsApi = inject(RoomsService);
  private readonly auth = inject(AuthService);

  groupName = '';
  avatarUrl = '';
  isLoading = signal(false);
  
  allUsers = signal<UserProfile[]>([]);
  filteredUsers = signal<UserProfile[]>([]);
  selectedUsers = signal<UserProfile[]>([]);

  constructor() {
    this.auth.getAllUsers().subscribe(users => {
      const me = this.auth.me();
      const others = (users || []).filter(u => u.username !== me?.username);
      this.allUsers.set(others);
      this.filteredUsers.set(others);
    });
  }

  onSearch(event: any) {
    const q = event.target.value.toLowerCase();
    this.filteredUsers.set(
      this.allUsers().filter(u => 
        u.username.toLowerCase().includes(q) || 
        (u.fullName && u.fullName.toLowerCase().includes(q))
      )
    );
  }

  toggleUser(user: UserProfile) {
    this.selectedUsers.update(selected => {
      if (selected.some(u => u.username === user.username)) {
        return selected.filter(u => u.username !== user.username);
      } else {
        return [...selected, user];
      }
    });
  }

  isSelected(user: UserProfile) {
    return this.selectedUsers().some(u => u.username === user.username);
  }

  createGroup() {
    this.isLoading.set(true);
    const payload = {
      name: this.groupName,
      type: 'GROUP' as const,
      avatarUrl: this.avatarUrl,
      memberUsernames: this.selectedUsers().map(u => u.username)
    };

    this.roomsApi.createRoom(payload).subscribe({
      next: (room) => {
        this.isLoading.set(false);
        this.groupCreated.emit(room);
        this.close.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Failed to create group', err);
        alert('Failed to create group. Please try again.');
      }
    });
  }
}
