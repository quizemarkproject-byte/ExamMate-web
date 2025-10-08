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
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
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

  isLoggedIn(): boolean {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) != null;
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

  private getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);

    if (!userId) {
      userId = uuidv4();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }

    return userId;
  }
}
