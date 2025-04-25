import { Routes } from '@angular/router';

import { AppKichenSinkComponent } from './kichen-sink/kichen-sink.component';
import { UnidentifiedPersonComponent } from './unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './unidentified-bodies/unidentified-bodies.component';
import { authGuard } from '../authentication/side-login/auth.guard';
import { AccessProviderComponent } from './access-provider/access-provider.component';

export const datatablesRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'missing-person',
        component: AppKichenSinkComponent,
        data: {
          title: 'datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'datatable' },
          ],
        },
      },
      {
        path: 'unidentified-person',
        component: UnidentifiedPersonComponent,
        data: {
          title: 'datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'datatable' },
          ],
        },
        
      },
      {
        path: 'unidentified-bodies',
        component: UnidentifiedBodiesComponent,
        data: {
          title: 'datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'datatable' },
          ],
        }, 
      },
      {
        path: 'admin-access',
        component: AccessProviderComponent,
        data: {
          title: 'datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'datatable' },
          ],
        }, 
      }
    ],
  },
];
