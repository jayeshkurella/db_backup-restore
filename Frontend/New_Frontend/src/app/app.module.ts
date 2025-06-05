import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { InternalDashboardComponent } from './components/internal-dashboard/internal-dashboard.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PersonAddingFormComponent } from './components/internal-dashboard/person-adding-form/person-adding-form.component';
import { MissingPersonComponent } from './components/internal-dashboard/missing-person/missing-person.component';
import { UnidentifiedPersonComponent } from './components/internal-dashboard/unidentified-person/unidentified-person.component';
import { UnidentifiedBodiesComponent } from './components/internal-dashboard/unidentified-bodies/unidentified-bodies.component';
import { VolunteersComponent } from './components/internal-dashboard/volunteers/volunteers.component';
import { PoliceStationsComponent } from './components/internal-dashboard/police-stations/police-stations.component';
import { HospitalsComponent } from './components/internal-dashboard/hospitals/hospitals.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './interceptors/auth.service';
import { UserAccessComponentComponent } from './components/internal-dashboard/user-access-component/user-access-component.component';


@NgModule({
  declarations: [
    AppComponent,
    MainDashboardComponent,
    InternalDashboardComponent,
    PaginationComponent,
    PersonAddingFormComponent,
    MissingPersonComponent,
    UnidentifiedPersonComponent,
    UnidentifiedBodiesComponent,
    VolunteersComponent,
    PoliceStationsComponent,
    HospitalsComponent,
    RegisterComponent,
    LoginComponent,
    UserAccessComponentComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
