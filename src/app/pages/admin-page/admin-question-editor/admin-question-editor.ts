import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminQuiz } from '../../../models/quiz';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { ConfirmService } from '../../../services/confirm-service/confirm-service';
import { Question } from '../../../models/quiz';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';

@Component({
  selector: 'admin-question-editor',
  imports: [CommonModule, FormsModule, DurationPipe],
  templateUrl: './admin-question-editor.html',
})
export class AdminQuestionEditor {
  @Input() quiz: AdminQuiz | null = null
  @Input() saving: boolean = false;
  // question bank may be useful for creation or lookups; if needed it can be added as an Input

  constructor(private toastr: ToastrService) {}

  private confirm = inject(ConfirmService);

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
  @Output() questionEdited = new EventEmitter<number>();
  @Output() saveQuiz = new EventEmitter<AdminQuiz>();

  onSetCorrect(qi: number, oi: number) {
    this.setCorrect.emit({ qIndex: qi, optIndex: oi });
  }
  onRemoveOption(qi: number, oi: number) {
    this.removeOption.emit({ qIndex: qi, optIndex: oi });
  }

  onQuestionEdited(qIndex: number) {
    this.questionEdited.emit(qIndex);
  }

  onDeleteQuestion(qIndex: number) {
    const q = this.quiz?.questions?.[qIndex];
    const title = 'Delete question';
    const message = q?.text
      ? `Are you sure you want to delete this question: "${q.text.substring(0,60)}"?`
      : 'Are you sure you want to delete this question?';

    this.confirm.open({ title, message, confirmText: 'Delete', cancelText: 'Cancel' }).subscribe((ok: boolean) => {
      if (ok) this.removeQuestion.emit(qIndex);
    });
  }

  // helpers used by the template to avoid selecting empty option slots
  trim(value?: string): string {
    return value ? String(value).trim() : '';
  }
  
  optionHasText(option?: string): boolean {
    return this.trim(option).length > 0;
  }

  isCheckedOption(option: string | undefined, question: Question): boolean {
    return this.optionHasText(option) && this.trim(question.correctAnswer) === this.trim(option);
  }

  // Validate a single question
  validateQuestion(q: Question): string[] {
    const errors: string[] = [];
    const MAX_LEN = 255;
    if (!q.text || !q.text.trim()) errors.push('Question text is required.');
    else if (String(q.text).trim().length > MAX_LEN)
      errors.push(`Question text must be at most ${MAX_LEN} characters.`);

    // consider only non-empty options when validating presence
    const filledOptions = Array.isArray(q.options)
      ? q.options.map((o) => (o ? String(o).trim() : '')).filter((o) => o.length > 0)
      : [];

    if (filledOptions.length < 2) {
      errors.push('Each question must have at least 2 non-empty options.');
      // if we don't have two valid options, skip the correct-answer membership check
      return errors;
    }

    // validate option lengths
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    rawOptions.forEach((opt, i) => {
      const len = opt ? String(opt).trim().length : 0;
      if (len > MAX_LEN) errors.push(`Option ${i + 1} must be at most ${MAX_LEN} characters.`);
    });

    // if we have at least 2 options, ensure the correctAnswer is one of them (trimmed)
    const correct = q.correctAnswer ? String(q.correctAnswer).trim() : '';
    if (!correct || !filledOptions.includes(correct))
      errors.push('A correct option must be selected from the non-empty options.');

    return errors;
  }

  // Validate the currently selected quiz and its attached questions, then show toasts
  saveAll() {
    if (!this.quiz) return;
    // normalize inputs (trim strings) to avoid whitespace-only values causing validation failures
    this.quiz.questions = (this.quiz.questions || []).map((qq) => {
      qq.text = qq.text ? String(qq.text).trim() : '';
      qq.options = Array.isArray(qq.options)
        ? qq.options.map((o) => (o ? String(o).trim() : ''))
        : [];
      qq.correctAnswer = qq.correctAnswer ? String(qq.correctAnswer).trim() : '';
      return qq;
    });

    const allErrors: string[] = [];
    const qLimit = this.quiz.questionLimit;
    if (Array.isArray(this.quiz.questions) && this.quiz.questions.length < qLimit)
      allErrors.push('Number of attached questions is less than the question limit (this is the minimum number of questions required).');

    if (Array.isArray(this.quiz.questions)) {
      this.quiz.questions.forEach((q: Question, idx: number) => {
        const errs = this.validateQuestion(q);
        errs.forEach((e) => allErrors.push(`Q${idx + 1}: ${e}`));
      });
    }

    if (allErrors.length) {
      // log the normalized question objects to help debug unexpected validation failures
      try {
        // use a structured log to inspect values in the browser console
        console.groupCollapsed('Question validation failed');
        this.quiz.questions.forEach((q, i) => console.log(`Q${i + 1}:`, q));
        console.groupEnd();
      } catch (e) {
        console.warn('Failed to log questions for debug', e);
      }

      this.toastr.error('Validation errors:\n' + allErrors.join('\n'));
      console.warn('Validation errors', allErrors);
      return;
    }

    // emit the validated quiz so the parent can persist using QuizService
    this.saveQuiz.emit(this.quiz);
  }

  // computed property for template binding to disable the Save button when validation errors exist
  get hasValidationErrors(): boolean {
    if (!this.quiz) return true;
    const qLimit = Number(this.quiz.questionLimit);
    if (Array.isArray(this.quiz.questions) && this.quiz.questions.length < qLimit) return true;
    if (Array.isArray(this.quiz.questions)) {
      for (let i = 0; i < this.quiz.questions.length; i++) {
        const errs = this.validateQuestion(this.quiz.questions[i]);
        if (errs.length) return true;
      }
    }
    return false;
  }
}
