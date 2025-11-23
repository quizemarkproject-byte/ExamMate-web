import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminQuizList } from '../admin-quiz-list/admin-quiz-list';
import { AdminQuestionBank } from '../admin-question-bank/admin-question-bank';
import { AdminQuestionEditor } from '../admin-question-editor/admin-question-editor';
import { QuestionModal } from '../../../components/question-modal/question-modal';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { EditQuestionService } from '../../../services/edit-question-service/edit-question-service';
import { QuizRequest, AdminQuiz, Question } from '../../../models/quiz';
import { validateQuestion as validateQuestionUtil } from '../../../utils/question-validators';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminQuizList,
    AdminQuestionBank,
    AdminQuestionEditor,
    QuestionModal,
  ],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  @ViewChild(AdminQuestionEditor) editorComponent?: AdminQuestionEditor;
  
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
    private quizService: QuizService,
    private editService: EditQuestionService
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
    return validateQuestionUtil(q);
  }

  // convenience getter for the currently selected quiz object
  get selectedQuiz(): AdminQuiz | null {
    return this.selectedQuizIndex === null
      ? null
      : this.quizzes[this.selectedQuizIndex];
  }

  // Called by child component when validation state changes
  onValidationChange(errors: string[]) {
    this.selectedQuizErrors = errors;
  }

  // helper to apply a mutation to the selected quiz
  private mutateSelectedQuiz(mutator: (q: AdminQuiz) => void) {
    const q = this.selectedQuiz;
    if (!q) return;
    mutator(q);
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
    });
  }

  selectQuiz(i: number) {
    this.selectedQuizIndex = i;
  }

  deleteQuiz(i: number) {
    // TODO: implement delete quiz functionality
    this.quizzes.splice(i, 1);
    if (this.selectedQuizIndex === i) this.selectedQuizIndex = null;
  }

  editQuiz(i: number) {
    // TODO: implement edit quiz functionality
    console.log('Editing quiz at index', i);
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
    if (!q) return;
    
    const quiz = this.selectedQuiz;
    if (!quiz) return;
    
    // Initialize questions array if needed
    if (!quiz.questions) quiz.questions = [];
    
    // Check if already attached
    const exists = quiz.questions.some((qq) => qq === q || (qq.id && q.id && String(qq.id) === String(q.id)));
    if (exists) {
      this.toastr.warning('Question is already attached to this quiz.');
      return;
    }
    
    // Add to quiz questions
    quiz.questions.push(q);
    
    // Refresh the form to include the new question
    if (this.editorComponent) {
      this.editorComponent.refreshForm();
    }
  }

  createBankQuestion() {
    // Open the edit modal to create a new question, then persist via adminCreateQuestion
    this.editService.open().subscribe((created) => {
      if (!created) return; // user cancelled

      // Normalize/trim fields before sending
      created.text = created.text ? String(created.text).trim() : '';
      created.options = Array.isArray(created.options) ? created.options.map((o) => (o ? String(o).trim() : '')) : [];
      created.correctAnswer = created.correctAnswer ? String(created.correctAnswer).trim() : '';

      const errs = this.validateQuestion(created as Question);
      if (errs.length) {
        this.toastr.error('Cannot create question:\n' + errs.join('\n'));
        return;
      }

      this.quizService.adminCreateQuestion(created as Question).subscribe({
        next: (serverQ) => {
          this.questionBank.push(serverQ);
          this.toastr.success('Question created.');
        },
        error: () => {
          this.toastr.error('Failed to create question.');
        },
      });
    });
  }

  // Called when a question in the bank has been edited.
  // Ensures any quizzes that reference this question are updated in-place.
  onBankQuestionEdited(bankIndex: number) {
    const updated = this.questionBank[bankIndex];
    if (!updated) return;

    // Walk all quizzes and replace matching questions (by reference or by id)
    this.quizzes.forEach((quiz) => {
      if (!Array.isArray(quiz.questions)) return;
      for (let i = 0; i < quiz.questions.length; i++) {
        const qq = quiz.questions[i];
        if (qq === updated) {
          // same object reference — nothing needed (already mutated), but keep for clarity
          Object.assign(qq, updated);
        } else if (qq && qq.id && updated.id && String(qq.id) === String(updated.id)) {
          Object.assign(qq, updated);
        }
      }
    });
  }

  deleteBankQuestion(bankIndex: number) {
    const q = this.questionBank[bankIndex];
    if (!q) return;

    const removeLocal = () => {
      // remove from bank
      this.questionBank.splice(bankIndex, 1);
      // remove from any quizzes that reference this question (by reference or id)
      this.quizzes.forEach((quiz) => {
        if (!Array.isArray(quiz.questions)) return;
        for (let i = quiz.questions.length - 1; i >= 0; i--) {
          const qq = quiz.questions[i];
          if (qq === q || (qq.id && q.id && String(qq.id) === String(q.id))) {
            quiz.questions.splice(i, 1);
          }
        }
      });
    };

    if (q.id) {
      this.quizService.adminDeleteQuestion(String(q.id)).subscribe({
        next: () => {
          removeLocal();
          this.toastr.success('Question deleted.');
        },
        error: () => {
          this.toastr.error('Failed to delete question.');
        },
      });
    } else {
      // not persisted yet — just remove locally
      removeLocal();
      this.toastr.success('Question removed.');
    }
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
    this.quizService.adminUpdateQuizQuestions(quiz.id!, payload).subscribe({
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
          this.saving = false;
      },
    });
  }

}
