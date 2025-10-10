import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth-service/auth-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';

@Component({
  selector: 'app-verification-page',
  imports: [],
  templateUrl: './verification-page.html',
})
export class VerificationPage {
  message: string = 'Verifying your email...';
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.loading = true;
      this.verifyToken(token);
    } else {
      this.message = 'Invalid verification link.';
    }
  }

  verifyToken(token: string) {
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.message = 'Email verification successfull! You can now log in.';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.message = 'Invalid or expired verification link.';
        this.loading = false;
        console.log(err);
      },
    });
  }
}
