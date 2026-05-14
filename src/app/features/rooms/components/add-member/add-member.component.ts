import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RoomsService } from '../../services/rooms.service';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="page">
      <div class="card">
        <div class="h">Add member</div>
        <div class="p">Add a user by ` + "`userId`" + ` (or wire search UI later).</div>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>User ID</span>
            <input formControlName="userId" placeholder="UUID / userId" />
          </label>
          <label>
            <span>Role</span>
            <select formControlName="role">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <div class="row">
            <button class="btn" [disabled]="form.invalid || loading()">Add</button>
            <button class="btn ghost" type="button" (click)="back()">Back</button>
          </div>
          <div class="err" *ngIf="error()">{{ error() }}</div>
        </form>
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
      width: min(560px, 100%);
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
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 6px;
    }
    .btn {
      height: 40px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      font-weight: 800;
      cursor: pointer;
    }
    .btn.ghost {
      background: transparent;
      color: var(--text);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .err {
      color: var(--danger);
      font-weight: 700;
      font-size: 12px;
    }
  `,
})
export class AddMemberComponent {
  readonly roomId = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    userId: ['', [Validators.required]],
    role: ['MEMBER', [Validators.required]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly rooms: RoomsService,
  ) {
    effect(() => {
      this.roomId.set(this.route.snapshot.paramMap.get('roomId') ?? '');
    });
  }

  submit() {
    if (this.form.invalid || this.loading()) return;
    const roomId = this.roomId();
    if (!roomId) return;
    this.loading.set(true);
    this.error.set(null);
    const { userId } = this.form.getRawValue();
    this.rooms.addMember(roomId, userId!).subscribe({
      next: () => this.router.navigateByUrl(`/rooms/${encodeURIComponent(roomId)}/members`),
      error: (e: unknown) => {
        const err = e as { error?: { message?: string } };
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Failed to add member.');
      },
      complete: () => this.loading.set(false),
    });
  }

  back() {
    this.router.navigateByUrl(`/rooms/${encodeURIComponent(this.roomId())}/members`);
  }
}

