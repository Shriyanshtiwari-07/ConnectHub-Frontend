import { Component, effect, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import type { RoomMember } from '../../../../shared/models/chat.models';
import { RoomsService } from '../../services/rooms.service';

@Component({
  selector: 'app-room-members',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="head">
          <div>
            <div class="h">Room members</div>
            <div class="p">Admin actions (role/mute/remove) can be wired to backend later.</div>
          </div>
          <a class="btn" [routerLink]="['/rooms', roomId(), 'add-member']">+ Add</a>
        </div>

        <div class="list" *ngIf="members().length; else empty">
          <div class="m" *ngFor="let m of members()">
            <div class="av">
              <img *ngIf="m.avatarUrl" [src]="m.avatarUrl" alt="av" />
              <span *ngIf="!m.avatarUrl">{{ m.username.slice(0, 2).toUpperCase() }}</span>
            </div>
            <div class="meta">
              <div class="name">{{ m.fullName ?? m.username }}</div>
              <div class="sub">{{ m.role }} · {{ m.status ?? 'OFFLINE' }}</div>
            </div>
            <button class="ghost" (click)="noop()">Mute</button>
            <button class="ghost danger" (click)="noop()">Remove</button>
          </div>
        </div>

        <ng-template #empty>
          <div class="empty">No members found.</div>
        </ng-template>

        <div class="foot">
          <button class="ghost" (click)="back()">Back</button>
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
    }
    .card {
      width: min(760px, 100%);
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--panel);
      box-shadow: var(--shadow-lg);
      padding: 16px;
    }
    .head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    .h {
      font-weight: 900;
      font-size: 18px;
      margin-bottom: 4px;
    }
    .p {
      color: var(--muted);
      font-size: 13px;
    }
    .btn {
      height: 38px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      font-weight: 800;
      cursor: pointer;
      text-decoration: none;
      display: grid;
      place-items: center;
    }
    .list {
      display: grid;
      gap: 10px;
    }
    .m {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      gap: 10px;
      align-items: center;
      padding: 10px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--panel-2);
    }
    .av {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      display: grid;
      place-items: center;
      font-weight: 900;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .av img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .meta {
      min-width: 0;
    }
    .name {
      font-weight: 800;
      font-size: 13px;
    }
    .sub {
      font-size: 12px;
      color: var(--muted);
    }
    .ghost {
      height: 34px;
      padding: 0 10px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      cursor: pointer;
      font-weight: 700;
    }
    .ghost.danger {
      color: var(--danger);
    }
    .empty {
      padding: 14px 4px;
      color: var(--muted);
    }
    .foot {
      margin-top: 14px;
      border-top: 1px solid var(--border);
      padding-top: 12px;
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class RoomMembersComponent {
  readonly roomId = signal('');
  readonly members = signal<RoomMember[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly rooms: RoomsService,
  ) {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('roomId') ?? '';
      this.roomId.set(id);
      if (!id) return;
      this.rooms.getMembers(id).subscribe({
        next: (m: RoomMember[]) => this.members.set(m),
        error: () => this.members.set([]),
      });
    });
  }

  back() {
    this.router.navigateByUrl('/chat');
  }

  noop() {}
}

