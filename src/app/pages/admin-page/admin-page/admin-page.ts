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
    const qLimit = Number(quiz.questionLimit);
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
      },
      error: (err) => {
        console.error('Failed to create quiz', err);
        this.toastr.error('Failed to create quiz on server.');
      },
    });
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
    const q: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', ''],
      correctAnswer: '',
    };
    // add to bank
    this.questionBank.push(q);
    // attach the same object reference to the quiz so it can be reused
    if (!this.quizzes[this.selectedQuizIndex].questions)
      this.quizzes[this.selectedQuizIndex].questions = [];
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
    const options =
      this.quizzes[this.selectedQuizIndex].questions![qIndex].options;
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
    const q: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', ''],
      correctAnswer: '',
    };
    this.questionBank.push(q);
  }
}
