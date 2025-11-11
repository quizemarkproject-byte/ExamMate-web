import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminQuizList } from '../admin-quiz-list/admin-quiz-list';
import { AdminQuestionBank } from '../admin-question-bank/admin-question-bank';
import { AdminQuestionEditor } from '../admin-question-editor/admin-question-editor';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { QuestionRequest } from '../../../models/quiz';

// Runtime model used inside the admin UI which retains attached questions.
// We keep this separate from the server-facing QuizRequest DTO which should
// not include embedded questions according to the API contract.
interface AdminQuiz {
  id?: string;
  name: string;
  timeLimitMinutes: number;
  questionLimit: number;
  questions?: QuestionRequest[];
}

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, RouterModule, AdminQuizList, AdminQuestionBank, AdminQuestionEditor],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  // Request-shaped models used for creating/updating quizzes and questions
  // QuizRequest represents the payload to create/update a quiz
  // QuestionRequest represents a question shape used in the bank and per-quiz
  
  // use AdminQuiz for runtime; QuizRequest (imported) remains available when
  // converting payloads for the backend.
  quizzes: AdminQuiz[] = [];
  // central question bank — questions here can be attached to multiple quizzes
  questionBank: QuestionRequest[] = [];
  selectedQuizIndex: number | null = null;

  // temporary inputs for new quiz
  newQuizName = '';
  newQuizTimeLimit = '10'; // minutes as string for input binding
  newQuizQuestionLimit = 10;
  

  constructor(private toastr: ToastrService) {}

  // Validation helpers
  validateNewQuiz(): string[] {
    const errors: string[] = [];
    if (!this.newQuizName || !this.newQuizName.trim()) {
      errors.push('Quiz title is required.');
    }
    const time = Number(this.newQuizTimeLimit);
    if (Number.isNaN(time) || time <= 0) {
      errors.push('Time limit must be a positive number.');
    }
    const qLimit = Number(this.newQuizQuestionLimit);
    if (Number.isNaN(qLimit) || qLimit <= 0) {
      errors.push('Question limit must be a positive integer.');
    }
    return errors;
  }

  isNewQuizValid(): boolean {
    return this.validateNewQuiz().length === 0;
  }

  validateQuestion(q: QuestionRequest): string[] {
    const errors: string[] = [];
    if (!q.text || !q.text.trim()) errors.push('Question text is required.');
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push('Each question must have at least 2 options.');
    else {
      q.options.forEach((opt: string, idx: number) => {
        if (!opt || !opt.trim()) errors.push(`Option ${idx + 1} cannot be empty.`);
      });
    }
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) errors.push('A correct option must be selected.');
    return errors;
  }

  validateQuiz(quiz: any): string[] {
    const errors: string[] = [];
    if (!quiz.name || !quiz.name.trim()) errors.push('Quiz title is required.');
    const time = Number(quiz.timeLimitMinutes);
    if (Number.isNaN(time) || time <= 0) errors.push('Quiz time limit must be a positive number.');
    const qLimit = Number(quiz.questionLimit);
    if (Number.isNaN(qLimit) || qLimit <= 0) errors.push('Quiz question limit must be a positive integer.');
    // questionLimit represents how many questions a user will receive (shuffled count).
    // Treat it as a minimum number of attached questions required for the quiz to function.
    if (Array.isArray(quiz.questions) && quiz.questions.length < qLimit) errors.push('Number of attached questions is less than the question limit (this is the minimum number of questions required).');
    // validate each question
    if (Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q: any, idx: number) => {
        const qErrors = this.validateQuestion(q);
        qErrors.forEach((e) => errors.push(`Q${idx + 1}: ${e}`));
      });
    }
    return errors;
  }

  // check if all quizzes are valid
  isAllValid(): boolean {
    for (const quiz of this.quizzes) {
      if (this.validateQuiz(quiz).length > 0) return false;
    }
    return true;
  }

  createQuiz() {
    const errs = this.validateNewQuiz();
    if (errs.length) {
      this.toastr.error('Cannot create quiz:\n' + errs.join('\n'));
      return;
    }

    const quiz: any = {
      id: Date.now().toString(),
      name: this.newQuizName || 'Untitled Quiz',
      // questions hold references to objects from questionBank
      questions: [],
      // new required fields (use the bound input values)
      timeLimitMinutes: Number(this.newQuizTimeLimit),
      questionLimit: Number(this.newQuizQuestionLimit),
    };
    this.quizzes.push(quiz);
    this.newQuizName = '';
    this.newQuizTimeLimit = '10';
    this.newQuizQuestionLimit = 10;
    this.selectedQuizIndex = this.quizzes.length - 1;
  }

  selectQuiz(i: number) {
    this.selectedQuizIndex = i;
  }

  deleteQuiz(i: number) {
    this.quizzes.splice(i, 1);
    if (this.selectedQuizIndex === i) this.selectedQuizIndex = null;
  }

  // create a new question in the bank and attach it to the selected quiz
  addQuestion() {
    if (this.selectedQuizIndex === null) return;
    const quiz = this.quizzes[this.selectedQuizIndex];
    const q: QuestionRequest = {
      id: Date.now().toString(),
      text: '',
      // start with two empty options so validation doesn't fail immediately
      options: ['', ''],
      correctAnswer: '',
    };
    // add to bank
    this.questionBank.push(q);
    // attach the same object reference to the quiz so it can be reused
    if (!this.quizzes[this.selectedQuizIndex].questions) this.quizzes[this.selectedQuizIndex].questions = [];
    this.quizzes[this.selectedQuizIndex].questions!.push(q);
  }

  // attach an existing question from the bank to the currently selected quiz
  attachQuestionFromBank(bankIndex: number) {
    if (this.selectedQuizIndex === null) return;
    const q = this.questionBank[bankIndex];
    const quiz = this.quizzes[this.selectedQuizIndex];
    // avoid duplicate attachments
    if (!quiz.questions) quiz.questions = [];
    if (!quiz.questions.includes(q)) {
      quiz.questions.push(q);
    }
  }

  removeQuestion(qIndex: number) {
    if (this.selectedQuizIndex === null) return;
    this.quizzes[this.selectedQuizIndex].questions!.splice(qIndex, 1);
  }

  addOption(qIndex: number) {
    if (this.selectedQuizIndex === null) return;
    const options = this.quizzes[this.selectedQuizIndex].questions![qIndex].options;
    options.push('');
  }

  removeOption(qIndex: number, optIndex: number) {
    if (this.selectedQuizIndex === null) return;
    const q = this.quizzes[this.selectedQuizIndex].questions![qIndex];
    // prevent removing option when it would leave fewer than 2 options
    if ((q.options?.length || 0) <= 2) {
      this.toastr.warning('Each question must have at least 2 options.');
      return;
    }
    const removed = q.options.splice(optIndex, 1)[0];
    if (q.correctAnswer === removed) {
      q.correctAnswer = q.options[0] || '';
    }
  }

  setCorrect(qIndex: number, optIndex: number) {
    if (this.selectedQuizIndex === null) return;
    const q = this.quizzes[this.selectedQuizIndex].questions![qIndex];
    q.correctAnswer = q.options[optIndex] || '';
  }

  // simple save (no backend integration yet)
  saveAll() {
    // run validations across all quizzes and questions before "saving"
    const allErrors: string[] = [];
    this.quizzes.forEach((qz, idx) => {
      const errs = this.validateQuiz(qz);
      errs.forEach((e) => allErrors.push(`Quiz ${idx + 1} (${qz.name}): ${e}`));
    });
    if (allErrors.length) {
      this.toastr.error('Validation errors:\n' + allErrors.join('\n'));
      console.warn('Validation errors', allErrors);
      return;
    }
    // placeholder - persist to server later
    console.log('Question bank', this.questionBank);
    console.log('Quizzes to save', this.quizzes);
    this.toastr.success('Quizzes saved (local only).');
  }

  createBankQuestion() {
    const q: QuestionRequest = {
      id: Date.now().toString(),
      text: '',
      options: ['', ''],
      correctAnswer: '',
    };
    this.questionBank.push(q);
  }
}
