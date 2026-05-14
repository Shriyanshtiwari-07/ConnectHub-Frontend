import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: this.toParams(params),
    });
  }

  post<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body ?? {}, {
      params: this.toParams(params),
    });
  }

  put<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body ?? {}, {
      params: this.toParams(params),
    });
  }

  patch<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body ?? {}, {
      params: this.toParams(params),
    });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }

  private toParams(
    params?: Record<string, string | number | boolean | undefined | null>,
  ): HttpParams | undefined {
    if (!params) return undefined;
    let hp = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      hp = hp.set(k, String(v));
    }
    return hp;
  }
}

