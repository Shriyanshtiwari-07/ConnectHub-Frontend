export type UserStatus = 'ONLINE' | 'AWAY' | 'DND' | 'INVISIBLE' | 'DEACTIVATED';

export interface AuthTokens {
  accessToken: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  status?: UserStatus;
  plan?: 'FREE' | 'PRO' | 'MONTHLY' | 'YEARLY';
  role?: 'USER' | 'ADMIN';
  lastSeenAt?: string;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: UserProfile;
}

