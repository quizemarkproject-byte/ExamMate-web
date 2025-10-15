import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizResultResponse } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { TokenService } from '../../../services/token-service/token-service';

@Component({
  selector: 'app-quiz-result-detail',
  imports: [DecimalPipe],
  templateUrl: './result-detail.html',
})
export class QuizResultDetail {
  resultId: string = '';
  userId: string = '';
  quizResult!: QuizResultResponse;

  constructor(
    private quizService: QuizService,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.userId = this.tokenService.getId();
    this.resultId = this.activatedRoute.snapshot.paramMap.get('resultId')!;
    if (this.resultId) {
      this.getUserQuizResult();
    }
  }

  getUserQuizResult() {
    this.quizService.getUserQuizResult(this.resultId, this.userId).subscribe({
      next: (data) => {
        this.quizResult = data;
      },
      error: (err) => {
        console.error('Error fetching quiz result:', err);
      },
    });
  }
}
