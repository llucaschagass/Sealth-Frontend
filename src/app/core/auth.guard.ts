import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  if (session.isAuthenticated()) {
    return true;
  }
  session.clear();
  return inject(Router).createUrlTree(['/login']);
};
