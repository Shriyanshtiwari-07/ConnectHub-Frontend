import { Component, OnInit, signal, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminStats } from './services/admin.service';
import { UserProfile } from '../../shared/models/auth.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  template: `
    <div class="admin-container">
      <header class="header">
        <div class="title-group">
          <h1>Admin Dashboard</h1>
          <p>Super Admin Control Center</p>
        </div>
        <div class="header-actions">
          <button class="btn secondary" (click)="showBroadcast.set(true)">📢 Broadcast</button>
          <button class="btn primary" (click)="loadData()">🔄 Refresh</button>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users">👥</div>
          <div class="stat-info">
            <span class="label">Total Users</span>
            <span class="value">{{ stats()?.totalUsers ?? 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon online">🟢</div>
          <div class="stat-info">
            <span class="label">Online Now</span>
            <span class="value">{{ stats()?.onlineUsers ?? 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pro">⭐</div>
          <div class="stat-info">
            <span class="label">Pro Members</span>
            <span class="value">{{ stats()?.proUsers ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div class="admin-tabs">
        <button [class.active]="activeTab() === 'users'" (click)="activeTab.set('users')">Users</button>
        <button [class.active]="activeTab() === 'rooms'" (click)="activeTab.set('rooms')">Rooms (Groups)</button>
      </div>

      <!-- User Management Tab -->
      <div class="card" *ngIf="activeTab() === 'users'">
        <div class="card-header">
          <h2>User Management</h2>
          <div class="search-bar">
            <input type="text" placeholder="Search by name, email or username..." (input)="onSearch($event)">
          </div>
        </div>

        <div class="table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th class="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers()">
                <td>
                   <div class="user-cell">
                    <img [src]="user.avatarUrl || 'https://ui-avatars.com/api/?name=' + user.fullName" alt="Avatar" class="avatar">
                    <div class="details">
                      <span class="name">{{ user.fullName }}</span>
                      <span class="email">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <select class="role-select" [value]="user.role" (change)="changeRole(user, $event)">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <span class="badge" [class.pro]="user.plan === 'PRO'">{{ user.plan }}</span>
                </td>
                <td>
                  <span class="status-dot" [class.online]="user.status === 'ONLINE'"></span>
                  {{ user.status }}
                </td>
                <td>{{ user.createdAt | date:'shortDate' }}</td>
                <td class="actions">
                  <button class="btn-icon" title="Toggle Status" (click)="toggleStatus(user)">
                    {{ user.status === 'DEACTIVATED' ? '🔓' : '🔒' }}
                  </button>
                  <button class="btn-icon delete" title="Delete User" (click)="deleteUser(user)">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Room Management Tab -->
      <div class="card" *ngIf="activeTab() === 'rooms'">
        <div class="card-header">
          <h2>Platform Rooms</h2>
        </div>
        <div class="table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Type</th>
                <th>Members</th>
                <th class="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let room of rooms()">
                <td>
                  <div class="user-cell">
                    <div class="avatar-box">{{ room.name?.[0]?.toUpperCase() || 'R' }}</div>
                    <span class="name">{{ room.name || 'Private Chat' }}</span>
                  </div>
                </td>
                <td><span class="badge">{{ room.type }}</span></td>
                <td>{{ room.members?.length || 0 }}</td>
                <td class="actions">
                  <button class="btn-icon delete" (click)="deleteRoom(room)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Broadcast Modal -->
      <div class="modal-overlay" *ngIf="showBroadcast()">
        <div class="modal-content animate-pop">
          <h3>📢 Send System Broadcast</h3>
          <p>This message will be sent to all users on the platform.</p>
          
          <div class="form-group">
            <label>Title</label>
            <input type="text" [(ngModel)]="broadcastTitle" placeholder="e.g., Scheduled Maintenance">
          </div>
          
          <div class="form-group">
            <label>Message</label>
            <textarea [(ngModel)]="broadcastMessage" rows="4" placeholder="Type your message here..."></textarea>
          </div>

          <div class="modal-actions">
            <button class="btn secondary" (click)="showBroadcast.set(false)">Cancel</button>
            <button class="btn primary" [disabled]="!broadcastTitle || !broadcastMessage" (click)="sendBroadcast()">Send Now</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .admin-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .header-actions { display: flex; gap: 12px; }
    .btn { padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
    .btn.primary { background: var(--primary); color: white; border: none; }
    .btn.secondary { background: var(--panel-2); color: var(--text); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .admin-tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
    .admin-tabs button { padding: 12px 24px; background: none; border: none; color: var(--muted); cursor: pointer; font-weight: 600; position: relative; }
    .admin-tabs button.active { color: var(--primary); }
    .admin-tabs button.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--primary); }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: var(--panel); padding: 24px; border-radius: 20px; border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
    .stat-icon { font-size: 24px; width: 48px; height: 48px; display: grid; place-items: center; border-radius: 14px; background: var(--panel-2); }
    .stat-info .label { display: block; font-size: 13px; color: var(--muted); }
    .stat-info .value { font-size: 24px; font-weight: 800; }

    .card { background: var(--panel); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; }
    .card-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
    .search-bar { flex: 1; margin-left: 20px; }
    .search-bar input { background: var(--panel-2); border: 1px solid var(--border); padding: 10px 16px; border-radius: 12px; color: var(--text); width: 100%; }

    .user-table { width: 100%; border-collapse: collapse; text-align: left; }
    .user-table th { padding: 16px 24px; background: var(--panel-2); color: var(--muted); font-size: 13px; }
    .user-table td { padding: 16px 24px; border-bottom: 1px solid var(--border); }
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 10px; }
    .avatar-box { width: 36px; height: 36px; border-radius: 10px; background: var(--chip); display: grid; place-items: center; font-weight: 700; }
    
    .role-select { background: var(--panel-2); border: 1px solid var(--border); color: var(--text); padding: 4px 8px; border-radius: 8px; font-weight: 600; }
    .badge { padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 800; background: var(--chip); }
    .badge.pro { color: var(--success); background: color-mix(in srgb, var(--success) 15%, transparent); }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ccc; margin-right: 6px; }
    .status-dot.online { background: var(--success); box-shadow: 0 0 8px var(--success); }

    .btn-icon { background: none; border: none; cursor: pointer; font-size: 18px; transition: transform 0.1s; }
    .btn-icon:hover { transform: scale(1.2); }
    .actions { text-align: right; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: grid; place-items: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: var(--panel); padding: 32px; border-radius: 24px; width: 90%; max-width: 500px; border: 1px solid var(--border); }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
    .form-group input, .form-group textarea { width: 100%; background: var(--panel-2); border: 1px solid var(--border); border-radius: 12px; padding: 12px; color: var(--text); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

    @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  `,
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  readonly activeTab = signal<'users' | 'rooms'>('users');
  readonly users = signal<UserProfile[]>([]);
  readonly filteredUsers = signal<UserProfile[]>([]);
  readonly rooms = signal<any[]>([]);
  readonly stats = signal<AdminStats | null>(null);
  
  readonly showBroadcast = signal(false);
  broadcastTitle = '';
  broadcastMessage = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getUsers().subscribe(users => {
      this.users.set(users);
      this.filteredUsers.set(users);
    });

    this.adminService.getRooms().subscribe(rooms => {
      this.rooms.set(rooms);
    });

    this.adminService.getStats().subscribe(stats => {
      this.stats.set(stats);
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredUsers.set(
      this.users().filter(u => 
        u.fullName?.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
      )
    );
  }

  changeRole(user: UserProfile, event: any) {
    const newRole = event.target.value;
    if (confirm(`Change ${user.fullName}'s role to ${newRole}?`)) {
      this.adminService.updateUserRole(user.userId, newRole).subscribe(() => {
        this.loadData();
      });
    }
  }

  toggleStatus(user: UserProfile) {
    const nextStatus = user.status === 'DEACTIVATED' ? 'ONLINE' : 'DEACTIVATED';
    this.adminService.toggleUserStatus(user.userId, nextStatus).subscribe(() => {
      this.loadData();
    });
  }

  deleteUser(user: UserProfile) {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      this.adminService.deleteUser(user.userId).subscribe(() => {
        this.loadData();
      });
    }
  }

  deleteRoom(room: any) {
    if (confirm(`Delete room "${room.name || 'Private Chat'}" permanently?`)) {
      this.adminService.deleteRoom(room.roomId).subscribe(() => {
        this.loadData();
      });
    }
  }

  sendBroadcast() {
    this.adminService.broadcast(this.broadcastTitle, this.broadcastMessage).subscribe(() => {
      alert('Broadcast sent successfully!');
      this.showBroadcast.set(false);
      this.broadcastTitle = '';
      this.broadcastMessage = '';
    });
  }
}

