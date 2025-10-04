import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Quiz, QuizResultResponse, QuizSessionStartRequest, QuizSessionStartResponse, QuizSubmission } from '../../../models/quiz';
import { FormsModule } from '@angular/forms';
import { QuestionComponent } from '../../../components/question-component/question-component';
import { ActivatedRoute, Router } from '@angular/router';
import { TimerComponent } from '../../../components/timer-component/timer-component';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { UserService } from '../../../services/user-service/user-service';

@Component({
  selector: 'app-quiz-detail-page',
  imports: [CommonModule, FormsModule, QuestionComponent, TimerComponent, DecimalPipe],
  templateUrl: './quiz-detail-page.html',
})
export class QuizDetailPage {
  quizId: string = '';
  quizData: QuizSessionStartResponse | null = null;
  quizSubmission: QuizSubmission = {
    userId: '',
    sessionId: '',
    answers: [],
  };
  quizSubmissionResult: QuizResultResponse | null = null;
  termsAccepted = false;
  loading = false;
  currentQuestionIndex = 0;
  remainingSeconds = 0;
  private countdownInterval: any;

  constructor(
    private quizService: QuizService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.quizSubmission.userId = this.userService.getUserId();
    this.quizId = this.activatedRoute.snapshot.paramMap.get('quizId')!;

    const savedState = localStorage.getItem(`quiz-${this.quizId}`);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      this.quizData = parsed.quizData;
      this.quizSubmission = parsed.quizSubmission;
      this.currentQuestionIndex = parsed.currentQuestionIndex;
      this.termsAccepted = parsed.termsAccepted;
    }

    if (this.termsAccepted) {
      this.loadQuiz();
    }
  }

  loadQuiz() {
    this.termsAccepted = true;
    this.loading = true;
    const startRequest: QuizSessionStartRequest = {
      userId: this.userService.getUserId(),
      quizId: this.quizId
    };
    this.quizService
      .startQuiz(startRequest)
      .subscribe({
        next: (quiz: QuizSessionStartResponse) => {
          this.quizData = quiz;
          this.quizSubmission.sessionId =
            quiz.sessionId;

          if (quiz.remainingSeconds) {
            this.remainingSeconds = quiz.remainingSeconds;
            this.loading = false;
            this.startCountdown();
          }

          this.saveState();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

  onAnswerSelected(answer: string) {
    const questionId = this.quizData!.questions![this.currentQuestionIndex].id;

    let answerEntry = this.quizSubmission.answers.find(
      (a) => a.questionId === questionId
    );

    if (answerEntry) {
      answerEntry.answer = answer;
    } else {
      this.quizSubmission.answers.push({
        questionId,
        answer: answer,
      });
    }
    this.saveState();
  }

  getSelectedAnswer(questionId: string): string | null {
    return (
      this.quizSubmission.answers.find(
        (a) => a.questionId === questionId
      )?.answer || null
    );
  }

  hasAnswerForCurrentQuestion(): boolean {
    const questionId =
      this.quizData?.questions?.[this.currentQuestionIndex]?.id;
    return !!this.quizSubmission.answers.find(
      (a) => a.questionId === questionId
    );
  }

  nextQuestion() {
    if (
      this.quizData &&
      (this.quizData.questions?.length ?? 0) > this.currentQuestionIndex + 1
    ) {
      this.currentQuestionIndex++;
      this.saveState();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.saveState();
    }
  }

  saveState() {
    localStorage.setItem(
      `quiz-${this.quizId}`,
      JSON.stringify({
        quizData: this.quizData,
        quizSubmission: this.quizSubmission,
        currentQuestionIndex: this.currentQuestionIndex,
        termsAccepted: this.termsAccepted,
      })
    );
  }

  private startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        clearInterval(this.countdownInterval);
        this.submitQuiz();
      }
    }, 1000);
  }

  submitQuiz() {
    if (this.quizSubmission != null) {
      this.quizService.submitQuiz(this.quizSubmission).subscribe({
        next: (data: QuizResultResponse) => {
          this.quizSubmissionResult = data;
          localStorage.removeItem(`quiz-${this.quizId}`);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  viewResults() {
    if (this.quizSubmissionResult?.id) {
      this.router.navigate(['/quiz/results', this.quizSubmissionResult.id]);
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
