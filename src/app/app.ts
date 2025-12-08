import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toastr } from './components/toastr/toastr';
import { ToastrService } from './services/toastr-service/toastr-service';
import { ToastData } from './models/shared';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';
import { AuthModalComponent } from './components/auth-modal/auth-modal';
import { AuthModalService } from './services/auth-modal-service/auth-modal-service';
import { TokenService } from './services/token-service/token-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toastr, ConfirmModalComponent, AuthModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'ExamMate';
  toast: ToastData = { message: '', type: 'info', visible: false };
  showAuth = false;

  constructor(
    private toastr: ToastrService,
    private authModalService: AuthModalService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.toastr.toast$.subscribe((t) => (this.toast = t));
    this.authModalService.modal$.subscribe((state) => (this.showAuth = state.open));
    this.authModalService.authenticated$.subscribe((token) => {
      this.tokenService.setAccessToken(token);
    });
  }

  handleAuthClosed() {
    this.authModalService.close();
  }

  handleAuthenticated(token: string) {
    this.authModalService.notifyAuthenticated(token);
  }
}
