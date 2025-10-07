import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailRequest, LoginRequest, LoginResponse, ResetPasswordRequest, SignupRequest, TokenRequest } from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private authUrl = environment.backend_url + '/api/v1/auth';

  signup(signupRequest: SignupRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/signup`, signupRequest);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, loginRequest);
  }

  forgotPassword(emailRequest: EmailRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/forgot-password`, emailRequest);
  }

  resetPassword(ResetPasswordRequest: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/reset-password`, ResetPasswordRequest);
  }

  verifyEmail(tokenRequest: TokenRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/verify-email`, tokenRequest);
  }
}
