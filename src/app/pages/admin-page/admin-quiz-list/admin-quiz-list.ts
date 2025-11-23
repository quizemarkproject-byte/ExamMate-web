import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ConfirmService } from '../../../services/confirm-service/confirm-service';
import { CommonModule } from '@angular/common';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';
import { AdminQuiz } from '../../../models/quiz';

@Component({
  selector: 'admin-quiz-list',
  imports: [CommonModule, DurationPipe],
  templateUrl: './admin-quiz-list.html',
})
export class AdminQuizList {
  @Input() quizzes: AdminQuiz[] = [];
  @Input() selectedIndex: number | null = null;

  @Output() createQuiz = new EventEmitter<void>();
  @Output() selectQuiz = new EventEmitter<number>();
  @Output() deleteQuiz = new EventEmitter<number>();
  @Output() editQuiz = new EventEmitter<number>();
  private confirm = inject(ConfirmService);

  onDelete(i: number) {
    const quiz = this.quizzes[i];
    if (!quiz) return;

    const title = 'Delete quiz';
    const message = quiz.name
      ? `Are you sure you want to delete the quiz "${quiz.name}"? This action cannot be undone.`
      : 'Are you sure you want to delete this quiz?';

    this.confirm
      .open({ title, message, confirmText: 'Delete', cancelText: 'Cancel' })
      .subscribe((ok: boolean) => {
        if (ok) this.deleteQuiz.emit(i);
      });
  }
}
