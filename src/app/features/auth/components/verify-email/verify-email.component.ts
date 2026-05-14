import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="h">Verify your email</div>
    <div class="p">We've sent a verification code to your email. Please enter it below.</div>

    <form class="form" [formGroup]="form" (ngSubmit)="submit()">
      <label>
        <span>Verification Code</span>
        <input formControlName="otp" placeholder="123456" autocomplete="one-time-code" maxlength="6" />
      </label>

      <button class="btn" [disabled]="form.invalid || loading()">Verify Email</button>

      <div class="row">
        <span class="err" *ngIf="error()">{{ error() }}</span>
        <span class="spacer"></span>
        <a routerLink="/auth/login">Back to login</a>
      </div>
    </form>
  `,
  styles: `
    .form { display: grid; gap: 10px; }
    .h { font-size: 20px; font-weight: 800; }
    .p { font-size: 13px; color: var(--muted); margin-top: -6px; margin-bottom: 6px; }
    label { display: grid; gap: 6px; font-size: 12px; color: var(--muted); }
    input { height: 40px; border-radius: 12px; padding: 0 12px; border: 1px solid var(--border); background: var(--input); color: var(--text); outline: none; }
    input:focus { border-color: var(--primary); }
    .btn { height: 40px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: white; font-weight: 700; cursor: pointer; margin-top: 4px; border: none; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); margin-top: 2px; }
    .spacer { flex: 1; }
    .err { color: var(--danger); font-weight: 600; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
  `,
})
export class VerifyEmailComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly username = this.route.snapshot.queryParamMap.get('username') ?? '';

  readonly form = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.verifyEmail(this.username, this.form.value.otp!).subscribe({
      next: (res) => {
        if (res.user?.role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/chat');
        }
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Verification failed');
        this.loading.set(false);
      }
    });
  }
}
