import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomsService } from '../../services/rooms.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf, NgFor } from '@angular/common';
import type { Room } from '../../../../shared/models/chat.models';
import type { UserProfile } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  template: `
    <div class="page">
      <div class="card">
        <!-- HEADER -->
        <div class="h-group">
          <div class="h">{{ step() === 'MEMBERS' ? 'Add Group Members' : 'Group Details' }}</div>
          <div class="p">
            {{ step() === 'MEMBERS' ? 'Select people you want to add to this group.' : 'Give your new group a name and description.' }}
          </div>
        </div>

        <!-- STEP 1: MEMBER SELECTION -->
        <div class="step-content" *ngIf="step() === 'MEMBERS'">
          <div class="search-wrap">
            <input #sq type="text" placeholder="Search people..." (input)="searchQuery.set(sq.value)" />
          </div>

          <div class="user-list scroll">
            <div *ngFor="let u of filteredUsers()" 
                 class="user-item" 
                 [class.selected]="selectedUsernames().has(u.username)"
                 (click)="toggleUser(u.username)">
              <div class="check">
                <span *ngIf="selectedUsernames().has(u.username)">✓</span>
              </div>
              <div class="avatar">{{ u.username[0].toUpperCase() }}</div>
              <div class="user-info">
                <div class="name">{{ u.fullName || u.username }}</div>
                <div class="tag">@{{ u.username }}</div>
              </div>
            </div>
            <div class="empty" *ngIf="filteredUsers().length === 0">No users found.</div>
          </div>

          <div class="footer">
            <div class="count">{{ selectedUsernames().size }} members selected</div>
            <button class="btn next" [disabled]="selectedUsernames().size === 0" (click)="step.set('DETAILS')">
              Next
            </button>
          </div>
        </div>

        <!-- STEP 2: GROUP DETAILS -->
        <div class="step-content" *ngIf="step() === 'DETAILS'">
          <form class="form" [formGroup]="form" (ngSubmit)="submit()">
            <label>
              <span>Group Name</span>
              <input formControlName="name" placeholder="e.g. Weekend Plans" autofocus />
            </label>

            <label>
              <span>Description</span>
              <textarea formControlName="description" placeholder="What's this group about?" rows="3"></textarea>
            </label>

            <div class="footer">
              <button type="button" class="btn secondary" (click)="step.set('MEMBERS')">Back</button>
              <button class="btn" [disabled]="form.invalid || loading()">
                {{ loading() ? 'Creating...' : 'Create Group' }}
              </button>
            </div>
          </form>
          <div class="err" *ngIf="error()">{{ error() }}</div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page {
      height: calc(100dvh - 56px);
      display: grid;
      place-items: center;
      padding: 16px;
      background: var(--app-bg);
    }
    .card {
      width: min(500px, 100%);
      height: 600px;
      border-radius: 24px;
      border: 1px solid var(--border);
      background: var(--panel);
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .h-group {
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--border);
    }
    .h { font-weight: 900; font-size: 20px; color: var(--text); }
    .p { color: var(--muted); font-size: 13px; margin-top: 4px; }

    .step-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .search-wrap { padding: 16px 24px; }
    .search-wrap input {
      width: 100%;
      height: 44px;
      border-radius: 14px;
      padding: 0 16px;
      border: 1px solid var(--border);
      background: var(--input);
      color: var(--text);
      outline: none;
      font-size: 14px;
    }

    .user-list { flex: 1; overflow-y: auto; padding: 0 12px; }
    .user-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .user-item:hover { background: var(--panel-2); }
    .user-item.selected { background: color-mix(in srgb, var(--primary) 8%, var(--panel)); }

    .check {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--border);
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 900;
      color: white;
      transition: all 0.2s;
    }
    .selected .check { background: var(--primary); border-color: var(--primary); }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      background: var(--primary);
      color: white;
      display: grid;
      place-items: center;
      font-weight: 700;
    }
    .user-info { min-width: 0; }
    .name { font-weight: 700; font-size: 14px; }
    .tag { font-size: 12px; color: var(--muted); }

    .footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--panel-2);
    }
    .count { font-size: 13px; font-weight: 700; color: var(--muted); }

    .form { padding: 24px; display: grid; gap: 20px; }
    label { display: grid; gap: 8px; font-size: 13px; font-weight: 700; color: var(--muted); }
    input, textarea {
      border-radius: 14px;
      padding: 12px 16px;
      border: 1px solid var(--border);
      background: var(--input);
      color: var(--text);
      outline: none;
      font-size: 14px;
    }
    textarea { resize: none; }

    .btn {
      height: 44px;
      padding: 0 24px;
      border-radius: 14px;
      border: none;
      background: var(--primary);
      color: white;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn.secondary { background: var(--chip); color: var(--text); border: 1px solid var(--border); }
    .btn.next { background: linear-gradient(135deg, var(--primary), var(--primary-2)); }

    .err { padding: 0 24px 16px; color: var(--danger); font-size: 12px; font-weight: 700; text-align: center; }
    .empty { padding: 40px; text-align: center; color: var(--muted); font-size: 14px; }
  `,
})
export class CreateRoomComponent implements OnInit {
  readonly step = signal<'MEMBERS' | 'DETAILS'>('MEMBERS');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');
  
  readonly users = signal<UserProfile[]>([]);
  readonly selectedUsernames = signal<Set<string>>(new Set());

  private readonly fb = inject(FormBuilder);
  private readonly rooms = inject(RoomsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.users().filter(u => u.username !== this.auth.me()?.username);
    if (!q) return all;
    return all.filter(u => 
      u.username.toLowerCase().includes(q) || 
      (u.fullName || '').toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.auth.getAllUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set('Failed to load users.')
    });
  }

  toggleUser(username: string) {
    const set = new Set(this.selectedUsernames());
    if (set.has(username)) {
      set.delete(username);
    } else {
      set.add(username);
    }
    this.selectedUsernames.set(set);
  }

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    
    const { name, description } = this.form.getRawValue();
    const members = Array.from(this.selectedUsernames());

    this.rooms
      .createRoom({
        name: name ?? '',
        description: description ?? '',
        type: 'GROUP',
        memberUsernames: members
      })
      .subscribe({
        next: (room: Room) => this.router.navigateByUrl(`/chat?roomId=${encodeURIComponent(room.roomId)}`),
        error: (e: any) => {
          this.loading.set(false);
          this.error.set(e?.error?.message ?? 'Failed to create group.');
        },
        complete: () => this.loading.set(false),
      });
  }
}

