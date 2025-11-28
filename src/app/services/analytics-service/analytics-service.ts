import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AnalyticsResponse } from '../../models/analytics';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private adminAnalyticsUrl = environment.backend_url + '/api/v1/admin/analytics';
private userAnalyticsUrl = environment.backend_url + '/api/v1/user/analytics';
  
  constructor(private http: HttpClient) {}

  adminQuizAnalytics(quizId: string): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.adminAnalyticsUrl}/quizzes/${quizId}`);
  }

  adminUserAnalytics(userId: string): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.adminAnalyticsUrl}/users/${userId}`);
  }

  userAnalytics(userId: string): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.userAnalyticsUrl}/${userId}`);
  }
  
  userAnalyticsByQuiz(userId:string,quizId: string): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.userAnalyticsUrl}/${userId}/quiz/${quizId}`);
  }
}
