import {CommonModule, DecimalPipe} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { QuizResultResponse } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { TokenService } from '../../../services/token-service/token-service';

@Component({
  selector: 'app-quiz-result-detail',
  imports: [DecimalPipe, CommonModule, RouterLink],
  templateUrl: './result-detail.html',
})
export class QuizResultDetail implements OnInit {
  resultId: string = '';
  userId: string = '';
  quizResult!: QuizResultResponse;
  loading: boolean = false;

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
    this.loading = true;
    this.quizService.getUserQuizResult(this.resultId, this.userId).subscribe({
      next: (data) => {
        this.quizResult = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching quiz result:', err);
        this.loading = false;
      },
    });
  }
}
