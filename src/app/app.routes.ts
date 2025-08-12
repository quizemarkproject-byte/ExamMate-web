import { Routes } from '@angular/router';
import { HomePage } from './page/home-page/home-page';
import { QuizListPage } from './page/quiz-list-page/quiz-list-page';
import { QuizDetailPage } from './page/quiz-detail-page/quiz-detail-page';
import { QuizResultPage } from './page/result-page/quiz-result-page/quiz-result-page';
import { QuizResultList } from './page/result-page/quiz-result-list/quiz-result-list';
import { QuizResultDetail } from './page/result-page/quiz-result-detail/quiz-result-detail';

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
  path: 'quiz/results',
  component: QuizResultPage,
  children: [
    {
      path: '',
      component: QuizResultList
    },
    {
      path: ':resultId',
      component: QuizResultDetail
    }
  ]
},
  {
    path: 'quiz/:quizId',
    component: QuizDetailPage,
    title: 'ExamMate | Take Quiz',
  },
];
