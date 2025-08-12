import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuOpen = false;

  navLinks: NavLink[] = [
    { label: 'Home', url: '/' },
    { label: 'Quiz', url: '/quiz' },
    { label: 'Result', url: '/quiz/results' },
  ];

  constructor(private eRef: ElementRef) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.menuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
