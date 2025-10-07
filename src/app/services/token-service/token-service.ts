import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  decodeToken(token: string): any {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  getSub(): string | null {
    const payload = this.decodeToken(this.getAccessToken() || '');
    return payload?.sub || null;
  }

  getId(): string | null {
    const payload = this.decodeToken(this.getAccessToken() || '');
    return payload?.id || null;
  }

  getRole(): string | null {
    const payload = this.decodeToken(this.getAccessToken() || '');
    return payload?.role || null;
  }
}
