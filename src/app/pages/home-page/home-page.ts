import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal';
import { TokenService } from '../../services/token-service/token-service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, AuthModalComponent],
  templateUrl: './home-page.html',
})
export class HomePage {
  showAuth = false;
  constructor(private router: Router, private tokenService: TokenService) {}

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
    this.showAuth = false;
    this.router.navigate(['/home']);
  }
}
