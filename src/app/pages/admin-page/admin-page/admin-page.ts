import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminQuizList } from '../admin-quiz-list/admin-quiz-list';
import { AdminQuestionBank } from '../admin-question-bank/admin-question-bank';
import { AdminQuestionEditor } from '../admin-question-editor/admin-question-editor';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { QuizRequest, AdminQuiz, Question } from '../../../models/quiz';
// forkJoin not needed when sending full list
import { HttpErrorResponse } from '@angular/common/http';

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
  saving: boolean = false;
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
    });
  }

  loadQuestions() {
    this.quizService.adminGetAllQuestions().subscribe({
      next: (qs) => {
        this.questionBank = qs;
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
    if (Number.isNaN(qLimit) || !Number.isInteger(qLimit) || qLimit < 2) {
      errors.push('Question limit must be a positive integer, minimum of 2.');
    }
    return errors;
  }

  isNewQuizValid(): boolean {
    return this.validateNewQuiz().length === 0;
  }

  validateQuestion(q: Question): string[] {
    const errors: string[] = [];
    const MAX_LEN = 255;
    if (!q.text || !q.text.trim()) errors.push('Question text is required.');
    else if (String(q.text).trim().length > MAX_LEN)
      errors.push(`Question text must be at most ${MAX_LEN} characters.`);

    const filledOptions = Array.isArray(q.options)
      ? q.options
          .map((o) => (o ? String(o).trim() : ''))
          .filter((o) => o.length > 0)
      : [];

    if (filledOptions.length < 2) {
      errors.push('Each question must have at least 2 non-empty options.');
      return errors;
    }

    // validate option lengths
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    rawOptions.forEach((opt, i) => {
      const len = opt ? String(opt).trim().length : 0;
      if (len > MAX_LEN) errors.push(`Option ${i + 1} must be at most ${MAX_LEN} characters.`);
    });

    const correct = q.correctAnswer ? String(q.correctAnswer).trim() : '';
    if (!correct || !filledOptions.includes(correct))
      errors.push(
        'A correct option must be selected from the non-empty options.'
      );

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
    return this.selectedQuizIndex === null
      ? null
      : this.quizzes[this.selectedQuizIndex];
  }

  // helper to apply a mutation to the selected quiz and refresh cached errors
  private mutateSelectedQuiz(mutator: (q: AdminQuiz) => void) {
    const q = this.selectedQuiz;
    if (!q) return;
    mutator(q);
    this.updateSelectedQuizErrors();
  }

  updateSelectedQuizErrors() {
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
      text: '',
      options: ['', ''],
      correctAnswer: '',
    } as Question;
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
      // avoid client-generated ids; server will provide ids when persisted
      text: '',
      options: ['', ''],
      correctAnswer: '',
    } as Question;
    this.questionBank.push(q);
  }

  // Persist questions for a given quiz by calling adminCreateQuestions for each question
  persistQuiz(quiz: AdminQuiz) {
    if (!quiz || !quiz.id) {
      this.toastr.error('Quiz must have an id before saving questions.');
      return;
    }
    const questions = quiz.questions || [];
    if (questions.length === 0) {
      this.toastr.warning('No questions to save for this quiz.');
      return;
    }

    // Prepare payload: shallow-copy questions
    const payload: Question[] = questions.map((q) => ({ ...(q as any) } as Question));

    console.log('Persisting questions for quiz', quiz.id, payload);
      // Show saving indicator while request is in-flight
      this.saving = true;

    // Send the full list for this quiz (server should handle new vs existing)
    this.quizService.adminCreateQuestions(quiz.id!, payload).subscribe({
      next: (created: Question[]) => {
        // Map server responses back to local quiz.questions by index
        const n = Math.min(created.length, quiz.questions!.length);
        for (let i = 0; i < n; i++) {
          const serverQ = created[i];
          if (!serverQ) continue;
          const local = quiz.questions![i];
          Object.assign(local, serverQ);
          const bankIdx = this.questionBank.findIndex((b) => b === local);
          if (bankIdx === -1) this.questionBank.push(local);
          else this.questionBank[bankIdx] = local;
        }

        // If server returned additional questions, append them to bank/quiz
        if (created.length > quiz.questions!.length) {
          for (let i = quiz.questions!.length; i < created.length; i++) {
            const c = created[i];
            if (!c) continue;
            quiz.questions!.push(c);
            this.questionBank.push(c);
          }
        }

        this.toastr.success('Questions saved.');
        this.updateSelectedQuizErrors();
          this.saving = false;
      },
    });
  }

}
