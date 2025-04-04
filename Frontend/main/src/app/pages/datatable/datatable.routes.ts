import { Routes } from '@angular/router';

import { AppKichenSinkComponent } from './kichen-sink/kichen-sink.component';
import { UnidentifiedPersonComponent } from './unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './unidentified-bodies/unidentified-bodies.component';
import { authGuard } from '../authentication/side-login/auth.guard';

export const DatatablesRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'kichen-sink',
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
      }
    ],
  },
];
