import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminQuiz } from '../../../models/quiz';
import { DurationPipe } from '../../../pipes/duration/duration-pipe';

@Component({
  selector: 'admin-question-editor',
  imports: [CommonModule, FormsModule, DurationPipe],
  templateUrl: './admin-question-editor.html',
})
export class AdminQuestionEditor {
  @Input() quiz: AdminQuiz | null = null

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
}
