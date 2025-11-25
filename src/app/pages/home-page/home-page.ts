import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal';
import { TokenService } from '../../services/token-service/token-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, AuthModalComponent],
  templateUrl: './home-page.html',
})
export class HomePage {
  showAuth:boolean = false;
  isLoggedIn:boolean = false;
  constructor(private router: Router, private tokenService: TokenService, private toastr: ToastrService) {}

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.tokenService.isAdmin();
  }

  startQuiz() {
    this.router.navigate(['/quiz']);
  }

  openAuth() {
    this.showAuth = true;
  }

  handleAuthClosed() {
    this.showAuth = false;
  }

  handleAuthenticated(token: string) {
    this.tokenService.setAccessToken(token);
    this.isLoggedIn = true;
    this.showAuth = false;
    this.router.navigate(['/']);
  }

  logout() {
    this.toastr.success('Logged out successfully');
    this.tokenService.logout();
    this.isLoggedIn = false;
    this.showAuth = true;
  }
}
