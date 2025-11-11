import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminQuiz,
  CountResponse,
  Question,
  Quiz,
  QuizRequest,
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
  private adminQuizUrl = environment.backend_url + '/api/v1/admin/quizzes';
  private quizSessionUrl = environment.backend_url + '/api/v1/quiz-sessions';

  constructor(private http: HttpClient) {}

  adminGetAllQuiz(): Observable<AdminQuiz[]> {
    return this.http.get<AdminQuiz[]>(this.adminQuizUrl);
  }

  adminCreateQuiz(quizRequest: QuizRequest): Observable<AdminQuiz> {
    return this.http.post<AdminQuiz>(this.adminQuizUrl, quizRequest);
  }

  adminGetAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.adminQuizUrl}/questions`);
  }

  adminCreateQuestions(
    quizId: string,
    questionRequest: Question
  ): Observable<Question> {
    return this.http.post<Question>(
      `${this.adminQuizUrl}/${quizId}/questions/bulk`,
      questionRequest
    );
  }

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.quizUrl);
  }

  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.quizUrl}/${quizId}`);
  }

  startQuiz(
    startRequest: QuizSessionStartRequest
  ): Observable<QuizSessionStartResponse> {
    return this.http.post<QuizSessionStartResponse>(
      `${this.quizSessionUrl}/start`,
      startRequest
    );
  }

  submitQuiz(quizSubmission: QuizSubmission): Observable<QuizResultResponse> {
    return this.http.post<QuizResultResponse>(
      `${this.quizSessionUrl}/submit`,
      quizSubmission
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

  getUserResultsCount(userId: string): Observable<CountResponse> {
    return this.http.get<CountResponse>(
      `${this.quizSessionUrl}/results/${userId}/count`
    );
  }
}
