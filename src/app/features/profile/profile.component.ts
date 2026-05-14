import { Component, effect, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoomsService } from '../rooms/services/rooms.service';
import type { UserStatus, UserProfile } from '../../shared/models/auth.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="page">
      <div class="card" *ngIf="user()">
        <div class="header-row">
          <div class="header-left">
            <div class="avatar-container">
              <img [src]="form.get('avatarUrl')?.value || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user()?.username" 
                   class="avatar" alt="Avatar" />
            </div>
            <div class="title-group">
              <div class="h">{{ isMe() ? 'My Profile' : user()?.fullName }}</div>
              <div class="p">@{{ user()?.username }}</div>
            </div>
          </div>
          <button *ngIf="!isMe()" class="btn message-btn" (click)="startChat()">Message</button>
        </div>

        <form class="form" [formGroup]="form" (ngSubmit)="save()">
          <label>
            <span>Full name</span>
            <input formControlName="fullName" [readonly]="!isMe()" />
          </label>
          <label>
            <span>Username</span>
            <input formControlName="username" [readonly]="!isMe()" />
          </label>
          <label>
            <span>Image Src</span>
            <input formControlName="avatarUrl" [readonly]="!isMe()" placeholder="Paste image address (URL) here..." />
          </label>
          <label>
            <span>Bio</span>
            <input formControlName="bio" [readonly]="!isMe()" placeholder="A short bio" />
          </label>

          <div class="row" *ngIf="isMe()">
            <label class="inline">
              <span>Status</span>
              <select formControlName="status" (change)="statusChanged()">
                <option value="ONLINE">Online</option>
                <option value="AWAY">Away</option>
                <option value="DND">Do Not Disturb</option>
                <option value="INVISIBLE">Invisible</option>
              </select>
            </label>
            <label class="inline">
              <span>Status message</span>
              <input formControlName="customMessage" placeholder="e.g. In a meeting" />
            </label>
          </div>

          <div class="status-badge" *ngIf="!isMe()">
            <span class="dot" [class.online]="user()?.status === 'ONLINE'"></span>
            <span>{{ user()?.status || 'OFFLINE' }}</span>
          </div>

          <button *ngIf="isMe()" class="btn" [disabled]="form.invalid || loading()">Save Changes</button>
          <div class="ok" *ngIf="saved()">Saved</div>
          <div class="err" *ngIf="error()">{{ error() }}</div>
        </form>
      </div>
      <div class="loading-state" *ngIf="loading() && !user()">
        Loading profile...
      </div>
    </div>
  `,
  styles: `
    .page {
      height: calc(100dvh - 56px);
      display: grid;
      place-items: center;
      padding: 16px;
    }
    .card {
      width: min(720px, 100%);
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--panel);
      box-shadow: var(--shadow-lg);
      padding: 16px;
    }
    .h {
      font-weight: 900;
      font-size: 18px;
      margin-bottom: 4px;
    }
    .p {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 14px;
    }
    .form {
      display: grid;
      gap: 10px;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 12px;
      color: var(--muted);
    }
    input,
    select {
      height: 40px;
      border-radius: 12px;
      padding: 0 12px;
      border: 1px solid var(--border);
      background: var(--input);
      color: var(--text);
      outline: none;
    }
    .row {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 10px;
    }
    .inline {
      align-content: start;
    }
    .btn {
      height: 40px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      font-weight: 800;
      cursor: pointer;
      margin-top: 6px;
      width: fit-content;
      padding: 0 16px;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .err {
      color: var(--danger);
      font-weight: 700;
      font-size: 12px;
      margin-top: 6px;
    }
    .ok {
      color: color-mix(in srgb, var(--primary) 80%, white);
      font-weight: 800;
      font-size: 12px;
      margin-top: 6px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .avatar-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--primary);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background: var(--input);
      flex-shrink: 0;
    }
    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .avatar:hover {
      transform: scale(1.05);
    }
    .message-btn {
      margin-top: 0 !important;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--muted);
      margin-top: 10px;
    }
    .status-badge .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--muted);
    }
    .status-badge .dot.online {
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    .loading-state {
      font-weight: 600;
      color: var(--muted);
    }
  `,
})
export class ProfileComponent implements OnInit, OnDestroy {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);
  readonly isMe = signal(true);
  readonly user = signal<UserProfile | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rooms = inject(RoomsService);
  private readonly auth = inject(AuthService);
  private sub?: Subscription;

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    avatarUrl: [''],
    bio: [''],
    status: ['ONLINE', [Validators.required]],
    customMessage: [''],
  });

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      const username = params['username'];
      const me = this.auth.me();

      if (!username || username === me?.username) {
        this.isMe.set(true);
        this.loadMyProfile();
      } else {
        this.isMe.set(false);
        this.loadUserProfile(username);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private loadMyProfile() {
    this.loading.set(true);
    this.auth.loadProfile().subscribe({
      next: (me) => {
        this.user.set(me);
        this.form.patchValue({
          fullName: me.fullName ?? '',
          username: me.username ?? '',
          avatarUrl: me.avatarUrl ?? '',
          bio: me.bio ?? '',
          status: (me.status ?? 'ONLINE') as UserStatus,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadUserProfile(username: string) {
    this.loading.set(true);
    this.auth.getUserByUsername(username).subscribe({
      next: (u) => {
        this.user.set(u);
        this.form.patchValue({
          fullName: u.fullName ?? '',
          username: u.username ?? '',
          avatarUrl: u.avatarUrl ?? '',
          bio: u.bio ?? '',
          status: (u.status ?? 'ONLINE') as UserStatus,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('User not found');
        this.loading.set(false);
      }
    });
  }

  startChat() {
    const u = this.user();
    if (!u) return;
    this.rooms.getOrCreateDM(u.username).subscribe({
      next: (room) => {
        this.router.navigate(['/chat'], { queryParams: { roomId: room.roomId } });
      }
    });
  }

  statusChanged() {
    if (!this.isMe()) return;
    const status = this.form.getRawValue().status as UserStatus;
    const customMessage = this.form.getRawValue().customMessage ?? '';
    this.auth.updateStatus(status, customMessage).subscribe({ error: () => undefined });
  }

  save() {
    if (!this.isMe() || this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);
    const { fullName, username, avatarUrl, bio } = this.form.getRawValue();
    this.auth
      .updateProfile({ fullName: fullName!, username: username!, avatarUrl: avatarUrl ?? '', bio: bio ?? '' })
      .subscribe({
        next: () => this.saved.set(true),
        error: (e: unknown) => {
          const err = e as { error?: { message?: string } };
          this.error.set(err?.error?.message ?? 'Failed to save.');
        },
        complete: () => this.loading.set(false),
      });
  }
}

