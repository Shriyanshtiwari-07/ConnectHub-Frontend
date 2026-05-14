import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiClientService } from './api-client.service';
import { AuthTokenService } from './auth-token.service';
import { UserProfile, AuthResponse } from '../../shared/models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let apiSpy: jasmine.SpyObj<ApiClientService>;
  let tokenSpy: jasmine.SpyObj<AuthTokenService>;

  const mockUser: UserProfile = {
    id: 1,
    fullName: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    online: true,
    role: 'USER',
    plan: 'FREE'
  };

  const mockAuthResponse: AuthResponse = {
    token: 'fake-jwt-token',
    user: mockUser
  };

  beforeEach(() => {
    const apiMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    const tokenMock = {
      setToken: vi.fn(),
      clear: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiClientService, useValue: apiMock },
        { provide: AuthTokenService, useValue: tokenMock }
      ]
    });

    service = TestBed.inject(AuthService);
    apiSpy = TestBed.inject(ApiClientService) as any;
    tokenSpy = TestBed.inject(AuthTokenService) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set token/user', () => {
    apiSpy.post.mockReturnValue(of(mockAuthResponse));

    service.login({ username: 'testuser', password: 'password' }).subscribe();

    expect(apiSpy.post).toHaveBeenCalledWith('/auth/login', expect.any(Object));
    expect(tokenSpy.setToken).toHaveBeenCalledWith('fake-jwt-token');
    expect(service.me()).toEqual(mockUser);
  });

  it('should logout and clear token/user', () => {
    service.me.set(mockUser);
    service.logout();

    expect(tokenSpy.clear).toHaveBeenCalled();
    expect(service.me()).toBeNull();
  });

  it('should load profile and update state', () => {
    apiSpy.get.mockReturnValue(of(mockUser));

    service.loadProfile().subscribe();

    expect(apiSpy.get).toHaveBeenCalledWith('/auth/profile');
    expect(service.me()).toEqual(mockUser);
  });
});
