import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, QueryList, ViewChildren, ElementRef } from '@angular/core';
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
  @Output() authenticated = new EventEmitter<string>();

  step: 'email' | 'otp' = 'email';
  emailForm: FormGroup;
  otpForm: FormGroup;
  loading = false;
  emailValue = '';
  readonly otpLength = 6;
  otpDigits: string[] = Array(6).fill('');
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(private fb: FormBuilder, private authService: AuthService, private toastr: ToastrService) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
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
    // Ensure aggregated value is set and valid
    this.otpForm.get('otp')?.setValue(this.otpDigits.join(''));
    if (this.otpForm.invalid) return;
    this.loading = true;
    this.otpForm.disable();
    const req: VerityOtpRequest = { email: this.emailValue, otp: this.otpForm.value.otp };
    this.authService.verifyEmail(req).subscribe({
      next: (resp) => {
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

  // OTP input helpers
  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    if (!value) {
      this.otpDigits[index] = '';
      this.syncOtpValue();
      return;
    }
    // Take only the first digit typed into this box
    this.otpDigits[index] = value[0];
    input.value = value[0];
    // Move focus to next box if exists
    if (index < this.otpLength - 1) {
      this.focusBox(index + 1);
    }
    this.syncOtpValue();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      if (input.value) {
        // Clear current digit
        this.otpDigits[index] = '';
      } else if (index > 0) {
        // Move back and clear previous
        this.focusBox(index - 1);
        const prev = this.otpBoxes.get(index - 1)?.nativeElement;
        if (prev) {
          prev.value = '';
          this.otpDigits[index - 1] = '';
        }
      }
      this.syncOtpValue();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusBox(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < this.otpLength - 1) {
      this.focusBox(index + 1);
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, this.otpLength).split('');
    if (digits.length) {
      event.preventDefault();
      for (let i = 0; i < this.otpLength; i++) {
        this.otpDigits[i] = digits[i] || '';
        const el = this.otpBoxes.get(i)?.nativeElement;
        if (el) el.value = this.otpDigits[i];
      }
      // Focus last filled or last box
      const lastIndex = Math.min(digits.length, this.otpLength) - 1;
      this.focusBox(Math.max(lastIndex, 0));
      this.syncOtpValue();
    }
  }

  private focusBox(index: number) {
    const el = this.otpBoxes.get(index)?.nativeElement;
    if (el) el.focus();
  }

  private syncOtpValue() {
    this.otpForm.get('otp')?.setValue(this.otpDigits.join(''));
    this.otpForm.get('otp')?.updateValueAndValidity({ emitEvent: false });
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
