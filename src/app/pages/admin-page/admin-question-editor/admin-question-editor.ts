import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AdminQuiz } from '../../../models/quiz';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { ConfirmService } from '../../../services/confirm-service/confirm-service';
import { Question } from '../../../models/quiz';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'admin-question-editor',
  imports: [CommonModule, ReactiveFormsModule, DurationPipe],
  templateUrl: './admin-question-editor.html',
})
export class AdminQuestionEditor implements OnChanges, OnDestroy {
  @Input() quiz: AdminQuiz | null = null
  @Input() saving: boolean = false;

  quizForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private confirm = inject(ConfirmService);
  private lastQuizId: string | number | null = null;

  @Output() saveQuiz = new EventEmitter<AdminQuiz>();
  @Output() validationErrors = new EventEmitter<string[]>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reinitialize form whenever quiz input changes
    if (changes['quiz']) {
      const currentQuizId = this.quiz?.id || null;
      // Always rebuild if quiz changed, or if it's a different ID
      if (changes['quiz'].firstChange || currentQuizId !== this.lastQuizId) {
        this.lastQuizId = currentQuizId;
        this.initializeForm();
      }
    }
  }

  // Public method to force form refresh when questions are modified externally
  refreshForm() {
    this.initializeForm();
  }

  // Public method to update validators when quiz metadata changes (like questionLimit)
  updateValidators() {
    if (this.questionsArray) {
      this.questionsArray.updateValueAndValidity();
      this.emitValidationErrors();
    }
  }

  private initializeForm() {
    // Clear previous subscriptions by triggering destroy and recreating
    if (this.quizForm) {
      this.destroy$.next();
    }

    if (!this.quiz) {
      this.quizForm = this.fb.group({
        questions: this.fb.array([])
      });
      this.validationErrors.emit([]);
      return;
    }

    const questionsArray = this.fb.array(
      (this.quiz.questions || []).map(q => this.createQuestionGroup(q)),
      [this.minQuestionsValidator(this.quiz.questionLimit)]
    );

    this.quizForm = this.fb.group({
      questions: questionsArray
    });

    // Subscribe to form value changes for real-time validation
    this.quizForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.emitValidationErrors());

    // Emit initial validation state after a brief delay to ensure form is ready
    setTimeout(() => this.emitValidationErrors(), 0);
  }

  private createQuestionGroup(question: Question): FormGroup {
    const optionsArray = this.fb.array(
      (question.options || []).map(opt => this.fb.control(opt || '', Validators.required)),
      [Validators.minLength(2)]
    );

    return this.fb.group({
      id: [question.id || null],
      text: [question.text || '', [Validators.required, this.trimValidator()]],
      options: optionsArray,
      correctAnswer: [question.correctAnswer || '', [Validators.required, this.trimValidator()]]
    }, { validators: this.questionValidator() });
  }

  // Custom validator to ensure trimmed value is not empty
  private trimValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && typeof value === 'string' && value.trim().length === 0) {
        return { whitespace: true };
      }
      return null;
    };
  }

  // Custom validator for question group
  private questionValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const fg = group as FormGroup;
      const correctAnswer = fg.get('correctAnswer')?.value?.trim();
      const options = (fg.get('options') as FormArray)?.value || [];
      const validOptions = options.filter((o: string) => o && o.trim().length > 0);

      if (correctAnswer && !validOptions.some((o: string) => o.trim() === correctAnswer)) {
        return { correctAnswerNotInOptions: true };
      }

      if (validOptions.length < 2) {
        return { minOptions: true };
      }

      return null;
    };
  }

  // Custom validator for minimum questions - always checks current quiz's questionLimit
  private minQuestionsValidator(minCount: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control as FormArray;
      // Use current quiz's questionLimit, fallback to initial minCount
      const requiredCount = this.quiz?.questionLimit || minCount;
      if (array.length < requiredCount) {
        return { minQuestions: { required: requiredCount, actual: array.length } };
      }
      return null;
    };
  }

  private emitValidationErrors() {
    const errors: string[] = [];

    // Check for minQuestions error on the FormArray
    if (this.questionsArray.hasError('minQuestions')) {
      const err = this.questionsArray.getError('minQuestions');
      errors.push(
        `Number of attached questions (${err.actual}) is less than the question limit (${err.required}).`
      );
    }

    this.questionsArray.controls.forEach((control, idx) => {
      const qErrors = this.getQuestionErrors(control as FormGroup, idx + 1);
      errors.push(...qErrors);
    });

    this.validationErrors.emit(errors);
  }

  private getQuestionErrors(questionGroup: FormGroup, qNum: number): string[] {
    const errors: string[] = [];

    if (questionGroup.hasError('minOptions')) {
      errors.push(`Q${qNum}: Must have at least 2 options.`);
    }

    if (questionGroup.hasError('correctAnswerNotInOptions')) {
      errors.push(`Q${qNum}: Correct answer must match one of the options.`);
    }

    const textControl = questionGroup.get('text');
    if (textControl?.hasError('required') || textControl?.hasError('whitespace')) {
      errors.push(`Q${qNum}: Question text is required.`);
    }

    const correctControl = questionGroup.get('correctAnswer');
    if (correctControl?.hasError('required') || correctControl?.hasError('whitespace')) {
      errors.push(`Q${qNum}: Correct answer is required.`);
    }

    return errors;
  }

  get questionsArray(): FormArray {
    return this.quizForm?.get('questions') as FormArray;
  }

  getQuestionGroup(index: number): FormGroup {
    return this.questionsArray.at(index) as FormGroup;
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.getQuestionGroup(questionIndex).get('options') as FormArray;
  }

  onAddQuestion() {
    if (!this.quiz) return;
    
    const newQuestion: Question = {
      text: '',
      options: ['', ''],
      correctAnswer: '',
    } as Question;
    
    // Add to form array
    this.questionsArray.push(this.createQuestionGroup(newQuestion));
  }

  onAddOption(questionIndex: number) {
    const optionsArray = this.getOptionsArray(questionIndex);
    optionsArray.push(this.fb.control('', Validators.required));
  }

  onRemoveOption(qi: number, oi: number) {
    const optionsArray = this.getOptionsArray(qi);
    if (optionsArray.length <= 2) {
      this.toastr.warning('Each question must have at least 2 options.');
      return;
    }
    
    const removedValue = optionsArray.at(oi).value;
    optionsArray.removeAt(oi);
    
    // If removed option was the correct answer, clear it
    const correctAnswer = this.getQuestionGroup(qi).get('correctAnswer')?.value;
    if (correctAnswer === removedValue) {
      this.getQuestionGroup(qi).get('correctAnswer')?.setValue('');
    }
  }

  onSetCorrect(qi: number, oi: number) {
    const optionsArray = this.getOptionsArray(qi);
    const option = optionsArray.at(oi).value?.trim();
    
    if (!option) return;
    
    this.getQuestionGroup(qi).get('correctAnswer')?.setValue(option);
  }

  onDeleteQuestion(qIndex: number) {
    const questionGroup = this.getQuestionGroup(qIndex);
    const text = questionGroup.get('text')?.value;
    const title = 'Delete question';
    const message = text
      ? `Are you sure you want to delete this question: "${text.substring(0,60)}"?`
      : 'Are you sure you want to delete this question?';

    this.confirm.open({ title, message, confirmText: 'Delete', cancelText: 'Cancel' }).subscribe((ok: boolean) => {
      if (ok) {
        this.questionsArray.removeAt(qIndex);
      }
    });
  }

  // Helper to check if option has text
  optionHasText(option?: string): boolean {
    return option ? option.trim().length > 0 : false;
  }

  // Helper to check if option is selected as correct answer
  isCheckedOption(option: string | undefined, questionIndex: number): boolean {
    if (!option || !this.optionHasText(option)) return false;
    const correctAnswer = this.getQuestionGroup(questionIndex).get('correctAnswer')?.value;
    return option.trim() === correctAnswer?.trim();
  }

  saveAll() {
    if (!this.quiz || !this.quizForm) return;

    this.quizForm.markAllAsTouched();

    if (this.quizForm.invalid) {
      this.toastr.error('Please fix validation errors before saving.');
      return;
    }

    // Sync form values back to quiz object with trimmed values
    const formValue = this.quizForm.value;
    this.quiz.questions = formValue.questions.map((q: any) => ({
      id: q.id,
      text: q.text?.trim() || '',
      options: (q.options || []).map((o: string) => o?.trim() || ''),
      correctAnswer: q.correctAnswer?.trim() || ''
    }));

    this.saveQuiz.emit(this.quiz);
  }

  get hasValidationErrors(): boolean {
    return !this.quizForm || this.quizForm.invalid;
  }
}
