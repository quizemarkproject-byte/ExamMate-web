import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Question } from '../../models/quiz';

@Component({
  selector: 'app-question-component',
  imports: [CommonModule],
  templateUrl: './question-component.html'
})
export class QuestionComponent {
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Input() question!: Question;
  @Input() selectedAnswer: string | null = null;
  @Output() answerSelected = new EventEmitter<string>();


  selectAnswer(option: string) {
    this.answerSelected.emit(option);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
