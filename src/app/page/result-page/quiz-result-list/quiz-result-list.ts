import { Component } from '@angular/core';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { QuizResultResponse } from '../../../models/quiz';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz-result-list',
  imports: [RouterModule],
  templateUrl: './quiz-result-list.html',
  styleUrl: './quiz-result-list.css'
})
export class QuizResultList {
  quizResults: QuizResultResponse[] = [];
  userId: string = 'user1';

  constructor(
    private quizService: QuizService) {}

    ngOnInit() {
      this.getAllUserQuizResults();
    }

  getAllUserQuizResults() {
    this.quizService.getAllUserQuizResults(this.userId).subscribe({
      next: (data) => {
        this.quizResults = data;
      },
      error: (err) => {
        console.error('Error fetching all quiz results:', err);
      }
    });
  }

}
