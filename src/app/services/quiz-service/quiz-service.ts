import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Quiz,
  QuizResultResponse,
  QuizSessionStartRequest,
  QuizSessionStartResponse,
  QuizSubmission,
} from '../../models/quiz';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private quizUrl = environment.backend_url + '/api/v1/quizzes';
  private quizSessionUrl = environment.backend_url + '/api/v1/quiz-sessions';

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.quizUrl);
  }

  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.quizUrl}/${quizId}`);
  }

  startQuiz(startRequest: QuizSessionStartRequest): Observable<QuizSessionStartResponse> {
    return this.http.post<QuizSessionStartResponse>(
      `${this.quizSessionUrl}/start`, startRequest
    );
  }

  submitQuiz(
    quizSubmission: QuizSubmission
  ): Observable<QuizResultResponse> {
    return this.http.post<QuizResultResponse>(
      `${this.quizSessionUrl}/submit`, quizSubmission
    );
  }

  getAllUserQuizResults(userId: string): Observable<QuizResultResponse[]> {
    return this.http.get<QuizResultResponse[]>(
      `${this.quizSessionUrl}/results/${userId}`
    );
  }

  getUserQuizResult(
    resultId: string,
    userId: string
  ): Observable<QuizResultResponse> {
    return this.http.get<QuizResultResponse>(
      `${this.quizSessionUrl}/result/${resultId}/user/${userId}`
    );
  }
}
