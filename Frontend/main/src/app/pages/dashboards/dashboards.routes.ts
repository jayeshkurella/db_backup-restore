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
          title: 'Analytical',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Analytical' },
          ],
        },
      },
       {
        path: 'home',
        component: AppDashboard1Component,
        
  
      },
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
