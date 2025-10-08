import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailRequest, LoginRequest, LoginResponse, ResetPasswordRequest, SignupRequest } from '../../models/auth';

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

  verifyEmail(token: string): Observable<void> {
    console.log('Verifying email with token:', token); 
    console.log('Verification URL:', `${this.authUrl}/verify-email?token=${token}`);
    return this.http.get<void>(`${this.authUrl}/verify-email?token=${token}`);
  }

}
