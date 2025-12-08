import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { AuthModalService } from '../../services/auth-modal-service/auth-modal-service';
import { ToastrService } from '../../services/toastr-service/toastr-service';
import { ThemeService } from '../../services/theme-service/theme-service';

interface NavLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
})
export class Header {
  isLoggedIn:boolean = false;
  constructor(
    private tokenService: TokenService, 
    private router: Router, 
    private toastr: ToastrService,
    private authModalService: AuthModalService,
    public themeService: ThemeService
  ){}

  ngOnInit() {
    this.isLoggedIn = this.tokenService.isLoggedIn();
    this.authModalService.authenticated$.subscribe(() => {
      this.isLoggedIn = true;
    });
  }

  @Output() toggleSidebar = new EventEmitter<void>();

  login() {
    this.authModalService.open();
  }

  logout() {
    this.toastr.success('Logged out successfully');
    this.tokenService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/quiz']);
  }
}
