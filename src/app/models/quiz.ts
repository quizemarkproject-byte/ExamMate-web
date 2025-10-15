export interface Quiz {
  id: string
  name: string
  timeLimit: string
  questionLimit: number
}

export interface Question {
  id: string
  text: string
  options: string[]
}

export interface QuizSessionStartResponse {
  sessionId: string
  quizTitle: string
  totalTimeInSeconds: number
  remainingSeconds: number
  questions: Question[]
}

export interface QuizSessionStartRequest {
  userId: string
  quizId: string
}

export interface QuizSubmission {
  userId: string
  sessionId: string
  answers: AnswerSubmission[]
}

export interface AnswerSubmission {
  questionId: string
  answer: string
}

export interface QuizResultResponse {
  id: string
  quizTitle: string
  totalQuestions: number
  score: number
  completedAt: string
  questions?: QuestionResultResponse[]
}

export interface QuestionResultResponse {
  text: string
  options: string[]
  chosenAnswer: string
  correctAnswer: string
  correct: boolean
}

export interface CountResponse {
  count: number
}
