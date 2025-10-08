import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupRequest } from '../../models/auth';
import { AuthService } from '../../services/auth-service/auth-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignupPage {
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get f() { return this.signupForm.controls; }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) return;
    this.loading = true;
    this.error = null;
    const signupRequest: SignupRequest = this.signupForm.value;
    this.authService.signup(signupRequest).subscribe({
      next: () => {
        this.toastr.success('Signup successful! Verification email sent.');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error.error || 'Signup failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
