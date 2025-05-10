import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { LoginApiService } from '../side-login/login-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-forgot-password',
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrandingComponent,
    CommonModule
  ],
  templateUrl: './side-forgot-password.component.html',
})
export class AppSideForgotPasswordComponent {
  options = this.settings.getOptions();
isLoading = false;
  constructor(private settings: CoreService, private router: Router, private authService:LoginApiService,private snackBar: MatSnackBar) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

 submit() {
  if (this.form.invalid) return;

  this.isLoading = true;
  const email = this.form.value.email!;

  this.authService.forgotPassword(email).subscribe({
    next: (res) => {
      this.snackBar.open(res.message || 'Reset link sent. Check your email.', 'Close', {
        duration: 4000,
        panelClass: ['snackbar-success'],
      });
      this.router.navigate(['/authentication/login']);
    },
    error: (err) => {
      this.snackBar.open(err?.error?.error || 'Something went wrong. Try again.', 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error'],
      });
    },
    complete: () => {
      this.isLoading = false;
    },
  });
}


}
