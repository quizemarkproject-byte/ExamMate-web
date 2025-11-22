import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Question } from '../../models/quiz';

export type EditQuestionState = {
  open: boolean;
  question?: Question | null;
};

@Injectable({ providedIn: 'root' })
export class EditQuestionService {
  private state$ = new BehaviorSubject<EditQuestionState>({ open: false, question: null });
  private pending?: Subject<Question | null>;

  get edit$(): Observable<EditQuestionState> {
    return this.state$.asObservable();
  }

  open(question?: Question): Observable<Question | null> {
    // cancel previous pending
    if (this.pending) {
      this.pending.next(null);
      this.pending.complete();
      this.pending = undefined;
    }

    this.pending = new Subject<Question | null>();
    this.state$.next({ open: true, question: question ? { ...(question as any) } : null });
    return this.pending.asObservable();
  }

  confirm(updated: Question | null) {
    if (this.pending) {
      this.pending.next(updated);
      this.pending.complete();
      this.pending = undefined;
    }
    this.close();
  }

  cancel() {
    if (this.pending) {
      this.pending.next(null);
      this.pending.complete();
      this.pending = undefined;
    }
    this.close();
  }

  close() {
    this.state$.next({ ...this.state$.value, open: false });
  }
}
