import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly USER_ID_KEY = 'app_user_id';

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (!token) return null;

    // Remove expired token proactively
    if (this.isTokenExpired(token)) {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      return null;
    }

    return token;
  }

  logout(): void {
    localStorage.clear();
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

  // Check token expiration using the standard JWT `exp` claim (seconds since epoch)
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true; // treat invalid tokens as expired
    const exp: number | undefined = payload.exp;
    if (!exp) return false; // no exp claim -> consider not expired
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return exp <= nowInSeconds;
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() != null;
  }

  getSub(): string {
    const payload = this.decodeToken(this.getAccessToken() || '');
    return payload?.sub || 'Guest';
  }

  getId(): string {
    const payload = this.decodeToken(this.getAccessToken() || '');
    return payload?.id || this.getUserId();
  }

  getRole(): string | null {
    const payload = this.decodeToken(this.getAccessToken() || '');
    return payload?.role || null;
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'ADMIN';
  }

  private getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);

    if (!userId) {
      userId = uuidv4();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }

    return userId;
  }
}
