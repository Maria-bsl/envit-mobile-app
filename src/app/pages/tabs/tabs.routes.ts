import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () => import('./tab2/tab2.page').then((m) => m.Tab2Page),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./tab2/verify-code/verify-code.component').then(
                (c) => c.VerifyCodeComponent
              ),
          },
          {
            path: 'verifyuser',
            loadComponent: () =>
              import('./tab2/verify-user/verify-user.component').then(
                (c) => c.VerifyUserComponent
              ),
          },
        ],
      },
      {
        path: 'tab3',
        loadComponent: () => import('./tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
