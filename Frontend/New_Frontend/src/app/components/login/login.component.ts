import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginApiService } from './login-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: LoginApiService, private router: Router) {
    this.loginForm = this.fb.group({
      email_id: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
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
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user_type', response.user_type);
            localStorage.setItem('user_id', response.user_id); 
            
            alert('Login successful! Welcome back.');

            this.loginForm.reset();

            this.router.navigate(['/internal-dashboard']); 
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
                alert('Login failed. Please try again.');
            }
        }
    );
 }


  

}
