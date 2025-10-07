import { Routes } from '@angular/router';
import { LoginPage } from './page/login-page/login-page';
import { SignupPage } from './page/signup-page/signup-page';
import { HomePage } from './page/home-page/home-page';
import { QuizDetailPage } from './page/quiz-page/quiz-detail-page/quiz-detail-page';
import { QuizListPage } from './page/quiz-page/quiz-list-page/quiz-list-page';
import { QuizPage } from './page/quiz-page/quiz-page/quiz-page';
import { QuizResultDetail } from './page/result-page/result-detail/result-detail';
import { QuizResultList } from './page/result-page/result-list/result-list';
import { QuizResultPage } from './page/result-page/result-page/result-page';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

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
      },
      {
        path: 'signup',
        component: SignupPage,
        title: 'ExamMate | Signup',
      },
    ],
  },
];
