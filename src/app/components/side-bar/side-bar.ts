import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavLink {
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule],
  templateUrl: './side-bar.html'
})
export class SideBar {
  navLinks: NavLink[] = [
    { label: 'Home', url: '/home', icon: '/assets/svg/home.svg' },
    { label: 'Quizzes', url: '/quiz', icon: '/assets/svg/quiz.svg' },
    { label: 'Results', url: '/result', icon: '/assets/svg/result.svg' },
  ];
}
