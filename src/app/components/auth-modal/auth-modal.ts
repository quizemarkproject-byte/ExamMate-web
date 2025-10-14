import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';
import { EmailRequest, VerityOtpRequest } from '../../models/auth';
import { TokenService } from '../../services/token-service/token-service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.html'
})
export class AuthModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() authenticated = new EventEmitter<string>(); // emit token

  step: 'email' | 'otp' = 'email';
  emailForm: FormGroup;
  otpForm: FormGroup;
  loading = false;
  emailValue = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private toastr: ToastrService, private tokenService: TokenService) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]]
    });
    // Disable OTP form until an OTP is requested
    this.otpForm.disable();
  }

  submitEmail() {
    if (this.emailForm.invalid) return;
    this.loading = true;
    this.emailForm.disable();
    const req: EmailRequest = { email: this.emailForm.value.email };
    this.authService.login(req).subscribe({
      next: () => {
        this.emailValue = req.email;
        this.step = 'otp';
        this.toastr.success('OTP sent to email');
        this.loading = false;
        this.otpForm.enable();
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Failed to send OTP');
        this.loading = false;
        this.emailForm.enable();
      }
    });
  }

  submitOtp() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    this.otpForm.disable();
    const req: VerityOtpRequest = { email: this.emailValue, otp: this.otpForm.value.otp };
    this.authService.verifyEmail(req).subscribe({
      next: (resp) => {
        this.tokenService.setAccessToken(resp.token);
        this.toastr.success('Login successful');
        this.authenticated.emit(resp.token);
        this.close();
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Invalid OTP');
        this.loading = false;
        this.otpForm.enable();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  resendOtp() {
    if (!this.emailValue) return;
    this.loading = true;
    const req: EmailRequest = { email: this.emailValue };
    this.authService.login(req).subscribe({
      next: () => {
        this.toastr.info('OTP resent');
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Failed to resend OTP');
        this.loading = false;
      }
    });
  }

  backToEmail() {
    this.step = 'email';
    this.emailForm.enable();
    this.otpForm.disable();
  }

  close() {
    this.open = false;
    this.step = 'email';
    this.emailForm.reset();
    this.otpForm.reset();
    this.loading = false;
    this.emailForm.enable();
    this.otpForm.disable();
    this.closed.emit();
  }
}
