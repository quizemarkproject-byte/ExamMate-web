import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AdminQuiz } from '../../models/quiz';
import { parseDurationToMinutes } from '../../utils/duration-utils';

@Component({
  selector: 'app-quiz-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-modal.html',
  standalone: true,
})
export class QuizModal {
  private fb = inject(FormBuilder);
  
  isOpen = false;
  isEditMode = false;
  quizForm!: FormGroup;
  
  private result$ = new Subject<AdminQuiz | null>();

  open(quiz?: AdminQuiz) {
    this.isEditMode = !!quiz;
    this.isOpen = true;
    
    this.quizForm = this.fb.group({
      id: [quiz?.id || null],
      name: [quiz?.name || '', [Validators.required, Validators.minLength(1)]],
      timeLimit: [quiz?.timeLimit ? parseDurationToMinutes(quiz.timeLimit) : 10, [Validators.required, Validators.min(1)]],
      questionLimit: [quiz?.questionLimit || 10, [Validators.required, Validators.min(2)]],
    });

    return this.result$.asObservable();
  }

  close() {
    this.isOpen = false;
    this.result$.next(null);
  }

  save() {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    const formValue = this.quizForm.value;
    const quiz: Partial<AdminQuiz> = {
      id: formValue.id,
      name: formValue.name.trim(),
      timeLimit: String(formValue.timeLimit),
      questionLimit: Number(formValue.questionLimit),
    };

    this.isOpen = false;
    this.result$.next(quiz as AdminQuiz);
  }

  get nameControl() {
    return this.quizForm?.get('name');
  }

  get timeLimitControl() {
    return this.quizForm?.get('timeLimit');
  }

  get questionLimitControl() {
    return this.quizForm?.get('questionLimit');
  }
}
