import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { InternalDashboardComponent } from './components/internal-dashboard/internal-dashboard.component';
import { PaginationComponent } from './components/pagination/pagination.component';


@NgModule({
  declarations: [
    AppComponent,
    MainDashboardComponent,
    InternalDashboardComponent,
    PaginationComponent
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
