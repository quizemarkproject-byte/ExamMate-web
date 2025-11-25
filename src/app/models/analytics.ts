export interface QuestionStat {
  id: string;
  text: string;
  pctCorrect: number; // decimal 0-1
}

export interface AnalyticsResponse {
  totalAttempts: number;
  averageScore: number; // percent
  medianScore: number; // percent
  scoreDistribution: Record<string, number>; // e.g. "0-9": 3
  attemptsByDay: Record<string, number>; // yyyy-MM-dd -> count
  questionStats?: QuestionStat[]; // per-question difficulty
}
