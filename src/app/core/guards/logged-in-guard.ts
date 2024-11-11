import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppUtilities } from '../utils/AppUtilities';

export const verifyLoggedInGuard: CanActivateFn = (route, state) => {
  let userId = localStorage.getItem(AppUtilities.TOKEN_user);
  return userId ? inject(Router).createUrlTree(['/tabs/dashboard']) : true;
};
