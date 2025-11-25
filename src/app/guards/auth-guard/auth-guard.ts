import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isLoggedIn()) {
    return true;
  }

  // Redirect to home/login page if not authenticated
  return router.createUrlTree(['/home']);
};
