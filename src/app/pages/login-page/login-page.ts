import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth-service';
import { TokenService } from '../../services/token-service/token-service';
import { EmailRequest } from '../../models/auth';
import { ToastrService } from '../../services/toastr-service/toastr-service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginPage {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = null;
    const emailRequest: EmailRequest = this.loginForm.value;
    this.authService.login(emailRequest).subscribe({
      next: () => {
        // this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err.error.error);
        this.error = err.error.error || 'Login failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
