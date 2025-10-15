import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailRequest, TokenResponse, VerityOtpRequest } from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private authUrl = environment.backend_url + '/api/v1/auth';

  login(emailRequest: EmailRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/request-otp`, emailRequest);
  }
  verifyEmail(verityOtpRequest: VerityOtpRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.authUrl}/verify-otp`, verityOtpRequest);
  }

}
