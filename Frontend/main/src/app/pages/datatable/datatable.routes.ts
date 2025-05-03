import { Routes } from '@angular/router';

import { AppKichenSinkComponent } from './kichen-sink/kichen-sink.component';
import { UnidentifiedPersonComponent } from './unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './unidentified-bodies/unidentified-bodies.component';
import { authGuard } from '../authentication/side-login/auth.guard';
import { AccessProviderComponent } from './access-provider/access-provider.component';
import { AdminGuard } from 'src/app/layouts/full/vertical/sidebar/nav-item/admin.guard.guard';
import { UserAccessComponent } from './user-access/user-access.component';
import { ChangelogsComponent } from './changelogs/changelogs.component';
import { ChangelogviewComponent } from './changelogview/changelogview.component';

export const datatablesRoutes: Routes = [
  {
    path: 'change-log',
    component: ChangelogviewComponent,
   
  },
  {
    path: 'add-changelog',
    component: ChangelogsComponent,
   
  },
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
        canActivate: [AdminGuard], 
        data: {
          title: 'datatable',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'datatable' },
          ],
        }, 
      },
      {
        path: 'User-access',
        component: UserAccessComponent,
        canActivate: [AdminGuard], 
      }
    ],
  },
];
