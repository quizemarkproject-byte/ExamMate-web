export interface Quiz {
  id: string
  title: string
  timeLimit: string
  questions?: Question[]
  timeRemaining?: TimeRemainingResponse
}

export interface Question {
  id: string
  text: string
  options: string[]
}

export interface QuizSubmission {
  userId: string
  quizSessionId: string
  answerSubmissions: AnswerSubmission[]
}

export interface AnswerSubmission {
  questionId: string
  selectedAnswer: string
}

export interface QuizResultResponse {
  questionResultResponse: QuestionResultResponse[]
  totalQuestions: number
  correctAnswers: number
  scorePercentage: number
}

export interface QuestionResultResponse {
  text: string
  options: string[]
  correctAnswer: string
  correct: boolean
}

export interface TimeRemainingResponse {
  quizSessionId: string;
  remainingSeconds: number
  totalTimeLimitSeconds: number
}