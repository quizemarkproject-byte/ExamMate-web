import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { ToastrService } from '../../services/toastr-service/toastr-service';
import { ThemeService } from '../../services/theme-service/theme-service';

interface NavLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, AuthModalComponent],
  templateUrl: './header.html',
})
export class Header {
  isLoggedIn:boolean = false;
  showAuth = false;
  constructor(
    private tokenService: TokenService, 
    private router: Router, 
    private toastr: ToastrService,
    public themeService: ThemeService
  ){}

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
  }

  @Output() toggleSidebar = new EventEmitter<void>();

  login() {
    this.showAuth = true;
  }

  handleAuthClosed() {
    this.showAuth = false;
  }

  handleAuthenticated(token: string) {
    this.tokenService.setAccessToken(token);
    this.isLoggedIn = true;
    this.showAuth = false;
  }

  logout() {
    this.toastr.success('Logged out successfully');
    this.tokenService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/quiz']);
  }
}
