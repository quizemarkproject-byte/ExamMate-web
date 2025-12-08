import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics-service/analytics-service';
import { QuizService } from '../../../services/quiz-service/quiz-service';
import { UserService } from '../../../services/user-service/user-service';
import { AnalyticsResponse } from '../../../models/analytics';
import { AdminQuiz } from '../../../models/quiz';
import { UserModel } from '../../../models/user-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-analytics.html'
})
export class AdminAnalytics implements OnInit {
  loading = false;
  analyticsData: AnalyticsResponse | null = null;
  quizzes: AdminQuiz[] = [];
  users: UserModel[] = [];
  selectedQuizId: string = '';
  selectedUserId: string = '';
  viewMode: 'quiz' | 'user' = 'quiz';

  constructor(
    private analyticsService: AnalyticsService,
    private quizService: QuizService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadUsers();
  }

  loadQuizzes() {
    this.quizService.adminGetAllQuiz().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        if (quizzes.length > 0 && quizzes[0].id) {
          this.selectedQuizId = quizzes[0].id;
          this.loadQuizAnalytics();
        }
      },
      error: (err: any) => console.error('Error loading quizzes:', err)
    });
  }

  loadUsers() {
    this.userService.adminGetAllUsers().subscribe({
      next: (users: UserModel[]) => {
        this.users = users;
      },
      error: (err: any) => console.error('Error loading users:', err)
    });
  }

  loadQuizAnalytics() {
    if (!this.selectedQuizId) return;
    
    this.loading = true;
    this.analyticsService.adminQuizAnalytics(this.selectedQuizId).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading quiz analytics:', err);
        this.loading = false;
      }
    });
  }

  loadUserAnalytics() {
    if (!this.selectedUserId) return;
    
    this.loading = true;
    this.analyticsService.adminUserAnalytics(this.selectedUserId).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user analytics:', err);
        this.loading = false;
      }
    });
  }

  onViewModeChange() {
    this.analyticsData = null;
    if (this.viewMode === 'quiz' && this.selectedQuizId) {
      this.loadQuizAnalytics();
    } else if (this.viewMode === 'user' && this.selectedUserId) {
      this.loadUserAnalytics();
    }
  }

  onQuizChange() {
    this.loadQuizAnalytics();
  }

  onUserChange() {
    this.loadUserAnalytics();
  }

  getScoreDistributionEntries(): [string, number][] {
    if (!this.analyticsData?.scoreDistribution) return [];
    return Object.entries(this.analyticsData.scoreDistribution).sort((a, b) => a[0].localeCompare(b[0]));
  }

  getAttemptsByDayEntries(): [string, number][] {
    if (!this.analyticsData?.attemptsByDay) return [];
    return Object.entries(this.analyticsData.attemptsByDay).sort((a, b) => a[0].localeCompare(b[0]));
  }

  getMaxScoreDistribution(): number {
    if (!this.analyticsData?.scoreDistribution) return 1;
    const values = Object.values(this.analyticsData.scoreDistribution);
    return Math.max(...values, 1);
  }

  getMaxAttemptsByDay(): number {
    if (!this.analyticsData?.attemptsByDay) return 1;
    const values = Object.values(this.analyticsData.attemptsByDay);
    return Math.max(...values, 1);
  }
}
