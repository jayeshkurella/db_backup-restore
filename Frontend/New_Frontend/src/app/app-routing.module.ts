import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { InternalDashboardComponent } from './components/internal-dashboard/internal-dashboard.component';
import { PersonAddingFormComponent } from './components/internal-dashboard/person-adding-form/person-adding-form.component';
import { HospitalsComponent } from './components/internal-dashboard/hospitals/hospitals.component';
import { PoliceStationsComponent } from './components/internal-dashboard/police-stations/police-stations.component';
import { VolunteersComponent } from './components/internal-dashboard/volunteers/volunteers.component';
import { UnidentifiedBodiesApiService } from './components/internal-dashboard/unidentified-bodies/unidentified-bodies-api.service';
import { UnidentifiedPersonComponent } from './components/internal-dashboard/unidentified-person/unidentified-person.component';
import { MissingPersonComponent } from './components/internal-dashboard/missing-person/missing-person.component';
import { UnidentifiedBodiesComponent } from './components/internal-dashboard/unidentified-bodies/unidentified-bodies.component';

const routes: Routes = [
  { path: '', redirectTo: 'Main-dashboard', pathMatch: 'full' },
  {path :"Main-dashboard", component:MainDashboardComponent},
  {path: 'internal-dashboard', component: InternalDashboardComponent,
    children: [
      { path: '', component: PersonAddingFormComponent },
      { path: 'Add-missing-person', component: PersonAddingFormComponent },
      { path: 'missingperson', component: MissingPersonComponent},
      { path: 'unidentified-person', component: UnidentifiedPersonComponent},
      { path: 'unidentified-bodies', component: UnidentifiedBodiesComponent},
      { path: 'volunteers', component: VolunteersComponent},
      { path: 'policestation', component: PoliceStationsComponent},
      { path: 'Hospitals', component: HospitalsComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
