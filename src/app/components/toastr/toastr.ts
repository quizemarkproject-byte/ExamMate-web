import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ToastrService } from '../../services/toastr-service/toastr-service';

@Component({
  selector: 'app-toastr',
  imports: [CommonModule],
  templateUrl: './toastr.html',
})
export class Toastr {
  @Input() message!: string;
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() visible = false;
  @Input() duration?: number;

  constructor(private toastrService: ToastrService) {}

  get bgClass(): string {
    switch (this.type) {
      case 'success':
        return 'bg-emerald-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-blue-600';
    }
  }

  get toastDuration(): number {
    return this.duration ?? 5000;
  }

  get icon() {
    switch (this.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }

  closeToast() {
    this.toastrService.hide();
  }
}
