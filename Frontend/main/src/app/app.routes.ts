import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { PersonDetailsComponent } from './components/dashboard1/revenue-updates/person-details/person-details.component';
import { AppDashboard1Component } from './pages/dashboards/dashboard1/dashboard1.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        component: AppDashboard1Component,
      }, {
        path: 'home',
        component: AppDashboard1Component,
        data: {
          title: 'Dashboard',
          urls: [
            { title: 'Home', url: '/' },
            { title: 'Dashboard', url: '/home' }
          ]
        }
      },
      {
        path: 'starter',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'dashboards',
        loadChildren: () =>
          import('./pages/dashboards/dashboards.routes').then(
            (m) => m.DashboardsRoutes
          ),
      },

      {
        path: 'forms',
        loadChildren: () =>
          import('./pages/forms/forms.routes').then((m) => m.FormsRoutes),
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./pages/charts/charts.routes').then((m) => m.ChartsRoutes),
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('./pages/apps/apps.routes').then((m) => m.AppsRoutes),
      },
      {
        path: 'resources',
        loadChildren: () =>
          import('./pages/widgets/widgets.routes').then((m) => m.WidgetsRoutes),
      },
      {
        path: 'tables',
        loadChildren: () =>
          import('./pages/tables/tables.routes').then((m) => m.TablesRoutes),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('./pages/datatable/datatable.routes').then(
            (m) => m.datatablesRoutes
          ),
      },
      {
        path: 'theme-pages',
        loadChildren: () =>
          import('./pages/theme-pages/theme-pages.routes').then(
            (m) => m.ThemePagesRoutes
          ),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'person/:id',
        component: PersonDetailsComponent
      },
      {
        path: 'person-details',
        component: PersonDetailsComponent
      },

    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
      {
        path: 'landingpage',
        loadChildren: () =>
          import('./pages/theme-pages/landingpage/landingpage.routes').then(
            (m) => m.LandingPageRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
