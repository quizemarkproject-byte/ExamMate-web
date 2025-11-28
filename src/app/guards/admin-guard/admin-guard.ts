import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // First check if user is logged in
  if (!tokenService.isLoggedIn()) {
    return router.createUrlTree(['/home']);
  }

  // Then check if user has admin role
  if (tokenService.isAdmin()) {
    return true;
  }

  // If logged in but not admin, redirect to quiz page
  return router.createUrlTree(['/quiz']);
};
