import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'connecthub.jwt';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  constructor(private readonly storage: StorageService) {}

  get token(): string | null {
    return this.storage.getString(TOKEN_KEY);
  }

  setToken(token: string): void {
    this.storage.setString(TOKEN_KEY, token);
  }

  clear(): void {
    this.storage.remove(TOKEN_KEY);
  }
}

