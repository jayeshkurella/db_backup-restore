import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { LoginApiService } from './login-api.service';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-side-login',
    imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent,CommonModule],
    templateUrl: './side-login.component.html'
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();
  loginForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  isPasswordVisible: boolean = false;
  hidePassword: boolean = true; // Initially hide the password

  constructor(private settings: CoreService,private authService: LoginApiService, private router: Router,private fb: FormBuilder,private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      email_id: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
   }

  

  get f() {
    return this.loginForm.controls;
  }

  submit() {
    this.submitted = true;
    console.log('Form Submitted:', this.loginForm.value);

    if (this.loginForm.invalid) {
        console.log('Invalid Form:', this.loginForm.errors);
        alert('Please enter a valid email and password.');
        return;
    }

    this.authService.login(this.loginForm.value).subscribe(
        (response) => {
            console.log('Login Successful:', response);
            this.toastr.success('Login successful! Welcome back.', 'Success');
            this.loginForm.reset();
     // Redirect to intended route (if any), else default
     const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/dashboards/dashboard2';
     localStorage.removeItem('redirectAfterLogin');

     this.router.navigate([redirectUrl]);
  },
  (error) => {
      console.error('Login Failed:', error);

      if (error.error?.error) {
          let errorMessage = error.error.error;

          if (errorMessage.includes("No account found")) {
              alert('No account found with this email. Please check or register.');
          } else if (errorMessage.includes("Incorrect password")) {
              alert('Incorrect password. Please try again.');
          } else if (errorMessage.includes("not approved yet")) {
              alert('Your account is not approved yet. Please wait for admin approval.');
          } else {
              alert(errorMessage);
          }
      } else {
        this.showError();
      }
  }
);
}

showError() {
  this.toastr.error('This is not good!', 'Oops!');
}

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.isPasswordVisible = !this.isPasswordVisible;
      const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
      const toggleIcon = document.getElementById('togglePasswordIcon') as HTMLElement;

      if (this.isPasswordVisible) {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('bi-eye', 'bi-eye-slash');
      } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('bi-eye-slash', 'bi-eye');
      }
    } 
  }
}
