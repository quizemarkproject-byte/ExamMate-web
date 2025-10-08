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

  constructor(private toastrService: ToastrService) {}

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
