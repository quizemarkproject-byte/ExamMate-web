import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CountResponse,
  Question,
  QuestionRequest,
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
  private quizSessionUrl = environment.backend_url + '/api/v1/quiz-sessions';

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.quizUrl);
  }

  createQuiz(quizRequest: QuizRequest): Observable<Quiz[]> {
    return this.http.post<Quiz[]>(this.quizUrl, quizRequest);
  }

  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.quizUrl}/${quizId}`);
  }

  getAllQuestions(): Observable<Question> {
    return this.http.get<Question>(`${this.quizUrl}/questions`);
  }

  createQuestions(quizId: string, questionRequest: QuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.quizUrl}/${quizId}/questions/bulk`, questionRequest);
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

  getUserResultsCount(userId: string): Observable<CountResponse> {
    return this.http.get<CountResponse>(
      `${this.quizSessionUrl}/results/${userId}/count`
    );
  }
}
