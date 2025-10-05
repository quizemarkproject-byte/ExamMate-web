import { Component } from '@angular/core';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { QuizResultResponse } from '../../../models/quiz';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user-service/user-service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-quiz-result-list',
  imports: [RouterModule, DecimalPipe, DatePipe],
  templateUrl: './result-list.html',
})
export class QuizResultList {
  quizResults: QuizResultResponse[] = [];
  userId: string = '';

  constructor(
    private quizService: QuizService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = this.userService.getUserId();
    this.getAllUserQuizResults();
  }

  getAllUserQuizResults() {
    this.quizService.getAllUserQuizResults(this.userId).subscribe({
      next: (data) => {
        this.quizResults = data;
      },
      error: (err) => {
        console.error('Error fetching all quiz results:', err);
      },
    });
  }
}
