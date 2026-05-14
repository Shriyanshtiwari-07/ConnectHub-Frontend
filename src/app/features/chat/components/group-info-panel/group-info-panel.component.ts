import { Component, EventEmitter, Input, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../../../rooms/services/rooms.service';
import { AuthService } from '../../../../core/services/auth.service';
import type { Room, RoomMember } from '../../../../shared/models/chat.models';

@Component({
  selector: 'app-group-info-panel',
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
        <h3>Group Info</h3>
      </header>

      <div class="scroll-area">
        <div class="group-header">
          <div class="avatar Large">
            <img *ngIf="room?.avatarUrl; else noAvatar" [src]="room?.avatarUrl" alt="" />
            <ng-template #noAvatar>{{ room?.name?.[0]?.toUpperCase() }}</ng-template>
          </div>
          <h2>{{ room?.name }}</h2>
          <p class="member-count">{{ members().length }} members</p>
        </div>

        <div class="section">
          <div class="section-header">
            <h4>Members</h4>
            <button *ngIf="isAdmin()" class="add-member-btn" (click)="showAddMember = !showAddMember">
              {{ showAddMember ? 'Close' : 'Add' }}
            </button>
          </div>

          <div *ngIf="showAddMember" class="add-member-form">
            <input #uInput type="text" placeholder="Username to add..." (keyup.enter)="addMember(uInput.value); uInput.value=''" />
            <button (click)="addMember(uInput.value); uInput.value=''">Add</button>
          </div>

          <div class="member-list">
            <div *ngFor="let m of members()" class="member-item">
              <img [src]="m.avatarUrl || 'assets/default-avatar.png'" alt="" />
              <div class="member-info">
                <span class="name">{{ m.fullName || m.username }}</span>
                <span class="role" *ngIf="m.role === 'ADMIN'">Admin</span>
              </div>
              <div class="member-actions" *ngIf="isAdmin() && m.userId !== me()?.username">
                <button (click)="makeAdmin(m.username)" *ngIf="m.role !== 'ADMIN'">Make Admin</button>
                <button (click)="removeMember(m.username)" class="danger">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-actions">
          <button class="leave-btn" (click)="leaveGroup()">Leave Group</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .panel-container {
      width: 100%;
      height: 100%;
      background: var(--surface-bg, #fff);
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--border-color, #eee);
    }
    header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid var(--border-color, #eee);
    }
    .back-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); }
    h3 { margin: 0; font-size: 1.1rem; }
    
    .scroll-area { flex: 1; overflow-y: auto; padding-bottom: 40px; }
    
    .group-header {
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--hover-bg, #fafafa);
      margin-bottom: 16px;
    }
    .avatar.Large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: var(--primary-color, #007bff);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    h2 { margin: 0; font-size: 1.5rem; text-align: center; }
    .member-count { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }

    .section { padding: 16px; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    h4 { margin: 0; color: var(--primary-color); font-size: 0.9rem; text-transform: uppercase; }
    .add-member-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; font-weight: 600; }
    
    .add-member-form { display: flex; gap: 8px; margin-bottom: 16px; }
    .add-member-form input { flex: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; }
    .add-member-form button { padding: 8px 16px; background: var(--primary-color); color: #fff; border: none; border-radius: 4px; cursor: pointer; }

    .member-list { display: flex; flex-direction: column; gap: 12px; }
    .member-item { display: flex; align-items: center; gap: 12px; }
    .member-item img { width: 40px; height: 40px; border-radius: 50%; }
    .member-info { flex: 1; display: flex; flex-direction: column; }
    .member-info .name { font-weight: 500; }
    .member-info .role { font-size: 0.75rem; color: #2ecc71; font-weight: 600; }
    
    .member-actions { display: flex; gap: 8px; }
    .member-actions button { font-size: 0.75rem; background: none; border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .member-actions button.danger { color: #e74c3c; border-color: #e74c3c; }
    
    .footer-actions { padding: 16px; margin-top: 24px; }
    .leave-btn { width: 100%; padding: 12px; background: none; border: 1px solid #e74c3c; color: #e74c3c; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .leave-btn:hover { background: #e74c3c; color: #fff; }
  `
})
export class GroupInfoPanelComponent {
  @Input({ required: true }) room: Room | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() roomUpdated = new EventEmitter<void>();

  private readonly roomsApi = inject(RoomsService);
  private readonly auth = inject(AuthService);

  members = signal<any[]>([]);
  showAddMember = false;

  me = computed(() => this.auth.me());
  isAdmin = computed(() => {
    const me = this.me();
    return this.members().some(m => m.username === me?.username && m.role === 'ADMIN');
  });

  constructor() {
    // Initial load will happen when input changes, handled by effect or manual trigger
  }

  ngOnChanges() {
    if (this.room) {
      this.loadMembers();
    }
  }

  loadMembers() {
    if (!this.room) return;
    this.roomsApi.getRoom(this.room.roomId).subscribe(room => {
      this.members.set(room.members || []);
    });
  }

  addMember(username: string) {
    if (!this.room || !username) return;
    this.roomsApi.addMember(this.room.roomId, username).subscribe({
      next: () => {
        this.loadMembers();
        this.showAddMember = false;
      },
      error: (err) => alert(err.error?.message || 'Failed to add member')
    });
  }

  removeMember(username: string) {
    if (!this.room || !confirm(`Remove @${username} from group?`)) return;
    this.roomsApi.removeMember(this.room.roomId, username).subscribe({
      next: () => this.loadMembers(),
      error: (err) => alert(err.error?.message || 'Failed to remove member')
    });
  }

  makeAdmin(username: string) {
    if (!this.room || !confirm(`Promote @${username} to Admin?`)) return;
    this.roomsApi.makeAdmin(this.room.roomId, username).subscribe({
      next: () => this.loadMembers(),
      error: (err) => alert(err.error?.message || 'Failed to promote member')
    });
  }

  leaveGroup() {
    if (!this.room || !confirm('Are you sure you want to leave this group?')) return;
    this.roomsApi.leaveRoom(this.room.roomId).subscribe({
      next: () => {
        this.roomUpdated.emit(); // To trigger room list refresh and navigate away
        this.close.emit();
      },
      error: (err) => alert(err.error?.message || 'Failed to leave group')
    });
  }
}
