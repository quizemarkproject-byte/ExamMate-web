import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { QuizDetailPage } from './pages/quiz-page/quiz-detail-page/quiz-detail-page';
import { QuizListPage } from './pages/quiz-page/quiz-list-page/quiz-list-page';
import { QuizPage } from './pages/quiz-page/quiz-page/quiz-page';
import { QuizResultDetail } from './pages/quiz-page/result-detail/result-detail';
import { QuizResultList } from './pages/quiz-page/result-list/result-list';
import { QuizExitGuard } from './guards/quiz-exit-guard/quiz-exit-guard';
import { AdminPage } from './pages/admin-page/admin-page/admin-page';
import { AnalyticsPage } from './pages/analytics-page/analytics-page';

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
    path: 'result',
    component: QuizPage,
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
        canDeactivate: [QuizExitGuard],
        title: 'ExamMate | Take Quiz',
      },
    ],
  }
  ,
  {
    path: 'admin',
    component: AdminPage,
    title: 'ExamMate | Admin',
  },
  {
    path: 'analytics',
    component: AnalyticsPage,
    title: 'ExamMate | Admin Analytics',
  }
];
