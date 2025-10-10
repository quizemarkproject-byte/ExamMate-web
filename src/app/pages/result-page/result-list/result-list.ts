import { DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuizResultResponse } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { TokenService } from '../../../services/token-service/token-service';

@Component({
  selector: 'app-quiz-result-list',
  imports: [RouterModule, DecimalPipe, DatePipe],
  templateUrl: './result-list.html',
})
export class QuizResultList {
  quizResults: QuizResultResponse[] = [];
  userId: string = '';
  loading: boolean = false;

  constructor(
    private quizService: QuizService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.userId = this.tokenService.getId();
    this.getAllUserQuizResults();
  }

  getAllUserQuizResults() {
    this.loading = true;
    this.quizService.getAllUserQuizResults(this.userId).subscribe({
      next: (data) => {
        this.quizResults = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching all quiz results:', err);
        this.loading = false;
      },
    });
  }
}
