import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminQuiz } from '../../../models/quiz';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { Question } from '../../../models/quiz';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';

@Component({
  selector: 'admin-question-editor',
  imports: [CommonModule, FormsModule, DurationPipe],
  templateUrl: './admin-question-editor.html',
})
export class AdminQuestionEditor {
  @Input() quiz: AdminQuiz | null = null
  // question bank may be useful for creation or lookups; if needed it can be added as an Input

  constructor(private toastr: ToastrService) {}

  @Output() addQuestion = new EventEmitter<void>();
  @Output() removeQuestion = new EventEmitter<number>();
  @Output() addOption = new EventEmitter<number>();
  @Output() removeOption = new EventEmitter<{
    qIndex: number;
    optIndex: number;
  }>();
  @Output() setCorrect = new EventEmitter<{
    qIndex: number;
    optIndex: number;
  }>();

  onSetCorrect(qi: number, oi: number) {
    this.setCorrect.emit({ qIndex: qi, optIndex: oi });
  }
  onRemoveOption(qi: number, oi: number) {
    this.removeOption.emit({ qIndex: qi, optIndex: oi });
  }

  // Validate a single question
  validateQuestion(q: Question): string[] {
    const errors: string[] = [];
    if (!q.text || !q.text.trim()) errors.push('Question text is required.');
    if (!Array.isArray(q.options) || q.options.length < 2)
      errors.push('Each question must have at least 2 options.');
    else {
      q.options.forEach((opt: string, idx: number) => {
        if (!opt || !opt.trim()) errors.push(`Option ${idx + 1} cannot be empty.`);
      });
    }
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer))
      errors.push('A correct option must be selected.');
    return errors;
  }

  // Validate the currently selected quiz and its attached questions, then show toasts
  saveAll() {
    if (!this.quiz) return;
    const allErrors: string[] = [];
    const qLimit = Number(this.quiz.questionLimit);
    if (Array.isArray(this.quiz.questions) && this.quiz.questions.length < qLimit)
      allErrors.push('Number of attached questions is less than the question limit (this is the minimum number of questions required).');

    if (Array.isArray(this.quiz.questions)) {
      this.quiz.questions.forEach((q: Question, idx: number) => {
        const errs = this.validateQuestion(q);
        errs.forEach((e) => allErrors.push(`Q${idx + 1}: ${e}`));
      });
    }

    if (allErrors.length) {
      this.toastr.error('Validation errors:\n' + allErrors.join('\n'));
      console.warn('Validation errors', allErrors);
      return;
    }

    // Placeholder: persistence will be implemented later. For now just acknowledge success.
    console.log('Quiz validated', this.quiz);
    this.toastr.success('Quiz validated (local only).');
  }
}
