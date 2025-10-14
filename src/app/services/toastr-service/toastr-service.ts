import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastData } from '../../models/shared';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  private toastSubject = new BehaviorSubject<ToastData>({
    message: '',
    type: 'info',
    visible: false,
  });

  toast$ = this.toastSubject.asObservable();

  show(message: string, type: ToastData['type'] = 'info', duration = 5000) {
    this.toastSubject.next({ message, type, visible: true, duration });

    setTimeout(() => {
      this.toastSubject.next({ ...this.toastSubject.value, visible: false });
    }, duration);
  }

   hide() {
    this.toastSubject.next({ ...this.toastSubject.value, visible: false });
  }

  success(msg: string) {
    this.show(msg, 'success');
  }

  error(msg: string) {
    this.show(msg, 'error');
  }

  warning(msg: string) {
    this.show(msg, 'warning');
  }

  info(msg: string) {
    this.show(msg, 'info');
  }
}
