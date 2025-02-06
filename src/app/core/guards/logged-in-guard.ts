import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppUtilities } from '../utils/AppUtilities';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';

// export const verifyLoggedInGuard: CanActivateFn = (route, state) => {
//   const appConfig = inject(AppConfigService);
//   const userId = appConfig.getItemFromSessionStorage(AppUtilities.TOKEN_user);
//   return userId ? inject(Router).createUrlTree(['/tabs/dashboard']) : true;
// };

export const loginPageLanguageGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const appConfig = inject(AppConfigService);
  const urlTree = (path: string[]) => router.createUrlTree(path);
  const currentLang = appConfig.getItemFromSessionStorage(
    AppUtilities.CURRENT_LANG
  );
  return !currentLang ? urlTree(['/splash']) : true;
};

export const selectLanguagePageGuard: CanActivateFn = (routes, state) => {
  const router: Router = inject(Router);
  const appConfig = inject(AppConfigService);
  const urlTree = (path: string[]) => router.createUrlTree(path);
  const currentLang = appConfig.getItemFromSessionStorage(
    AppUtilities.CURRENT_LANG
  );
  return currentLang ? urlTree(['/login']) : true;
};
