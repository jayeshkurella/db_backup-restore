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
import { MatwithupComponent } from './kichen-sink/matwithup/matwithup.component';
import { SearchbyIDComponent } from './searchby-id/searchby-id.component';
import { DetaildataComponent } from './detaildata/detaildata.component';

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
        
      },
      { path: 'match-up-result', 
        component: MatwithupComponent 
      },
      {
        path: 'search-by-id',
        component: SearchbyIDComponent,
      },
      {
        path: 'unidentified-person',
        component: UnidentifiedPersonComponent,
      },
      {
        path: 'unidentified-bodies',
        component: UnidentifiedBodiesComponent,
      },
      {
        path: 'admin-access',
        component: AccessProviderComponent,
        canActivate: [AdminGuard], 
      },
      {
        path: 'User-access',
        component: UserAccessComponent,
        canActivate: [AdminGuard], 
      },
      {
        path: 'missing-person/person-view/:id',
        component: DetaildataComponent,
      },
      
    ],
  },
];
