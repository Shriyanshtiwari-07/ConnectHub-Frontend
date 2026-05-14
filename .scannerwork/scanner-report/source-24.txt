import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="h">Forgot password?</div>
    <div class="p">Enter your email and we'll send you a code to reset your password.</div>

    <form class="form" [formGroup]="form" (ngSubmit)="submit()">
      <label>
        <span>Email Address</span>
        <input formControlName="email" placeholder="you@example.com" autocomplete="email" />
      </label>

      <button class="btn" [disabled]="form.invalid || loading()">Send Reset Code</button>

      <div class="row">
        <span class="err" *ngIf="error()">{{ error() }}</span>
        <span class="success" *ngIf="success()">{{ success() }}</span>
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
    .success { color: var(--success); font-weight: 600; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
  `,
})
export class ForgotPasswordComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.success.set('Reset code sent! Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.form.value.email } });
        }, 2000);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Failed to send reset code');
        this.loading.set(false);
      }
    });
  }
}
