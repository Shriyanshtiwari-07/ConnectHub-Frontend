import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="page">
      <div class="card">
        <div class="h">Settings</div>
        <div class="p">Place for chat preferences (notifications, privacy, theme, blocked users).</div>

        <div class="tile">
          <div class="t">Theme</div>
          <div class="m">Use the toggle in the top bar.</div>
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
      width: min(820px, 100%);
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
    .tile {
      border: 1px solid var(--border);
      background: var(--panel-2);
      border-radius: 18px;
      padding: 14px;
    }
    .t {
      font-weight: 900;
      margin-bottom: 4px;
    }
    .m {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }
  `,
})
export class SettingsComponent {}

