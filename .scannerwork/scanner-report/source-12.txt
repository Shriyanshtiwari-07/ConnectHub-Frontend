import { Injectable, signal, inject } from '@angular/core';
import { tap } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { AuthTokenService } from './auth-token.service';
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile, UserStatus } from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClientService);
  private readonly tokens = inject(AuthTokenService);
  
  readonly me = signal<UserProfile | null>(null);

  constructor() {}

  login(payload: LoginRequest) {
    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap((res) => {
        if (res.token) this.tokens.setToken(res.token);
        if (res.user) this.me.set(res.user);
      }),
    );
  }

  register(payload: RegisterRequest) {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap((res) => {
        if (res.token) this.tokens.setToken(res.token);
        if (res.user) this.me.set(res.user);
      }),
    );
  }

  initiateRegistration(email: string) {
    return this.api.post<{ message: string }>('/auth/register/initiate', { email });
  }

  verifyOtpAndRegister(payload: { registerRequest: RegisterRequest, otp: string }) {
    return this.api.post<AuthResponse>('/auth/register/verify', payload).pipe(
      tap((res) => {
        if (res.token) this.tokens.setToken(res.token);
        if (res.user) this.me.set(res.user);
      }),
    );
  }

  verifyEmail(username: string, otp: string) {
    return this.api.post<AuthResponse>('/auth/verify-email', { username, otp }).pipe(
      tap((res) => {
        if (res.token) this.tokens.setToken(res.token);
        if (res.user) this.me.set(res.user);
      }),
    );
  }

  forgotPassword(email: string) {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(payload: { email: string, otp: string, newPassword: string }) {
    return this.api.post<{ message: string }>('/auth/reset-password', payload);
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:8082/oauth2/authorization/google';
  }

  loadProfile() {
    return this.api.get<UserProfile>('/auth/profile').pipe(tap((me) => this.me.set(me)));
  }

  updateProfile(patch: Partial<UserProfile>) {
    return this.api.put<UserProfile>('/auth/profile', patch).pipe(tap((me) => this.me.set(me)));
  }

  updateStatus(status: UserStatus, customMessage?: string) {
    return this.api.put<UserProfile>('/auth/status', { status, customMessage }).pipe(tap((me) => this.me.set(me)));
  }

  updatePlan(plan: 'FREE' | 'PRO' | 'MONTHLY' | 'YEARLY') {
    return this.api.put<UserProfile>('/auth/plan', { plan }).pipe(tap((me) => this.me.set(me)));
  }

  searchUsers(q: string) {
    return this.api.get<UserProfile[]>('/auth/search', { q });
  }

  getAllUsers() {
    return this.api.get<UserProfile[]>('/users');
  }

  getUserByUsername(username: string) {
    return this.api.get<UserProfile>(`/users/${username}`);
  }

  logout() {
    this.tokens.clear();
    this.me.set(null);
  }
}

