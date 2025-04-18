import { Routes } from '@angular/router';

import { AppKichenSinkComponent } from './kichen-sink/kichen-sink.component';
import { UnidentifiedPersonComponent } from './unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './unidentified-bodies/unidentified-bodies.component';
import { authGuard } from '../authentication/side-login/auth.guard';
import { AccessProviderComponent } from './access-provider/access-provider.component';

export const DatatablesRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'missing-person',
        component: AppKichenSinkComponent,
        data: {
          title: 'Datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Datatable' },
          ],
        },
      },
      {
        path: 'unidentified-person',
        component: UnidentifiedPersonComponent,
        data: {
          title: 'Datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Datatable' },
          ],
        },
        
      },
      {
        path: 'unidentified-bodies',
        component: UnidentifiedBodiesComponent,
        data: {
          title: 'Datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Datatable' },
          ],
        }, 
      },
      {
        path: 'admin-access',
        component: AccessProviderComponent,
        data: {
          title: 'Datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Datatable' },
          ],
        }, 
      }
    ],
  },
];
