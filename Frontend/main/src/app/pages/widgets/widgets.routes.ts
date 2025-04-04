import { Routes } from '@angular/router';

// widgets
import { AppBannersComponent } from './banners/banners.component';
import { AppCardsComponent } from './cards/cards.component';
import { AppChartsComponent } from './charts/charts.component';
import { PoliceStationComponent } from './police-station/police-station.component';
import { HospitalsComponent } from './hospitals/hospitals.component';

export const WidgetsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'banners',
        component: AppBannersComponent,
        data: {
          title: 'Banners',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Banners' },
          ],
        },
      },
      {
        path: 'cards',
        component: AppCardsComponent,
        data: {
          title: 'Cards',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Cards' },
          ],
        },
      },
      {
        path: 'charts',
        component: AppChartsComponent,
        data: {
          title: 'Charts',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Charts' },
          ],
        },
      },
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
    ],
  },
];
