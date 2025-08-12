import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Quiz,
  QuizResultResponse,
  QuizSubmission,
  TimeRemainingResponse,
} from '../../models/quiz';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseUrl = environment.backend_url + '/api/v1/quiz';

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.baseUrl);
  }

  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/${quizId}`);
  }

  startQuiz(quizId: string, userId: string): Observable<Quiz> {
    return this.http.post<Quiz>(
      `${this.baseUrl}/${quizId}/${userId}/start`,
      {}
    );
  }

  submitQuiz(
    quizId: string,
    answers: QuizSubmission
  ): Observable<QuizResultResponse> {
    return this.http.post<QuizResultResponse>(
      `${this.baseUrl}/submit/${quizId}`,
      answers
    );
  }

  getRemainingTime(
    quizId: string,
    userId: string,
    quizSessionId: string
  ): Observable<TimeRemainingResponse> {
    return this.http.get<TimeRemainingResponse>(
      `${this.baseUrl}/${quizId}/${userId}/${quizSessionId}/time`
    );
  }

  getAllUserQuizResults(userId: string): Observable<QuizResultResponse[]> {
    return this.http.get<QuizResultResponse[]>(
      `${this.baseUrl}/result/user/${userId}`
    );
  }

  getUserQuizResult(
    resultId: string,
    userId: string
  ): Observable<QuizResultResponse> {
    return this.http.get<QuizResultResponse>(
      `${this.baseUrl}/result/${resultId}/user/${userId}`
    );
  }
}
