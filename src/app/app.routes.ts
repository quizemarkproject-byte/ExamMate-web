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
import { authGuard } from './guards/auth-guard/auth-guard';
import { adminGuard } from './guards/admin-guard/admin-guard';

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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
    canActivate: [adminGuard],
  },
  {
    path: 'analytics',
    component: AnalyticsPage,
    title: 'ExamMate | Analytics',
    canActivate: [authGuard],
  }
];
