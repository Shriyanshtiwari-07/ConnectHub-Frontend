import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth">
      <div class="background-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>
      <div class="card animate-in">
        <div class="brand">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" class="logo-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <div>
            <div class="title">ConnectHub</div>
            <div class="subtitle">Connect instantly. Chat securely.</div>
          </div>
        </div>
        <router-outlet />

      </div>
    </div>
  `,
  styles: `
    .auth {
      height: 100dvh;
      display: grid;
      place-items: center;
      padding: 18px;
      position: relative;
      overflow: hidden;
      background: var(--app-bg);
    }
    .background-blobs {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.6;
    }
    .blob-1 {
      width: 60vw;
      height: 60vw;
      max-width: 800px;
      max-height: 800px;
      background: color-mix(in srgb, var(--primary) 40%, transparent);
      top: -20%;
      left: -10%;
      animation: float 20s ease-in-out infinite;
    }
    .blob-2 {
      width: 50vw;
      height: 50vw;
      max-width: 600px;
      max-height: 600px;
      background: color-mix(in srgb, var(--primary-2) 30%, transparent);
      bottom: -10%;
      right: -10%;
      animation: float 25s ease-in-out infinite reverse;
    }
    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }
    .card {
      position: relative;
      z-index: 1;
      width: min(440px, 100%);
      background: rgba(25, 30, 40, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 32px 28px 24px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    :root[data-theme='light'] .card {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1);
    }
    .brand {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      justify-content: center;
    }
    .logo {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      box-shadow: 0 12px 28px color-mix(in srgb, var(--primary) 40%, transparent);
      display: grid;
      place-items: center;
    }
    .logo-icon {
      width: 26px;
      height: 26px;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text);
      line-height: 1.2;
    }
    .subtitle {
      font-size: 13px;
      color: var(--muted);
      font-weight: 500;
    }

    a {
      color: var(--muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    a:hover {
      color: var(--primary);
    }
    .animate-in {
      animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `,
})
export class AuthLayoutComponent {}

