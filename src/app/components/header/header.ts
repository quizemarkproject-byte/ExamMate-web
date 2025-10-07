import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html'
})
export class Header {

  navLinks: NavLink[] = [
    { label: 'Login', url: '/login'},
    { label: 'Signup', url: '/signup'},
  ];
}
