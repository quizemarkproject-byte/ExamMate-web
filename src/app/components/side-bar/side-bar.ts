import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.html',
})
export class SideBar {
  @Input() open: boolean = true;
  @Output() close = new EventEmitter<void>();
  isLoggedIn: boolean = false;

  constructor(private tokenService: TokenService, private router: Router) {}

  navLinks: NavLink[] = [
    { label: 'Quizzes', url: '/quiz', icon: 'fa-solid fa-book' },
    { label: 'Results', url: '/result', icon: 'fa-solid fa-trophy' },
  ];

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
  }

  // @HostListener('window:resize')
  // onResize() {
  //   this.checkScreenSize();
  // }

  // private checkScreenSize() {
  //   const width = window.innerWidth;
  //   this.isSidebarOpen = width >= this.MOBILE_BREAKPOINT;
  // }

  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }

  onClose() {
    this.close.emit();
  }

  // logout() {
  //   this.tokenService.logout();
  //   this.router.navigate(['/login']);
  // }
}
