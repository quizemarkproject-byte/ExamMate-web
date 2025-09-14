import { Routes } from '@angular/router';
import { HomePage } from './page/home-page/home-page';
import { QuizResultPage } from './page/result-page/result-page/result-page';
import { QuizResultList } from './page/result-page/result-list/result-list';
import { QuizResultDetail } from './page/result-page/result-detail/result-detail';
import { QuizListPage } from './page/quiz-page/quiz-list-page/quiz-list-page';
import { QuizDetailPage } from './page/quiz-page/quiz-detail-page/quiz-detail-page';
import { QuizPage } from './page/quiz-page/quiz-page/quiz-page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    // component: HomePage,
    component: QuizListPage,
    title: 'ExamMate | Home',
  },
  {
    path: 'quiz/results',
    component: QuizResultPage,
    children: [
      {
        path: '',
        component: QuizResultList,
      },
      {
        path: ':resultId',
        component: QuizResultDetail,
      },
    ],
  },
  {
    path: 'quiz',
    component: QuizPage,
    title: 'ExamMate | Quiz',
    children: [
      {
        path: '',
        component: QuizListPage,
        title: 'ExamMate | Quiz',
      },
      {
        path: ':quizId',
        component: QuizDetailPage,
        title: 'ExamMate | Take Quiz',
      },
    ],
  },
];
