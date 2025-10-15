import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmService, ConfirmState } from '../../services/confirm-service/confirm-service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModalComponent {
  state: ConfirmState = {
    open: false,
    title: 'Confirm',
    message: '',
    confirmText: 'Yes',
    cancelText: 'Cancel',
  };

  constructor(private confirm: ConfirmService) {}

  ngOnInit() {
    this.confirm.confirm$.subscribe((s) => (this.state = s));
  }

  onConfirm() {
    this.confirm.confirm();
  }

  onCancel() {
    this.confirm.cancel();
  }
}
