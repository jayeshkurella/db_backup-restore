import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { InternalDashboardComponent } from './components/internal-dashboard/internal-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'Main-dashboard', pathMatch: 'full' },
  {path :"Main-dashboard", component:MainDashboardComponent},
  {path: 'internal-dashboard', component: InternalDashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
