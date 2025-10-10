import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';

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
  isLoggedIn:boolean = false;
  username: string = ''
  mobileMenuOpen = false;

  
  navLinks: NavLink[] = [
    { label: 'Login', url: '/login'},
    { label: 'Signup', url: '/signup'},
  ];

  constructor(private tokenService: TokenService){}

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
    this.username = this.tokenService.getSub();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
