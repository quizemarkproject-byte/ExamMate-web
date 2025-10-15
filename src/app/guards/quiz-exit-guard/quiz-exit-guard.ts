import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { QuizDetailPage } from '../../pages/quiz-page/quiz-detail-page/quiz-detail-page';

@Injectable({ providedIn: 'root' })
export class QuizExitGuard implements CanDeactivate<QuizDetailPage> {
  canDeactivate(component: QuizDetailPage): boolean {
    // If there's no quiz loaded or it's already submitted, allow navigation
    if (!component.quizData || component.quizSubmissionResult) {
      return true;
    }

    // If a submission is already in progress, block until it finishes
    if (component.submittingQuiz) {
      return false;
    }

    const confirmLeave = window.confirm(
      'Are you sure you want to leave? Confirming will submit your quiz.'
    );

    if (confirmLeave) {
      // Submit the quiz and block navigation; user will remain to see the result
      component.submitQuiz();
      return false;
    }

    // Cancel navigation
    return false;
  }
}

