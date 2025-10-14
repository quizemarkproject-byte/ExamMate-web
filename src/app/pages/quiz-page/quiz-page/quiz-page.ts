import { Component, HostListener, OnInit } from '@angular/core';
import { Header } from "../../../components/header/header";
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../../../components/side-bar/side-bar';

@Component({
  selector: 'app-quiz-page',
  standalone: true,
  imports: [Header, SideBar, RouterOutlet],
  templateUrl: './quiz-page.html'
})
export class QuizPage implements OnInit {
  sidebarOpen = false;
  readonly MOBILE_BREAKPOINT = 1024;

  ngOnInit(): void {
    this.sidebarOpen = window.innerWidth >= this.MOBILE_BREAKPOINT;
  }

  @HostListener('window:resize')
  onResize() {
    this.sidebarOpen = window.innerWidth >= this.MOBILE_BREAKPOINT;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

}
