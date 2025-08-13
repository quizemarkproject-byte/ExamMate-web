import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Quiz, QuizResultResponse, QuizSubmission } from '../../../models/quiz';
import { FormsModule } from '@angular/forms';
import { QuestionComponent } from '../../../components/question-component/question-component';
import { ActivatedRoute, Router } from '@angular/router';
import { TimerComponent } from '../../../components/timer-component/timer-component';
import { QuizService } from '../../../services/quiz-service/quiz-service';

@Component({
  selector: 'app-quiz-detail-page',
  imports: [CommonModule, FormsModule, QuestionComponent, TimerComponent],
  templateUrl: './quiz-detail-page.html'
})
export class QuizDetailPage {
  quizId: string = '';
  quizData: Quiz | null = null;
  quizSubmission: QuizSubmission = {
    userId: 'user1',
    quizSessionId: '',
    answerSubmissions: [],
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
    private router: Router
  ) {}

  ngOnInit() {
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
      this.loadRemainingTimeFromServer();
    }
  }

  loadRemainingTimeFromServer() {
    this.loading = true;
    this.quizService
      .getRemainingTime(
        this.quizId,
        this.quizSubmission.userId,
        this.quizSubmission.quizSessionId
      )
      .subscribe({
        next: (time) => {
          this.remainingSeconds = time.remainingSeconds;
          this.loading = false;
          this.startCountdown();
        },
        error: (err) => {
          console.error('Failed to load remaining time:', err);
          this.loading = false;
        },
      });
  }

  loadQuiz() {
    this.termsAccepted = true;
    this.loading = true;

    this.quizService
      .startQuiz(this.quizId, this.quizSubmission.userId)
      .subscribe({
        next: (quiz: Quiz) => {
          this.quizData = quiz;
          this.quizSubmission.quizSessionId =
            quiz.timeRemaining?.quizSessionId || '';

          if (quiz.timeRemaining) {
            this.remainingSeconds = quiz.timeRemaining.remainingSeconds;
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

    let answerEntry = this.quizSubmission.answerSubmissions.find(
      (a) => a.questionId === questionId
    );

    if (answerEntry) {
      answerEntry.selectedAnswer = answer;
    } else {
      this.quizSubmission.answerSubmissions.push({
        questionId,
        selectedAnswer: answer,
      });
    }
    this.saveState();
  }

  getSelectedAnswer(questionId: string): string | null {
    return (
      this.quizSubmission.answerSubmissions.find(
        (a) => a.questionId === questionId
      )?.selectedAnswer || null
    );
  }

  hasAnswerForCurrentQuestion(): boolean {
    const questionId =
      this.quizData?.questions?.[this.currentQuestionIndex]?.id;
    return !!this.quizSubmission.answerSubmissions.find(
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
      this.quizService.submitQuiz(this.quizId, this.quizSubmission).subscribe({
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
