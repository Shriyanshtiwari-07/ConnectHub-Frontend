import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgClass],
  template: `
    <form class="form animate-in" [formGroup]="form" (ngSubmit)="submit()">
      <div class="header">
        <h2 class="h">Welcome Back</h2>
        <p class="p">Sign in to continue to ConnectHub.</p>
      </div>

      <div class="input-group">
        <label for="username">Username or Email</label>
        <div class="input-wrapper">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <input id="username" formControlName="username" placeholder="johndoe@example.com" autocomplete="username" [ngClass]="{'has-error': isInvalid('username')}" />
        </div>
        <span class="validation-msg" *ngIf="isInvalid('username')">Username or email is required</span>
      </div>

      <div class="input-group">
        <label for="password">Password</label>
        <div class="input-wrapper">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <input id="password" formControlName="password" [type]="showPassword() ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" [ngClass]="{'has-error': isInvalid('password')}" />
          <button type="button" class="btn-icon" (click)="togglePassword()">
            <svg *ngIf="!showPassword()" class="icon-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <svg *ngIf="showPassword()" class="icon-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
          </button>
        </div>
        <span class="validation-msg" *ngIf="isInvalid('password')">Password must be at least 6 characters</span>
      </div>

      <div class="row align-right">
        <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
      </div>

      <button class="btn primary-btn" [disabled]="form.invalid || loading()">
        <span *ngIf="!loading()">Sign in</span>
        <div class="loader" *ngIf="loading()"></div>
      </button>

      <div class="divider">
        <span>OR</span>
      </div>

      <button type="button" class="btn google" (click)="loginWithGoogle()">
        <img src="https://cdn-icons-png.flaticon.com/128/2702/2702602.png" alt="google" />
        Continue with Google
      </button>

      <div class="row footer-row">
        <span class="err" *ngIf="error()">{{ error() }}</span>
        <div class="links">
          <span>New to ConnectHub?</span>
          <a routerLink="/auth/register" class="register-link">Create an account</a>
        </div>
      </div>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 10px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 8px;
    }
    .h {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 4px 0;
      color: var(--text);
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .p {
      font-size: 14px;
      color: var(--muted);
      margin: 0;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      margin-left: 4px;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .icon {
      position: absolute;
      left: 14px;
      width: 18px;
      height: 18px;
      color: var(--muted);
      pointer-events: none;
      transition: color 0.3s ease;
    }
    input {
      width: 100%;
      height: 48px;
      border-radius: 14px;
      padding: 0 40px 0 42px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text);
      font-size: 14px;
      outline: none;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    :root[data-theme='light'] input {
      background: rgba(0, 0, 0, 0.02);
    }
    input:focus {
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 15%, transparent);
    }
    input:focus ~ .icon {
      color: var(--primary);
    }
    input.has-error {
      border-color: var(--danger);
      background: color-mix(in srgb, var(--danger) 5%, transparent);
    }
    input.has-error:focus {
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--danger) 15%, transparent);
    }
    .btn-icon {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      padding: 0;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }
    .btn-icon:hover {
      color: var(--text);
    }
    .icon-toggle {
      width: 18px;
      height: 18px;
    }
    .validation-msg {
      font-size: 12px;
      color: var(--danger);
      margin-left: 4px;
      animation: fadeIn 0.2s ease;
    }
    .align-right {
      justify-content: flex-end;
      margin-top: -6px;
    }
    .forgot-link {
      font-size: 13px;
      color: var(--muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .forgot-link:hover {
      color: var(--primary);
    }
    .btn {
      height: 48px;
      border-radius: 14px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .primary-btn {
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      box-shadow: 0 4px 15px color-mix(in srgb, var(--primary) 30%, transparent);
    }
    .primary-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 40%, transparent);
    }
    .primary-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    .google {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
      border: 1px solid var(--border);
      backdrop-filter: blur(10px);
    }
    :root[data-theme='light'] .google {
      background: white;
      color: #3c4043;
    }
    .google:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    :root[data-theme='light'] .google:hover {
      background: #f8f9fa;
    }
    .google img {
      width: 20px;
      margin-right: 10px;
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
      margin: 4px 0;
    }
    .divider::before, .divider::after {
      content: "";
      flex: 1;
      border-bottom: 1px solid var(--border);
    }
    .divider span {
      padding: 0 14px;
    }
    .row {
      display: flex;
      align-items: center;
    }
    .footer-row {
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }
    .err {
      color: var(--danger);
      font-size: 13px;
      font-weight: 500;
      background: color-mix(in srgb, var(--danger) 10%, transparent);
      padding: 8px 12px;
      border-radius: 8px;
      width: 100%;
      text-align: center;
    }
    .links {
      display: flex;
      gap: 6px;
      font-size: 14px;
      color: var(--muted);
    }
    .register-link {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
    }
    .register-link:hover {
      text-decoration: underline;
    }
    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePassword() {
    this.showPassword.update(s => !s);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.loading()) return;
    
    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    
    this.auth.login({ username: username ?? '', password: password ?? '' }).subscribe({
      next: (res) => {
        if (res.user?.role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/chat');
        }
      },
      error: (e: unknown) => {
        const err = e as { error?: { message?: string } };
        this.loading.set(false);
        if (err?.error?.message === 'EMAIL_NOT_VERIFIED') {
          this.error.set('Please verify your email to continue.');
          this.router.navigate(['/auth/verify-email'], { queryParams: { username } });
        } else {
          this.error.set(err?.error?.message ?? 'Login failed.');
        }
      },
      complete: () => this.loading.set(false),
    });
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }
}

