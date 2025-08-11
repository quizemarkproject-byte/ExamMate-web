import { Routes } from '@angular/router';
import { HomePage } from './page/home-page/home-page';
import { QuizListPage } from './page/quiz-list-page/quiz-list-page';
import { QuizDetailPage } from './page/quiz-detail-page/quiz-detail-page';
import { QuizResultPage } from './page/quiz-result-page/quiz-result-page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePage,
    title: 'ExamMate | Home',
  },
  {
    path: 'quiz',
    component: QuizListPage,
    title: 'ExamMate | Quiz',
  },
  {
    path: 'quiz/:quizId',
    component: QuizDetailPage,
    title: 'ExamMate | Take Quiz',
  },
  {
    path: 'quiz/results/:quizId',
    component: QuizResultPage,
    title: 'ExamMate | Take Quiz',
  },
];
