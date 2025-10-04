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
  questions?: QuestionResultResponse[]
}

export interface QuestionResultResponse {
  text: string
  options: string[]
  correctAnswer: string
  chosenAnswer: string
  correct: boolean
}
