import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { EditQuestionService } from '../../services/edit-question-service/edit-question-service';
import { Question } from '../../models/quiz';

@Component({
  selector: 'app-question-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question-modal.html',
})
export class QuestionModal {
  private service = inject(EditQuestionService);

  state$ = this.service.edit$;

  // reactive form
  form: FormGroup | null = null;
  isCreate: boolean = false;
  private readonly MAX_LEN = 255;
  private fb = inject(FormBuilder);

  constructor() {
    // subscribe to service to update working copy when modal opens
    this.service.edit$.subscribe((s) => {
      if (s.open) {
        const q = s.question
          ? (s.question as Question)
          : ({ text: '', options: ['', ''], correctAnswer: null } as unknown as Question);
        this.isCreate = !s.question;
        this.form = this.buildForm(q);
      } else {
        this.form = null;
        this.isCreate = false;
      }
    });
  }

  private buildForm(q: Question): FormGroup {
    const opts = Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', ''];
    const controls = opts.map((o) => this.fb.control(o, [Validators.required, Validators.maxLength(this.MAX_LEN)]));
    const form = this.fb.group({
      text: [q.text || '', [Validators.required, Validators.maxLength(this.MAX_LEN)]],
      options: this.fb.array(controls),
      correctAnswer: [q.correctAnswer != null && q.correctAnswer !== '' ? q.correctAnswer : null, Validators.required],
    });

    // concise validator: at least 2 non-empty options and correctAnswer must be one of them
    form.setValidators((fg: AbstractControl) => {
      const group = fg as FormGroup;
      const arr = group.get('options') as FormArray;
      const filled = arr.controls
        .map((c) => (c.value ? String(c.value).trim() : ''))
        .filter((v) => v.length > 0);
      const correct = group.get('correctAnswer')?.value ? String(group.get('correctAnswer')?.value).trim() : '';
      if (filled.length < 2) return { minOptions: true };
      if (!correct || !filled.includes(correct)) return { correctNotInOptions: true };
      return null;
    });

    return form;
  }

  get options(): FormArray {
    return (this.form?.get('options') as FormArray) || (this.fb.array([]) as FormArray);
  }
  

  // helper: text control errors as strings for template
  get textErrors(): string[] {
    if (!this.form) return [];
    const tc = this.form.get('text');
    if (!tc || !tc.errors) return [];
    const e = tc.errors as any;
    const arr: string[] = [];
    if (e.required) arr.push('Question text is required.');
    if (e.maxlength) arr.push(`Question text must be at most ${this.MAX_LEN} characters.`);
    return arr;
  }

  // helper: group-level option errors
  get optionsGroupErrors(): string[] {
    if (!this.form || !this.form.errors) return [];
    const fe = this.form.errors as any;
    const arr: string[] = [];
    if (fe['minOptions']) arr.push('At least 2 non-empty options are required.');
    if (fe['correctNotInOptions']) arr.push('A correct answer must be selected from the non-empty options.');
    return arr;
  }

  // helper: per-option control errors
  optionErrorsAt(i: number): string[] {
    const opts = this.options;
    const c = opts.at(i);
    if (!c || !c.errors) return [];
    const e = c.errors as any;
    const arr: string[] = [];
    // show required only when control/form has been touched
    if (e.required && (c.touched || (this.form && this.form.touched))) {
      arr.push('Option is required.');
    }
    // maxlength from control validators
    if (e.maxlength) arr.push(`Option must be at most ${this.MAX_LEN} characters.`);
    return arr;
  }

  // aggregate all per-option errors into a single array with indices
  optionErrorsAll(): string[] {
    const opts = this.options;
    const msgs: string[] = [];
    for (let i = 0; i < opts.length; i++) {
      const es = this.optionErrorsAt(i);
      es.forEach((m) => msgs.push(`Option ${i + 1}: ${m}`));
    }
    return msgs;
  }


  addOption() {
    if (!this.form) return;
    const ctrl = this.fb.control('', [Validators.required, Validators.maxLength(this.MAX_LEN)]);
    this.options.push(ctrl);
    // ensure the new control's validators are active and form-level validators re-run
    ctrl.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  removeOption(i: number) {
    if (!this.form) return;
    const opts = this.options;
    if (opts.length <= 2) return;
    const removedValue = String(opts.at(i)?.value || '');
    opts.removeAt(i);
    const correctCtrl = this.form.get('correctAnswer');
    if (correctCtrl && correctCtrl.value === removedValue) {
      const first = opts.controls.map((c) => String(c.value || '')).find((v) => v.trim().length > 0) || '';
      correctCtrl.setValue(first);
    }
    // re-evaluate validators after removal
    this.form.updateValueAndValidity();
  }

  confirm() {
    if (!this.form) return this.service.confirm(null);
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }

    // build Question from form
    const value = this.form.value as { text: string; options: string[]; correctAnswer: string };
    const question: Question = {
      text: value.text.trim(),
      options: value.options.map((o) => (o ? String(o).trim() : '')),
      correctAnswer: value.correctAnswer ? String(value.correctAnswer).trim() : '',
    } as Question;

    this.service.confirm(question);
    this.form = null;
  }

  cancel() {
    this.service.cancel();
    this.form = null;
  }
}
