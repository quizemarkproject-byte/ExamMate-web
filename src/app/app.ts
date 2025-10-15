import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toastr } from './components/toastr/toastr';
import { ToastrService } from './services/toastr-service/toastr-service';
import { ToastData } from './models/shared';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toastr, ConfirmModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'ExamMate';
  toast: ToastData = { message: '', type: 'info', visible: false };

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.toastr.toast$.subscribe((t) => (this.toast = t));
  }
}
