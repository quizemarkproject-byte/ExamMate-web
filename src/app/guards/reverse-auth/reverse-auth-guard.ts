import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../services/token-service/token-service';
import { inject } from '@angular/core';

export const reverseAuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
