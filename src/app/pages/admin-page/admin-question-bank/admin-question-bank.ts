import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/quiz';

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
}
