import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminQuizList } from '../admin-quiz-list/admin-quiz-list';
import { AdminQuestionBank } from '../admin-question-bank/admin-question-bank';
import { AdminQuestionEditor } from '../admin-question-editor/admin-question-editor';
import { QuestionModal } from '../../../components/question-modal/question-modal';
import { QuizModal } from '../../../components/quiz-modal/quiz-modal';
import { ToastrService } from '../../../services/toastr-service/toastr-service';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { EditQuestionService } from '../../../services/edit-question-service/edit-question-service';
import { QuizRequest, AdminQuiz, Question } from '../../../models/quiz';

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
    QuizModal,
  ],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  @ViewChild(AdminQuestionEditor) editorComponent?: AdminQuestionEditor;
  @ViewChild(QuizModal) quizModal?: QuizModal;
  
  quizzes: AdminQuiz[] = [];
  questionBank: Question[] = [];
  selectedQuizIndex: number | null = null;
  selectedQuizErrors: string[] = [];
  saving: boolean = false;

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

  get selectedQuiz(): AdminQuiz | null {
    return this.selectedQuizIndex === null
      ? null
      : this.quizzes[this.selectedQuizIndex];
  }

  onValidationChange(errors: string[]) {
    this.selectedQuizErrors = errors;
  }

  createQuiz() {
    if (!this.quizModal) return;

    this.quizModal.open().subscribe((quiz) => {
      if (!quiz) return;

      const payload: QuizRequest = {
        name: quiz.name,
        timeLimitMinutes: Number(quiz.timeLimit),
        questionLimit: quiz.questionLimit,
      };

      this.quizService.adminCreateQuiz(payload).subscribe({
        next: (c: AdminQuiz) => {
          this.quizzes.push(c);
          this.toastr.success('Quiz created.');
          this.selectedQuizIndex = this.quizzes.length - 1;
        },
      });
    });
  }

  selectQuiz(i: number) {
    this.selectedQuizIndex = i;
  }

  deleteQuiz(i: number) {
    const quiz = this.quizzes[i];
    if (!quiz?.id) {
      this.quizzes.splice(i, 1);
      if (this.selectedQuizIndex === i) this.selectedQuizIndex = null;
      return;
    }

    this.quizService.adminDeleteQuiz(quiz.id).subscribe({
      next: () => {
        this.quizzes.splice(i, 1);
        if (this.selectedQuizIndex === i) this.selectedQuizIndex = null;
        this.toastr.success('Quiz deleted.');
      },
      error: () => {
        this.toastr.error('Failed to delete quiz.');
      },
    });
  }

  editQuiz(i: number) {
    if (!this.quizModal) return;

    const quiz = this.quizzes[i];
    if (!quiz) return;

    this.quizModal.open(quiz).subscribe((updatedQuiz) => {
      if (!updatedQuiz || !updatedQuiz.id) return;

      const payload: QuizRequest = {
        id: updatedQuiz.id,
        name: updatedQuiz.name,
        timeLimitMinutes: Number(updatedQuiz.timeLimit),
        questionLimit: updatedQuiz.questionLimit,
      };

      this.quizService.adminUpdateQuiz(payload).subscribe({
        next: (updated: AdminQuiz) => {
          Object.assign(this.quizzes[i], updated);
          
          // If this is the selected quiz, update validators to reflect new questionLimit
          if (this.selectedQuizIndex === i && this.editorComponent) {
            this.editorComponent.updateValidators();
          }
          
          this.toastr.success('Quiz updated.');
        },
        error: () => {
          this.toastr.error('Failed to update quiz.');
        },
      });
    });
  }

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
    this.editService.open().subscribe((created) => {
      if (!created) return;

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

    const removeQuestionFromQuizzes = () => {
      this.questionBank.splice(bankIndex, 1);
      this.quizzes.forEach((quiz) => {
        if (!quiz.questions) return;
        quiz.questions = quiz.questions.filter(
          (qq) => qq !== q && !(qq.id && q.id && String(qq.id) === String(q.id))
        );
      });
    };

    if (q.id) {
      this.quizService.adminDeleteQuestion(String(q.id)).subscribe({
        next: () => {
          removeQuestionFromQuizzes();
          this.toastr.success('Question deleted.');
        },
        error: () => this.toastr.error('Failed to delete question.'),
      });
    } else {
      removeQuestionFromQuizzes();
      this.toastr.success('Question removed.');
    }
  }

  persistQuiz(quiz: AdminQuiz) {
    if (!quiz?.id) {
      this.toastr.error('Quiz must have an id before saving questions.');
      return;
    }
    
    if (!quiz.questions?.length) {
      this.toastr.warning('No questions to save for this quiz.');
      return;
    }

    this.saving = true;
    const payload: Question[] = quiz.questions.map(q => ({ ...q }));

    this.quizService.adminUpdateQuizQuestions(quiz.id, payload).subscribe({
      next: (savedQuestions: Question[]) => {
        // Update quiz questions with server response
        savedQuestions.forEach((serverQ, i) => {
          if (quiz.questions![i]) {
            Object.assign(quiz.questions![i], serverQ);
          }
          
          // Sync to question bank
          const bankIdx = this.questionBank.findIndex(b => 
            b === quiz.questions![i] || (b.id && serverQ.id && String(b.id) === String(serverQ.id))
          );
          if (bankIdx >= 0) {
            this.questionBank[bankIdx] = serverQ;
          } else {
            this.questionBank.push(serverQ);
          }
        });

        this.toastr.success('Questions saved.');
        this.saving = false;
      },
      error: () => {
        this.toastr.error('Failed to save questions.');
        this.saving = false;
      },
    });
  }

}
