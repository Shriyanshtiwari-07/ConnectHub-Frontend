import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="page">
      <div class="card">
        <div class="h">User settings</div>
        <div class="p">Update your profile information and preferences.</div>

        <form class="form" [formGroup]="form" (ngSubmit)="save()">
          <label>
            <span>Display name</span>
            <input formControlName="displayName" />
          </label>
          <label>
            <span>Email</span>
            <input formControlName="email" type="email" />
          </label>
          <label>
            <span>Avatar URL</span>
            <input formControlName="avatarUrl" placeholder="https://..." />
          </label>
          <label>
            <span>Bio</span>
            <textarea formControlName="bio" rows="3" placeholder="Tell us about yourself..."></textarea>
          </label>

          <div class="section-title">Preferences</div>
          
          <label class="toggle">
            <span>Email notifications</span>
            <input formControlName="emailNotifications" type="checkbox" />
          </label>
          <label class="toggle">
            <span>Push notifications</span>
            <input formControlName="pushNotifications" type="checkbox" />
          </label>
          <label class="toggle">
            <span>Dark mode</span>
            <input formControlName="darkMode" type="checkbox" />
          </label>

          <div class="row">
            <button class="btn" [disabled]="form.invalid || loading()">Save</button>
            <button class="btn ghost" type="button" (click)="back()">Back</button>
          </div>
          <div class="err" *ngIf="error()">{{ error() }}</div>
          <div class="success" *ngIf="success()">{{ success() }}</div>
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
      width: min(640px, 100%);
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
    label.toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    input, textarea {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid var(--border);
      background: var(--input);
      color: var(--text);
      outline: none;
      font-family: inherit;
    }
    input {
      height: 40px;
      padding: 0 12px;
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .section-title {
      font-weight: 900;
      font-size: 14px;
      margin-top: 16px;
      margin-bottom: 4px;
      color: var(--text);
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
    .success {
      color: var(--success);
      font-weight: 700;
      font-size: 12px;
    }
  `,
})
export class UserSettingsComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    avatarUrl: [''],
    bio: [''],
    emailNotifications: [true],
    pushNotifications: [true],
    darkMode: [false],
  });

  constructor(
    private readonly router: Router,
  ) {
    this.loadUserData();
  }

  loadUserData() {
    const storedUser = localStorage.getItem('user_profile');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.form.patchValue({
          displayName: user.displayName || user.name || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
          bio: user.bio || '',
          emailNotifications: user.emailNotifications ?? true,
          pushNotifications: user.pushNotifications ?? true,
          darkMode: user.darkMode ?? false,
        });
      } catch {
        // Ignore parse errors
      }
    }
  }

  save() {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.form.value;

    const userData = {
      ...JSON.parse(localStorage.getItem('user_profile') || '{}'),
      ...formValue,
    };
    localStorage.setItem('user_profile', JSON.stringify(userData));

    if (formValue.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    setTimeout(() => {
      this.loading.set(false);
      this.success.set('Settings saved successfully!');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  back() {
    this.router.navigateByUrl('/chat');
  }
}