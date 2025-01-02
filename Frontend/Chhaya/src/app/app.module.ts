import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { DashboardComponent } from './components/homepage/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MissingpersonComponent } from './components/homepage/missingperson/missingperson.component';
import { HttpClientModule } from '@angular/common/http';
import { UnidentifiedPersonComponent } from './components/homepage/unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './components/homepage/unidentified-bodies/unidentified-bodies.component';
import { VolunteersComponent } from './components/homepage/volunteers/volunteers.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { PoliceStationComponent } from './components/homepage/police-station/police-station.component';
import { HospitalsComponent } from './components/homepage/hospitals/hospitals.component'; 
import { SearchpersonAPIService } from './components/homepage/dashboard/searchperson-api.service';
import { MissingpersonapiService } from './components/homepage/missingperson/missingpersonapi.service';
import { UnidentifiedPersonapiService } from './components/homepage/unidentified-person/unidentified-personapi.service';
import { PoliceAPIService } from './components/homepage/police-station/police-api.service';
import { HospitalAPIService } from './components/homepage/hospitals/hospital-api.service';
import { AllcountServiceService } from './services/allcount-service.service';
import { DashboardDemoComponent } from './components/dashboard-demo/dashboard-demo.component';
import { InnerDashboadrdComponent } from './components/inner-dashboadrd/inner-dashboadrd.component';
import { BodiesSearchComponent } from './components/homepage/bodies-search/bodies-search.component';
import { PersonAddingFormComponent } from './components/homepage/person-adding-form/person-adding-form.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    DashboardComponent,
    MissingpersonComponent,
    UnidentifiedPersonComponent,
    UnidentifiedBodiesComponent,
    VolunteersComponent,
    PaginationComponent,
    MainDashboardComponent,
    PoliceStationComponent,
    HospitalsComponent,
    DashboardDemoComponent,
    InnerDashboadrdComponent,
    BodiesSearchComponent,
    PersonAddingFormComponent,
  
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxChartsModule  
    
      
    
  
  ],
  providers: [
    SearchpersonAPIService,
    MissingpersonapiService,
    UnidentifiedPersonapiService,
    UnidentifiedPersonapiService,
    PoliceAPIService,
    HospitalAPIService,
    AllcountServiceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
