import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';
import { AdminQuiz } from '../../../models/quiz';

@Component({
  selector: 'admin-quiz-list',
  imports: [CommonModule, FormsModule, DurationPipe],
  templateUrl: './admin-quiz-list.html',
})
export class AdminQuizList {
  @Input() quizzes: AdminQuiz[] = [];
  @Input() selectedIndex: number | null = null;

  // bound create fields (parent owns state; child emits changes)
  @Input() newQuizName = '';
  @Input() newQuizTimeLimit = '10';
  @Input() newQuizQuestionLimit = 10;
  @Input() isNewQuizValid: boolean = true;
  @Input() newQuizErrors: string[] = [];

  @Output() newQuizNameChange = new EventEmitter<string>();
  @Output() newQuizTimeLimitChange = new EventEmitter<string>();
  @Output() newQuizQuestionLimitChange = new EventEmitter<number>();

  @Output() createQuiz = new EventEmitter<void>();
  @Output() selectQuiz = new EventEmitter<number>();
  @Output() deleteQuiz = new EventEmitter<number>();

  onNameChange(v: string) { this.newQuizNameChange.emit(v); }
  onTimeChange(v: string) { this.newQuizTimeLimitChange.emit(v); }
  onLimitChange(v: string | number) { this.newQuizQuestionLimitChange.emit(Number(v)); }
}
