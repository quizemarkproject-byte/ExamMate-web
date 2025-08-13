import { Component } from '@angular/core';
import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';
import { Footer } from '../../../components/footer/footer';

@Component({
  selector: 'app-quiz-list-page',
  imports: [CommonModule, RouterLink, DurationPipe, Footer],
  templateUrl: './quiz-list-page.html'
})
export class QuizListPage {
  quizData: Quiz[] | null = null;
  loading = false;

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.quizService.getQuizzes().subscribe({
      next: (data: Quiz[]) => {
        this.quizData = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

}
