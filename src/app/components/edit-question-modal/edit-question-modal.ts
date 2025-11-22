import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditQuestionService } from '../../services/edit-question-service/edit-question-service';
import { Question } from '../../models/quiz';

@Component({
  selector: 'app-edit-question-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-question-modal.html',
})
export class EditQuestionModal {
  private service = inject(EditQuestionService);

  state$ = this.service.edit$;

  // local form model
  working: Question | null = null;

  constructor() {
    // subscribe to service to update working copy when modal opens
    this.service.edit$.subscribe((s) => {
      if (s.open) {
        this.working = s.question ? { ...(s.question as any) } : ({ text: '', options: ['', ''], correctAnswer: '' } as Question);
      } else {
        this.working = null;
      }
    });
  }

  addOption() {
    if (!this.working) return;
    this.working.options = Array.isArray(this.working.options) ? this.working.options : [];
    this.working.options.push('');
  }

  removeOption(i: number) {
    if (!this.working || !Array.isArray(this.working.options)) return;
    if (this.working.options.length <= 2) return;
    const removed = this.working.options.splice(i, 1)[0];
    if (this.working.correctAnswer === removed) this.working.correctAnswer = this.working.options[0] || '';
  }

  confirm() {
    if (!this.working) return this.service.confirm(null);
    // trim fields
    this.working.text = this.working.text ? String(this.working.text).trim() : '';
    this.working.options = Array.isArray(this.working.options) ? this.working.options.map((o) => (o ? String(o).trim() : '')) : [];
    this.working.correctAnswer = this.working.correctAnswer ? String(this.working.correctAnswer).trim() : '';
    this.service.confirm(this.working);
    this.working = null;
  }

  cancel() {
    this.service.cancel();
    this.working = null;
  }
}
