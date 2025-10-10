import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { QuestionComponent } from '../../../components/question-component/question-component';
import { TimerComponent } from '../../../components/timer-component/timer-component';
import {
  QuizResultResponse,
  QuizSessionStartRequest,
  QuizSessionStartResponse,
  QuizSubmission,
} from '../../../models/quiz';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { TokenService } from '../../../services/token-service/token-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-detail-page',
  imports: [
    CommonModule,
    FormsModule,
    QuestionComponent,
    TimerComponent,
    DecimalPipe,
  ],
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
  private countdownInterval: number | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private quizService: QuizService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.quizSubmission.userId = this.tokenService.getId();
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

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationStart &&
        this.quizData &&
        !this.quizSubmissionResult
      ) {
        this.submitQuiz();
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.quizData && !this.quizSubmissionResult) {
      event.preventDefault();
    }
  }

  @HostListener('window:unload')
  handleUnload() {
    if (this.quizData && !this.quizSubmissionResult) {
      this.submitQuiz();
    }
  }

  loadQuiz() {
    this.termsAccepted = true;
    this.loading = true;
    const startRequest: QuizSessionStartRequest = {
      userId: this.tokenService.getId(),
      quizId: this.quizId,
    };
    this.quizService.startQuiz(startRequest).subscribe({
      next: (quiz: QuizSessionStartResponse) => {
        this.quizData = quiz;
        this.quizSubmission.sessionId = quiz.sessionId;

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
      this.quizSubmission.answers.find((a) => a.questionId === questionId)
        ?.answer || null
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
    if (this.countdownInterval !== null) {
      window.clearInterval(this.countdownInterval as number);
    }

    this.countdownInterval = window.setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        window.clearInterval(this.countdownInterval as number);
        this.countdownInterval = null;
        this.submitQuiz();
      }
    }, 1000);
  }

  submitQuiz() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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
      this.router.navigate(['/result', this.quizSubmissionResult.id]);
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval !== null) {
      window.clearInterval(this.countdownInterval as number);
      this.countdownInterval = null;
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
