import { Routes } from '@angular/router';

// widgets
import { PoliceStationComponent } from './police-station/police-station.component';
import { HospitalsComponent } from './hospitals/hospitals.component';
import { authGuard } from '../authentication/side-login/auth.guard';
import { AddPoliceStationComponent } from './police-station/add-police-station/add-police-station.component';
import { AddHospitalsComponent } from './hospitals/add-hospitals/add-hospitals.component';
import { HospitalDetailComponentComponent } from './HospitalDetailComponent/HospitalDetailComponent.component';
import { PoliceStationDetailsComponent } from './police-station/police-station-details/police-station-details.component';
import { VolunteersdataComponent } from './volunteers/volunteersdata/volunteersdata.component';
import { VolunteersComponent } from './volunteers/volunteers.component';

export const WidgetsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'police-station',
        component: PoliceStationComponent,
        
      },
      {
        path: 'add-police-station',
        component: AddPoliceStationComponent,
        canActivate : [authGuard],
      },
      {
        path: 'hospitals',
        component: HospitalsComponent,
      },
      {
        path: 'add-hospitals',
        component:AddHospitalsComponent,
        canActivate : [authGuard],
      },
      {
        path: 'hospital/:id',
        component: HospitalDetailComponentComponent
      },
      {
        path: 'police-station-detail/:id',
        component: PoliceStationDetailsComponent
      },
      {
        path: 'volunteers',
        component: VolunteersComponent,
      },
      { path: 'volunteersdata/:id',
        component: VolunteersdataComponent 
      },
    ],
  },
];
