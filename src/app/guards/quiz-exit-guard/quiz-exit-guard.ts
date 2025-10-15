import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuizDetailPage } from '../../pages/quiz-page/quiz-detail-page/quiz-detail-page';
import { ConfirmService } from '../../services/confirm-service/confirm-service';

@Injectable({ providedIn: 'root' })
export class QuizExitGuard implements CanDeactivate<QuizDetailPage> {
  constructor(private confirm: ConfirmService) {}

  canDeactivate(component: QuizDetailPage): boolean | Observable<boolean> {
    // If there's no quiz loaded or it's already submitted, allow navigation
    if (!component.quizData || component.quizSubmissionResult) {
      return true;
    }

    // If a submission is already in progress, ensure we auto-navigate when it completes
    if (component.submittingQuiz) {
      component.autoNavigateOnSubmit = true;
      return false;
    }

    return this.confirm
      .open({
        title: 'Submit and leave',
        message: 'Are you sure you want to leave? Confirming will submit your quiz and take you to the results page.',
        confirmText: 'Yes, submit',
        cancelText: 'Stay',
      })
      .pipe(
        map((confirmed) => {
          if (confirmed) {
            component.autoNavigateOnSubmit = true;
            component.submitQuiz();
            return false; // block navigation; component will auto-navigate after submit
          }
          return false; // canceled -> stay on page
        })
      );
  }
}
