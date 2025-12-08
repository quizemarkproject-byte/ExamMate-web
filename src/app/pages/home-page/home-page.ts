import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthModalService } from '../../services/auth-modal-service/auth-modal-service';
import { TokenService } from '../../services/token-service/token-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-page.html',
})
export class HomePage {
  isLoggedIn:boolean = false;
  constructor(
    private router: Router, 
    private tokenService: TokenService, 
    private toastr: ToastrService,
    private authModalService: AuthModalService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
    this.authModalService.authenticated$.subscribe(() => {
      this.isLoggedIn = true;
      this.router.navigate(['/']);
    });
  }

  get isAdmin(): boolean {
    return this.tokenService.isAdmin();
  }

  startQuiz() {
    this.router.navigate(['/quiz']);
  }

  openAuth() {
    this.authModalService.open();
  }

  logout() {
    this.toastr.success('Logged out successfully');
    this.tokenService.logout();
    this.isLoggedIn = false;
    this.authModalService.open();
  }
}
