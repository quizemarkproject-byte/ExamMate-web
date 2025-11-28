import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { CommonModule } from '@angular/common';
import {QuizService} from '../../services/quiz-service/quiz-service';
import {CountResponse, QuizSessionStartResponse} from '../../models/quiz';

interface NavLink {
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.html',
})
export class SideBar {
  @Input() open: boolean = true;
  @Output() close = new EventEmitter<void>();
  isLoggedIn: boolean = false;
  count: number = 0;

  constructor(private tokenService: TokenService, private router: Router, private quizService: QuizService) {}

  navLinks: NavLink[] = [
    { label: 'Quizzes', url: '/quiz', icon: 'fa-solid fa-book' },
    { label: 'Results', url: '/result', icon: 'fa-solid fa-trophy' },
    { label: 'Analytics', url: '/analytics', icon: 'fa-solid fa-chart-line' },
  ];

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
    this.getResultsCount();
  }

 getResultsCount() {
   this.quizService.getUserResultsCount(this.tokenService.getId()).subscribe({
     next: (data: CountResponse) => {
       this.count = data.count
     },
     error: (err) => {
       console.error(err);
     },
   });
 }

  onClose() {
    this.close.emit();
  }

}
