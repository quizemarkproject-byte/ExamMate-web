import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminQuizList } from '../admin-quiz-list/admin-quiz-list';
import { AdminQuestionBank } from '../admin-question-bank/admin-question-bank';
import { AdminQuestionEditor } from '../admin-question-editor/admin-question-editor';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { QuizRequest, Quiz, AdminQuiz, Question } from '../../../models/quiz';

@Component({
  selector: 'app-admin-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminQuizList,
    AdminQuestionBank,
    AdminQuestionEditor,
  ],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  quizzes: AdminQuiz[] = [];
  questionBank: Question[] = [];
  selectedQuizIndex: number | null = null;
  selectedQuizErrors: string[] = [];
  newQuizName: string = '';
  newQuizTimeLimit: string = '10';
  newQuizQuestionLimit: number = 10;

  constructor(
    private toastr: ToastrService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadQuestions();
  }

  loadQuizzes() {
    this.quizService.adminGetAllQuiz().subscribe({
      next: (qs) => {
        this.quizzes = qs;
      },
      error: (err) => {
        console.error('Failed to load quizzes', err);
        this.toastr.error('Failed to load quizzes from server.');
      },
    });
  }

  loadQuestions() {
    this.quizService.adminGetAllQuestions().subscribe({
      next: (qs) => {
        this.questionBank = qs;
      },
      error: (err) => {
        console.error('Failed to load question bank', err);
        this.toastr.error('Failed to load question bank from server.');
      },
    });
  }


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
    const qLimit = this.newQuizQuestionLimit;
    if (Number.isNaN(qLimit) || qLimit <= 0) {
      errors.push('Question limit must be a positive integer.');
    }
    return errors;
  }

  isNewQuizValid(): boolean {
    return this.validateNewQuiz().length === 0;
  }

  validateQuestion(q: Question): string[] {
    const errors: string[] = [];
    if (!q.text || !q.text.trim()) errors.push('Question text is required.');
    if (!Array.isArray(q.options) || q.options.length < 2)
      errors.push('Each question must have at least 2 options.');
    else {
      q.options.forEach((opt: string, idx: number) => {
        if (!opt || !opt.trim())
          errors.push(`Option ${idx + 1} cannot be empty.`);
      });
    }
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer))
      errors.push('A correct option must be selected.');
    return errors;
  }

  validateQuiz(quiz: AdminQuiz): string[] {
    const errors: string[] = [];
    const qLimit = quiz.questionLimit;
    if (Array.isArray(quiz.questions) && quiz.questions.length < qLimit)
      errors.push(
        'Number of attached questions is less than the question limit (this is the minimum number of questions required).'
      );
    // validate each question
    if (Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q: Question, idx: number) => {
        const qErrors = this.validateQuestion(q);
        qErrors.forEach((e) => errors.push(`Q${idx + 1}: ${e}`));
      });
    }
    return errors;
  }

  // convenience getter for the currently selected quiz object
  get selectedQuiz(): AdminQuiz | null {
    return this.selectedQuizIndex === null ? null : this.quizzes[this.selectedQuizIndex];
  }

  // helper to apply a mutation to the selected quiz and refresh cached errors
  private mutateSelectedQuiz(mutator: (q: AdminQuiz) => void) {
    const q = this.selectedQuiz;
    if (!q) return;
    mutator(q);
    this.updateSelectedQuizErrors();
  }

  private updateSelectedQuizErrors() {
    if (this.selectedQuizIndex === null) {
      this.selectedQuizErrors = [];
      return;
    }
    const quiz = this.quizzes[this.selectedQuizIndex];
    this.selectedQuizErrors = this.validateQuiz(quiz);
  }

  createQuiz() {
    const errs = this.validateNewQuiz();
    if (errs.length) {
      this.toastr.error('Cannot create quiz:\n' + errs.join('\n'));
      return;
    }
    // prepare payload for backend (QuizRequest expects minutes as string)
    const payload: QuizRequest = {
      name: this.newQuizName || 'Untitled Quiz',
      // input `newQuizTimeLimit` is already a string (minutes), use directly
      timeLimitMinutes: this.newQuizTimeLimit,
      questionLimit: this.newQuizQuestionLimit,
    };

    this.quizService.adminCreateQuiz(payload).subscribe({
      next: (c: AdminQuiz) => {
        // map server Quiz -> AdminQuiz and append
        this.quizzes.push(c);
        this.toastr.success('Quiz created.');
        this.newQuizName = '';
        this.newQuizTimeLimit = '10';
        this.newQuizQuestionLimit = 10;
        this.selectedQuizIndex = this.quizzes.length - 1;
        this.updateSelectedQuizErrors();
      },
      error: (err) => {
        console.error('Failed to create quiz', err);
        this.toastr.error('Failed to create quiz on server.');
      },
    });
  }

  selectQuiz(i: number) {
    this.selectedQuizIndex = i;
    this.updateSelectedQuizErrors();
  }

  deleteQuiz(i: number) {
    this.quizzes.splice(i, 1);
    if (this.selectedQuizIndex === i) this.selectedQuizIndex = null;
  }

  // create a new question in the bank and attach it to the selected quiz
  addQuestion() {
    const q: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', ''],
      correctAnswer: '',
    };
    // add to bank and attach to selected quiz
    this.questionBank.push(q);
    this.mutateSelectedQuiz((quiz) => {
      if (!quiz.questions) quiz.questions = [];
      quiz.questions.push(q);
    });
  }

  // attach an existing question from the bank to the currently selected quiz
  attachQuestionFromBank(bankIndex: number) {
    const q = this.questionBank[bankIndex];
    this.mutateSelectedQuiz((quiz) => {
      if (!quiz.questions) quiz.questions = [];
      if (!quiz.questions.includes(q)) quiz.questions.push(q);
    });
  }

  removeQuestion(qIndex: number) {
    this.mutateSelectedQuiz((quiz) => {
      quiz.questions!.splice(qIndex, 1);
    });
  }

  addOption(qIndex: number) {
    this.mutateSelectedQuiz((quiz) => {
      quiz.questions![qIndex].options.push('');
    });
  }

  removeOption(qIndex: number, optIndex: number) {
    this.mutateSelectedQuiz((quiz) => {
      const q = quiz.questions![qIndex];
      if ((q.options?.length || 0) <= 2) {
        this.toastr.warning('Each question must have at least 2 options.');
        return;
      }
      const removed = q.options.splice(optIndex, 1)[0];
      if (q.correctAnswer === removed) q.correctAnswer = q.options[0] || '';
    });
  }

  setCorrect(qIndex: number, optIndex: number) {
    this.mutateSelectedQuiz((quiz) => {
      const q = quiz.questions![qIndex];
      q.correctAnswer = q.options[optIndex] || '';
    });
  }

  createBankQuestion() {
    const q: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', ''],
      correctAnswer: '',
    };
    this.questionBank.push(q);
  }
}
