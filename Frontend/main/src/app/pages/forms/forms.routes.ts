import { Routes } from '@angular/router';

// Forms
import {
  AppAutocompleteComponent,
  AppButtonComponent,
  AppCheckboxComponent,
  AppDatepickerComponent,
  AppRadioComponent,
} from './form-elements';
import { AppFormHorizontalComponent } from './form-horizontal/form-horizontal.component';
import { AppFormLayoutsComponent } from './form-layouts/form-layouts.component';
import { AppFormVerticalComponent } from './form-vertical/form-vertical.component';
import { AppFormWizardComponent } from './form-wizard/form-wizard.component';
import { AppFormToastrComponent } from './form-toastr/form-toastr.component';
import { authGuard } from '../authentication/side-login/auth.guard';
import { UnidentifiedPersonFormComponent } from './unidentified-person-form/unidentified-person-form.component';
import { UnidentifiedBodyFormComponent } from './unidentified-body-form/unidentified-body-form.component';

export const FormsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'Missing-person-form',
        component: AppFormLayoutsComponent,
      },
      {
        path: 'Unidentified-person-form',
        component: UnidentifiedPersonFormComponent,
        
      },
      {
        path: 'Unidentified-bodies-form',
        component: UnidentifiedBodyFormComponent,
      },
    ],
  },
];
