import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthTokenService } from '../services/auth-token.service';

export const authGuard: CanMatchFn = () => {
  const token = inject(AuthTokenService).token;
  if (token) return true;

  inject(Router).navigateByUrl('/auth/login');
  return false;
};

