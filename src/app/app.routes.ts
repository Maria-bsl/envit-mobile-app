import { Routes } from '@angular/router';
import {
  loginPageLanguageGuard,
  selectLanguagePageGuard,
} from './core/guards/logged-in-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
    canActivate: [loginPageLanguageGuard],
  },
  {
    path: 'recoverpwd',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent
      ),
  },
  {
    path: 'switch',
    loadComponent: () =>
      import('./pages/switch-event/switch-event.component').then(
        (c) => c.SwitchEventComponent
      ),
  },
  {
    path: 'changepwd',
    loadComponent: () =>
      import('./pages/change-password/change-password.component').then(
        (c) => c.ChangePasswordComponent
      ),
  },
  {
    path: 'qrpage',
    loadComponent: () =>
      import('./pages/qr-code-page/qr-code-page.component').then(
        (c) => c.QrCodePageComponent
      ),
  },
  {
    path: 'registration',
    loadComponent: () =>
      import('./pages/registration-page/registration-page.component').then(
        (c) => c.RegistrationPageComponent
      ),
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash-screen-page/splash-screen-page.component').then(
        (c) => c.SplashScreenPageComponent
      ),
    canActivate: [selectLanguagePageGuard],
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((m) => m.routes),
  },
];
