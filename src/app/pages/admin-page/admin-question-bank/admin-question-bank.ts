import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/quiz';
import { ConfirmService } from '../../../services/confirm-service/confirm-service';
import { EditQuestionService } from '../../../services/edit-question-service/edit-question-service';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { ToastrService } from '../../../services/toastr-service/toastr-service';

@Component({
  selector: 'admin-question-bank',
  imports: [CommonModule],
  templateUrl: './admin-question-bank.html',
})
export class AdminQuestionBank {
  @Input() questionBank: Question[] = [];
  @Input() selectedQuizIndex: number | null = null;

  @Output() attachQuestion = new EventEmitter<number>();
  @Output() createBankQuestion = new EventEmitter<void>();
  @Output() editQuestion = new EventEmitter<number>();
  @Output() deleteQuestion = new EventEmitter<number>();

  private confirm = inject(ConfirmService);
  private editService = inject(EditQuestionService);
  private quizService = inject(QuizService);
  private toastr = inject(ToastrService);

  onDelete(bi: number) {
    const q = this.questionBank[bi];
    if (!q) return;

    const title = 'Delete question';
    const message = q.text
      ? `Are you sure you want to delete this question: "${q.text.substring(0,60)}"?`
      : 'Are you sure you want to delete this question?';

    this.confirm.open({ title, message, confirmText: 'Delete', cancelText: 'Cancel' }).subscribe((ok: boolean) => {
      if (ok) this.deleteQuestion.emit(bi);
    });
  }

  onEdit(bi: number) {
    const q = this.questionBank[bi];
    if (!q) return;

    this.editService.open(q).subscribe((updated) => {
      if (!updated) return;

      // If the question exists on the server (has an id), persist update
      if (updated.id) {
        this.quizService.adminUpdateQuestion(String(updated.id), updated).subscribe({
          next: (serverQ) => {
            Object.assign(this.questionBank[bi], serverQ);
            this.editQuestion.emit(bi);
            this.toastr.success('Question updated.');
          },
          error: () => {
            this.toastr.error('Failed to update question.');
          },
        });
      } else {
        // Apply locally for new/unpersisted questions
        Object.assign(this.questionBank[bi], updated);
        this.editQuestion.emit(bi);
      }
    });
  }
}
