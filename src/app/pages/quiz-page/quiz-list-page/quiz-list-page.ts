import { Component } from '@angular/core';
import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-list-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-list-page.html',
})
export class QuizListPage {
  quizData: Quiz[] = [];
  loading: boolean = true;

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.getQuizzes();
  }

  getQuizzes() {
    this.loading = true;
    this.quizService.getQuizzes().subscribe({
      next: (data: Quiz[]) => {
        this.quizData = data;
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
}
