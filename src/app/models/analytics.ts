export interface AnalyticsResponse {
  totalAttempts: number;
  averageScore: number; // percent
  medianScore: number; // percent
  scoreDistribution: Record<string, number>; // e.g. "0-10": 3
  attemptsByDay: Record<string, number>; // yyyy-MM-dd -> count
}
