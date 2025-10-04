import { Component } from '@angular/core';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { ActivatedRoute } from '@angular/router';
import { QuizResultResponse } from '../../../models/quiz';
import { UserService } from '../../../services/user-service/user-service';
import { DecimalPipe } from '@angular/common';

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
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = this.userService.getUserId();
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
