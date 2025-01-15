import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { DashboardComponent } from './components/homepage/dashboard/dashboard.component';
import { MissingpersonComponent } from './components/homepage/missingperson/missingperson.component';
import { UnidentifiedPersonComponent } from './components/homepage/unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './components/homepage/unidentified-bodies/unidentified-bodies.component';
import { VolunteersComponent } from './components/homepage/volunteers/volunteers.component';
import { PoliceStationComponent } from './components/homepage/police-station/police-station.component';
import { HospitalsComponent } from './components/homepage/hospitals/hospitals.component';
import { DashboardDemoComponent } from './components/dashboard-demo/dashboard-demo.component';
import { BodiesSearchComponent } from './components/homepage/bodies-search/bodies-search.component';
import { PersonAddingFormComponent } from './components/homepage/person-adding-form/person-adding-form.component';
import { UnidentifiedPersonFormComponent } from './components/homepage/unidentified-person-form/unidentified-person-form.component';
import { UnidentifiedbodyFormComponent } from './components/homepage/unidentifiedbody-form/unidentifiedbody-form.component';



const routes: Routes = [
  { path: '', redirectTo: 'Main-dashboard', pathMatch: 'full' },
  {path :"Main-dashboard", component:DashboardDemoComponent},
  { path: 'homepage', component: HomepageComponent,
     children: [
   
    { path: '', component: PersonAddingFormComponent },
    { path: 'Add-missing-person', component: PersonAddingFormComponent },
    { path: 'add-unidentified-person', component: UnidentifiedPersonFormComponent},
    { path: 'add-unidentified-body', component: UnidentifiedbodyFormComponent},
    { path: 'missingperson-search', component: DashboardComponent },
    { path: 'bodies-search', component: BodiesSearchComponent },
    { path: 'missingperson', component: MissingpersonComponent},
    { path: 'unidentified-person', component: UnidentifiedPersonComponent},
    { path: 'unidentified-bodies', component: UnidentifiedBodiesComponent},
    { path: 'volunteers', component: VolunteersComponent},
    { path: 'policestation', component: PoliceStationComponent},
    { path: 'Hospitals', component: HospitalsComponent},
    
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
