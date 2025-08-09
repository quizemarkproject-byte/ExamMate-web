import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer-component',
  imports: [CommonModule],
  templateUrl: './timer-component.html',
  styleUrl: './timer-component.css',
})
export class TimerComponent {
  @Input() remainingSeconds!: number;
  
  get minutes(): number {
    return Math.floor(this.remainingSeconds / 60);
  }

  get seconds(): number {
    return this.remainingSeconds % 60;
  }
}
