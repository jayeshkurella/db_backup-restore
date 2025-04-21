import { Routes } from '@angular/router';

// widgets
import { AppBannersComponent } from './banners/banners.component';
import { AppCardsComponent } from './cards/cards.component';
import { AppChartsComponent } from './charts/charts.component';
import { PoliceStationComponent } from './police-station/police-station.component';
import { HospitalsComponent } from './hospitals/hospitals.component';
import { authGuard } from '../authentication/side-login/auth.guard';
import { AddPoliceStationComponent } from './police-station/add-police-station/add-police-station.component';
import { AddHospitalsComponent } from './hospitals/add-hospitals/add-hospitals.component';
import { HospitalDetailComponentComponent } from './HospitalDetailComponent/HospitalDetailComponent.component';

export const WidgetsRoutes: Routes = [
  {
    path: '',
    canActivate : [authGuard],
    children: [
      
      {
        path: 'police-station',
        component: PoliceStationComponent,
        data: {
          title: 'Charts',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Charts' },
          ],
        },
      },
      {
        path: 'add-police-station',
        component: AddPoliceStationComponent,
      },
      {
        path: 'hospitals',
        component: HospitalsComponent,
        data: {
          title: 'Charts',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Charts' },
          ],
        },
      },
      {
        path: 'add-hospitals',
        component:AddHospitalsComponent,
      },
      {
        path: 'hospital/:id',
        component: HospitalDetailComponentComponent
      }
    ],
  },
];
