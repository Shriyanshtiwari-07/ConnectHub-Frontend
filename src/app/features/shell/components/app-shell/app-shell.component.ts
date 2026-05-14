import { Component, computed, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  template: `
    <div class="shell animate-in">
      <header class="topbar">
        <a class="brand" routerLink="/chat">
          <span class="dot"></span>
          <span class="brand-text">
            <span class="c-white">Connect</span><span class="c-blue">Hub</span>
          </span>
        </a>
        <div class="spacer"></div>

        <nav class="nav">
          <a routerLink="/profile" routerLinkActive="active">
            User Profile
          </a>
          <a routerLink="/pro" routerLinkActive="active" 
             class="pro-link"
             [style.--pro-color]="isPro() ? 'var(--success)' : 'var(--primary)'">
            {{ isPro() ? 'Pro Active' : 'ConnectHub Pro' }}
            <span *ngIf="isPro()" class="pro-badge-tiny">★</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active">Settings</a>
          <a *ngIf="userRole() === 'ADMIN'" routerLink="/admin" routerLinkActive="active">Admin</a>
        </nav>

        <div class="actions">
          <button class="btn-icon mobile-menu-btn" (click)="isMenuOpen.set(!isMenuOpen())">
            {{ isMenuOpen() ? '✕' : '☰' }}
          </button>
          <button class="btn-icon" (click)="toggleTheme()" [title]="'Switch to ' + themeLabel() + ' Mode'">
            {{ theme() === 'dark' ? '☀️' : '🌙' }}
          </button>
          <button class="btn logout hide-mobile" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="mobile-nav" *ngIf="isMenuOpen()">
        <nav class="nav-vertical">
          <a routerLink="/profile" (click)="isMenuOpen.set(false)" routerLinkActive="active">Profile</a>
          <a routerLink="/pro" (click)="isMenuOpen.set(false)" routerLinkActive="active" class="pro-link">
            {{ isPro() ? 'Pro Active' : 'ConnectHub Pro' }}
          </a>
          <a routerLink="/settings" (click)="isMenuOpen.set(false)" routerLinkActive="active">Settings</a>
          <a *ngIf="userRole() === 'ADMIN'" routerLink="/admin" (click)="isMenuOpen.set(false)" routerLinkActive="active">Admin</a>
          <button class="btn logout full-width" (click)="logout()">Logout</button>
        </nav>
      </div>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      --topbar-height: 64px;
    }
    .shell {
      height: 100dvh;
      display: grid;
      grid-template-rows: var(--topbar-height) 1fr;
      background: var(--app-bg);
      color: var(--text);
    }
    .topbar {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--panel) 70%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.5px;
    }
    .brand-text {
      display: flex;
    }
    .c-white { color: #ffffff; }
    :host-context([data-theme='light']) .c-white { color: var(--text); }
    .c-blue { color: var(--primary); }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 15px var(--primary);
    }
    .spacer {
      flex: 1;
    }
    .nav {
      display: flex;
      gap: 6px;
      margin-right: 12px;
    }
    .nav a {
      font-size: 14px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 12px;
      text-decoration: none;
      color: var(--muted);
      transition: all 0.2s;
    }
    .nav a.active {
      color: var(--text);
      background: var(--chip);
      box-shadow: inset 0 0 0 1px var(--border);
    }
    .nav a:hover:not(.active) {
      color: var(--text);
      background: rgba(255, 255, 255, 0.03);
    }
    .pro-link {
      color: var(--pro-color) !important;
      font-weight: 700 !important;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--chip);
      cursor: pointer;
      display: grid;
      place-items: center;
      font-size: 18px;
      transition: all 0.2s;
    }
    .btn-icon:hover {
      background: var(--border);
      transform: translateY(-1px);
    }
    .btn {
      height: 38px;
      padding: 0 18px;
      border-radius: 12px;
      border: none;
      background: var(--primary);
      color: white;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
    }
    .btn.logout {
      background: var(--chip);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn.logout:hover {
      background: var(--danger);
      color: white;
      border-color: var(--danger);
      box-shadow: 0 4px 12px rgba(255, 59, 92, 0.2);
    }
    .content {
      min-height: 0;
      overflow-y: auto;
    }
    .pro-badge-tiny {
      background: var(--success);
      color: white;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 4px;
      margin-left: 4px;
    }
    .mobile-menu-btn {
      display: none;
    }
    .mobile-nav {
      position: fixed;
      top: var(--topbar-height);
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--app-bg);
      z-index: 99;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    .nav-vertical {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .nav-vertical a {
      font-size: 18px;
      font-weight: 600;
      padding: 16px;
      background: var(--panel);
      border-radius: 12px;
      text-decoration: none;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .full-width {
      width: 100%;
      height: 50px;
      margin-top: 20px;
    }
    @media (max-width: 768px) {
      .nav {
        display: none;
      }
      .mobile-menu-btn {
        display: grid;
      }
    }
  `,
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  readonly isMenuOpen = signal(false);
  readonly theme = signal<'light' | 'dark'>('dark');
  readonly themeLabel = computed(() => (this.theme() === 'dark' ? 'Light' : 'Dark'));
  readonly userPlan = computed(() => this.auth.me()?.plan || 'FREE');
  readonly isPro = computed(() => ['PRO', 'MONTHLY', 'YEARLY'].includes(this.auth.me()?.plan || ''));
  readonly userRole = computed(() => this.auth.me()?.role || 'USER');

  constructor() {
    const saved = (localStorage.getItem('connecthub.theme') as 'light' | 'dark' | null) ?? 'dark';
    this.theme.set(saved);
    document.documentElement.dataset['theme'] = saved;
  }

  toggleTheme() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem('connecthub.theme', next);
    document.documentElement.dataset['theme'] = next;
  }

  logout() {
    this.auth.logout();
    location.href = '/auth/login';
  }
}

