import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm-service/confirm-service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModalComponent {
  private confirm = inject(ConfirmService);

  // expose the observable so template can use async pipe
  state$ = this.confirm.confirm$;

  confirmAction() {
    this.confirm.confirm();
  }

  cancelAction() {
    this.confirm.cancel();
  }
}
