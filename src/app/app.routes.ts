import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { SignupPage } from './pages/signup-page/signup-page';
import { HomePage } from './pages/home-page/home-page';
import { QuizDetailPage } from './pages/quiz-page/quiz-detail-page/quiz-detail-page';
import { QuizListPage } from './pages/quiz-page/quiz-list-page/quiz-list-page';
import { QuizPage } from './pages/quiz-page/quiz-page/quiz-page';
import { QuizResultDetail } from './pages/result-page/result-detail/result-detail';
import { QuizResultList } from './pages/result-page/result-list/result-list';
import { QuizResultPage } from './pages/result-page/result-page/result-page';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { VerificationPage } from './pages/verification-page/verification-page';
import { reverseAuthGuard } from './guards/reverse-auth/reverse-auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
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
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: LoginPage,
        title: 'ExamMate | Login',
        canActivate: [reverseAuthGuard]
      },
      {
        path: 'signup',
        component: SignupPage,
        title: 'ExamMate | Signup',
        canActivate: [reverseAuthGuard]
      },
    {
      path: 'verify-email',
      component: VerificationPage,
      title: 'ExamMate | Verify Email',
    },
    ],
  },
];
