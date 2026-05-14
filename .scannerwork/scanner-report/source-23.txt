import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthTokenService } from '../../../core/services/auth-token.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  template: '<div style="padding: 40px; text-align: center;">Completing login...</div>',
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tokens = inject(AuthTokenService);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.tokens.setToken(token);
        this.auth.loadProfile().subscribe({
          next: () => this.router.navigate(['/chat']),
          error: () => this.router.navigate(['/auth/login']),
        });
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
