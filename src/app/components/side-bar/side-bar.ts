import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';

interface NavLink {
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule],
  templateUrl: './side-bar.html',
})
export class SideBar {
  constructor(private tokenService: TokenService, private router: Router) {}

  navLinks: NavLink[] = [
    { label: 'Home', url: '/home', icon: '/assets/svg/home.svg' },
    { label: 'Quizzes', url: '/quiz', icon: '/assets/svg/quiz.svg' },
    { label: 'Results', url: '/result', icon: '/assets/svg/result.svg' },
  ];

  logout() {
    this.tokenService.logout();
    this.router.navigate(['/login']);
  }
}
