import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Question } from '../../models/quiz';

@Component({
  selector: 'app-question-component',
  imports: [],
  templateUrl: './question-component.html',
  styleUrl: './question-component.css'
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
}
