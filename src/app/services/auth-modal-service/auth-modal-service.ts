import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type AuthModalState = {
  open: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private state$ = new BehaviorSubject<AuthModalState>({
    open: false,
  });

  private authResult$ = new Subject<string>();

  get modal$(): Observable<AuthModalState> {
    return this.state$.asObservable();
  }

  get authenticated$(): Observable<string> {
    return this.authResult$.asObservable();
  }

  open(): void {
    this.state$.next({ open: true });
  }

  close(): void {
    this.state$.next({ open: false });
  }

  notifyAuthenticated(token: string): void {
    this.authResult$.next(token);
    this.close();
  }
}
