import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { AppUtilities } from '../utils/AppUtilities';

export const canActivateLogin: CanActivateFn = (route, state) => {
  const appConfig = inject(AppConfigService);
  return appConfig.getItemFromSessionStorage(AppUtilities.TOKEN_user)
    ? inject(Router).createUrlTree(['/tabs/dashboard'])
    : true;
};
