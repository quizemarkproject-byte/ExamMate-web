import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-quiz-detail-page',
  standalone: true,
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
  totalSeconds: number = 0; // initial total time for progress bar
  quizSubmission: QuizSubmission = {
    userId: '',
    sessionId: '',
    answers: [],
  };
  quizSubmissionResult: QuizResultResponse | null = null;
  loadingQuiz: boolean = false;
  submittingQuiz: boolean = false;
  currentQuestionIndex = 0;
  remainingSeconds = 0;
  private countdownInterval: number | null = null;

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
    }

    this.loadQuiz();
  }

  loadQuiz() {
    const startRequest: QuizSessionStartRequest = {
      userId: this.tokenService.getId(),
      quizId: this.quizId,
    };
    this.loadingQuiz = true;
    this.quizService.startQuiz(startRequest).subscribe({
      next: (quiz: QuizSessionStartResponse) => {
        this.quizData = quiz;
        this.quizSubmission.sessionId = quiz.sessionId;
        this.totalSeconds = quiz.totalTimeInSeconds || quiz.remainingSeconds || 0;

        if (quiz.remainingSeconds) {
          this.remainingSeconds = quiz.remainingSeconds;
          this.loadingQuiz = false;
          this.startCountdown();
        }

        this.saveState();
      },
      error: (err) => {
        console.error(err);
        this.loadingQuiz = false;
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
        // Time's up: submit the quiz automatically
        this.submitQuiz();
      }
    }, 1000);
  }

  submitQuiz() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.quizSubmission != null) {
      this.submittingQuiz = true;
      this.quizService.submitQuiz(this.quizSubmission).subscribe({
        next: (data: QuizResultResponse) => {
          this.quizSubmissionResult = data;
          localStorage.removeItem(`quiz-${this.quizId}`);
          this.submittingQuiz = false;
        },
        error: (err) => {
          console.log(err);
          this.submittingQuiz = false;
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
  }
}
