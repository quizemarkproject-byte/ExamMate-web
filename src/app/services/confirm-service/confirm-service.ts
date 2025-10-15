import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

export type ConfirmState = ConfirmOptions & { open: boolean };

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private state$ = new BehaviorSubject<ConfirmState>({
    open: false,
    title: 'Confirm',
    message: '',
    confirmText: 'Yes, submit',
    cancelText: 'Cancel',
  });

  private pending?: Subject<boolean>;

  get confirm$(): Observable<ConfirmState> {
    return this.state$.asObservable();
  }

  open(options: ConfirmOptions): Observable<boolean> {
    // Close previous pending if any
    if (this.pending) {
      this.pending.next(false);
      this.pending.complete();
      this.pending = undefined;
    }

    this.pending = new Subject<boolean>();

    const nextState: ConfirmState = {
      open: true,
      title: options.title ?? 'Confirm',
      message: options.message,
      confirmText: options.confirmText ?? 'Yes',
      cancelText: options.cancelText ?? 'Cancel',
    };
    this.state$.next(nextState);

    return this.pending.asObservable();
  }

  confirm() {
    if (this.pending) {
      this.pending.next(true);
      this.pending.complete();
      this.pending = undefined;
    }
    this.close();
  }

  cancel() {
    if (this.pending) {
      this.pending.next(false);
      this.pending.complete();
      this.pending = undefined;
    }
    this.close();
  }

  close() {
    this.state$.next({ ...this.state$.value, open: false });
  }
}

