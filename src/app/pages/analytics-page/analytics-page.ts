import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AnalyticsService } from '../../services/analytics-service/analytics-service';
import { AnalyticsResponse } from '../../models/analytics';
import { QuizService } from '../../services/quiz-service/quiz-service';
import { UserService } from '../../services/user-service/user-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';
import { Quiz } from '../../models/quiz';
import { UserModel } from '../../models/user-service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-analytics-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage implements OnInit, OnDestroy {
  mode: 'quiz' | 'user' = 'quiz';
  inputId: string = '';
  isAdmin: boolean = true; // Toggle this based on user role
  
  quizzes: Quiz[] = [];
  users: UserModel[] = [];
  selectedQuizId: string = '';
  selectedUserId: string = '';
  
  totalAttempts: number = 0;
  avgScore: number = 0;
  medianScore: number = 0;
  hasData: boolean = false;
  isLoading: boolean = false;

  private analyticsService = inject(AnalyticsService);
  private quizService = inject(QuizService);
  private userService = inject(UserService);
  private toastrService = inject(ToastrService);
  private sparkChart?: Chart;
  private attemptsChart?: Chart;
  private distributionChart?: Chart;
  private questionChart?: Chart;

  ngOnInit() {
    // Load quizzes and users
    this.loadQuizzes();
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private loadQuizzes() {
    this.quizService.getQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        console.log('Quizzes loaded:', quizzes);
      },
      error: (error) => console.error('Error loading quizzes:', error)
    });
  }

  private loadUsers() {
    this.userService.adminGetAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users loaded:', users);
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  private destroyCharts() {
    this.sparkChart?.destroy();
    this.attemptsChart?.destroy();
    this.distributionChart?.destroy();
    this.questionChart?.destroy();
  }

  loadData() {
    const id = this.mode === 'quiz' ? this.selectedQuizId : this.selectedUserId;
    
    console.log('loadData called with id:', id, 'mode:', this.mode, 'isAdmin:', this.isAdmin);
    
    if (!id || !id.trim()) {
      this.toastrService.show('Please select a ' + (this.mode === 'quiz' ? 'quiz' : 'user'), 'warning');
      return;
    }

    this.isLoading = true;
    let observable$;
    
    if (this.isAdmin) {
      // Admin can view quiz or user analytics
      observable$ = this.mode === 'quiz'
        ? this.analyticsService.adminQuizAnalytics(id)
        : this.analyticsService.adminUserAnalytics(id);
    } else {
      // Regular users can only view their own analytics
      observable$ = this.analyticsService.userAnalytics(id);
    }

    console.log('Subscribing to observable...');
    
    observable$.subscribe({
      next: (data) => {
        console.log('Analytics data received:', data);
        this.isLoading = false;
        // Use setTimeout to ensure DOM is ready for chart rendering
        setTimeout(() => this.renderAnalytics(data), 0);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.isLoading = false;
        this.toastrService.show('Error loading analytics: ' + error.message, 'error');
      }
    });
    
    console.log('Subscribe called');
  }

  private renderAnalytics(data: AnalyticsResponse) {
    console.log('Rendering analytics with data:', data);
    
    // Check if there's any data
    const hasAttempts = data.totalAttempts > 0;
    const hasTimeSeries = Object.keys(data.attemptsByDay || {}).length > 0;
    const hasDistribution = Object.keys(data.scoreDistribution || {}).length > 0;
    
    this.hasData = hasAttempts || hasTimeSeries || hasDistribution;
    
    if (!this.hasData) {
      console.log('No data available');
      this.updateKpis({ totalAttempts: 0, averageScore: 0, medianScore: 0, scoreDistribution: {}, attemptsByDay: {} });
      this.destroyCharts();
      return;
    }
    
    this.updateKpis(data);
    
    const timeSeries = this.sortedTimeSeries(data.attemptsByDay);
    console.log('Time series:', timeSeries);
    this.renderSparkline(timeSeries.labels, timeSeries.data);
    this.renderAttemptsChart(timeSeries.labels, timeSeries.data);
    
    const distribution = this.ensureBuckets(data.scoreDistribution);
    console.log('Distribution:', distribution);
    this.renderDistributionChart(distribution.labels, distribution.data, data.averageScore, data.medianScore);
  }

  private updateKpis(data: AnalyticsResponse) {
    this.totalAttempts = data.totalAttempts ?? 0;
    this.avgScore = data.averageScore ?? 0;
    this.medianScore = data.medianScore ?? 0;
  }

  private ensureBuckets(map: Record<string, number>) {
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 0; i < 10; i++) {
      const key = `${i * 10}-${(i + 1) * 10}`;
      labels.push(key);
      data.push(map?.[key] ?? 0);
    }
    return { labels, data };
  }

  private sortedTimeSeries(map: Record<string, number>) {
    const entries = Object.entries(map || {});
    if (entries.length === 0) return { labels: [], data: [] };
    
    entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    return {
      labels: entries.map(e => e[0]),
      data: entries.map(e => e[1])
    };
  }

  private renderSparkline(labels: string[], data: number[]) {
    const canvas = document.getElementById('sparkline') as HTMLCanvasElement;
    if (!canvas) return;
    
    this.sparkChart?.destroy();
    
    this.sparkChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: '#4285F4',
          backgroundColor: 'rgba(66,133,244,0.08)',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  private renderAttemptsChart(labels: string[], data: number[]) {
    const canvas = document.getElementById('attemptsChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    this.attemptsChart?.destroy();
    
    this.attemptsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Attempts',
          data,
          borderColor: '#2ca02c',
          backgroundColor: 'rgba(44,160,44,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Attempts by day' }
        },
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Attempts' }, beginAtZero: true }
        }
      }
    });
  }

  private renderDistributionChart(labels: string[], data: number[], avg?: number, median?: number) {
    const canvas = document.getElementById('distributionChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    this.distributionChart?.destroy();
    
    const datasets: any[] = [
      {
        type: 'bar',
        label: 'Attempts',
        data,
        backgroundColor: 'rgba(66,133,244,0.9)'
      }
    ];
    
    if (avg != null) {
      datasets.push({
        type: 'line',
        label: 'Average',
        data: labels.map(() => avg),
        borderColor: '#d9534f',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [6, 4]
      });
    }
    
    if (median != null) {
      datasets.push({
        type: 'line',
        label: 'Median',
        data: labels.map(() => median),
        borderColor: '#f0ad4e',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [2, 4]
      });
    }
    
    this.distributionChart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Score distribution' },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Count' } },
          x: { title: { display: true, text: 'Score range (%)' } }
        }
      }
    });
  }

}
