import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { CommonModule } from '@angular/common';

interface NavLink {
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.html',
})
export class SideBar {
  isSidebarOpen = true;
  isLoggedIn: boolean = false;
  readonly MOBILE_BREAKPOINT = 1024;

  constructor(private tokenService: TokenService, private router: Router) {}

  navLinks: NavLink[] = [
    { label: 'Home', url: '/home', icon: '/assets/svg/home.svg' },
    { label: 'Quizzes', url: '/quiz', icon: '/assets/svg/quiz.svg' },
    { label: 'Results', url: '/result', icon: '/assets/svg/result.svg' },
  ];

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();

    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isSidebarOpen = width >= this.MOBILE_BREAKPOINT;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.tokenService.logout();
    this.router.navigate(['/login']);
  }
}
