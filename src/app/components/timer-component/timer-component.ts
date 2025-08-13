import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer-component',
  imports: [CommonModule],
  templateUrl: './timer-component.html'
})
export class TimerComponent {
  @Input() remainingSeconds!: number;

  get hours(): number {
    return Math.floor(this.remainingSeconds / 3600);
  }

  get minutes(): number {
    return Math.floor((this.remainingSeconds % 3600) / 60);
  }

  get seconds(): number {
    return this.remainingSeconds % 60;
  }
}
