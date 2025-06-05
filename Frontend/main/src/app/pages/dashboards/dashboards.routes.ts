import { Routes } from '@angular/router';

// dashboards
import { AppDashboard1Component } from './dashboard1/dashboard1.component';
import { AppDashboard2Component } from './dashboard2/dashboard2.component';
import { authGuard } from '../authentication/side-login/auth.guard';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AppDashboard1Component,
        data: {
          title: 'home',
          urls: [
            { title: 'Dashboard', url: '/home' },
            { title: 'Dashboard' },
          ],
        },
      },
      {
        path: 'home',
        component: AppDashboard1Component,
        data: {
          title: 'Dashboard',
          urls: [
            { title: 'Home', url: '/' },
            { title: 'Dashboard', url: '/home' }
          ]
        }
      }
      ,
      {
        path: 'dashboard2',
        component: AppDashboard2Component,
        canActivate: [authGuard],
        data: {
          title: 'eCommerce',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard2' },
            { title: 'eCommerce' },
          ],
        },
      }

    ],
  },
];
