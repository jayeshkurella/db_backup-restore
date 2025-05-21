import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { LoginApiService } from './login-api.service';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { ToastrService } from 'ngx-toastr';
import { GoogleLoginProvider, SocialAuthService, SocialAuthServiceConfig, SocialUser } from '@abacritt/angularx-social-login';
import { BehaviorSubject } from 'rxjs';
import { GoogleUserTypeDialogComponent } from './google-user-type-dialog/google-user-type-dialog.component';
import { MatDialog } from '@angular/material/dialog';
declare var google: any;

@Component({
  standalone: true,
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent, CommonModule],
  templateUrl: './side-login.component.html',
  styleUrls: ['./side-login.component.scss'],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('175428916411-vjqlrrr7n468lnoa5g92s7rfgr4apijd.apps.googleusercontent.com')
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ]
})
export class AppSideLoginComponent implements AfterViewInit {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isUserLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  savedEmails: string[] = [];
filteredEmails: string[] = [];
  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
  user: SocialUser | null = null;
  loggedIn: boolean = false;

  options = this.settings.getOptions();
  loginForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  isPasswordVisible: boolean = false;
  hidePassword: boolean = true; // Initially hide the password

  constructor(private settings: CoreService, private authService: LoginApiService, private router: Router, private fb: FormBuilder, private toastr: ToastrService, private renderer: Renderer2, private socialAuthService: SocialAuthService, private dialog: MatDialog) {
    this.loginForm = this.fb.group({
      email_id: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
  ngAfterViewInit(): void {
    this.loadGoogleAuthScript();
  }

  loadSavedEmails(): void {
  const emails = localStorage.getItem('savedEmails');
  this.savedEmails = emails ? JSON.parse(emails) : [];
  this.filteredEmails = this.savedEmails;
}

filterEmails(): void {
  const input = this.loginForm.get('email_id')?.value?.toLowerCase() || '';
  this.filteredEmails = this.savedEmails.filter(email =>
    email.toLowerCase().includes(input)
  );
}

saveEmailToLocalStorage(email: string): void {
  const emails = new Set(this.savedEmails);
  emails.add(email);
  const emailArray = Array.from(emails);
  localStorage.setItem('savedEmails', JSON.stringify(emailArray));
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
        this.authService.setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.saveEmailToLocalStorage(this.loginForm.value.email_id);
        this.toastr.success('Login successful! Welcome back.', 'Success');
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
        localStorage.removeItem('redirectAfterLogin');
        this.router.navigate([redirectUrl]);
        this.loginForm.reset();
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




  // google login
  private loadGoogleAuthScript(): void {
    const script = this.renderer.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.renderGoogleButton();
    document.body.appendChild(script);
  }
private renderGoogleButton(): void {
  if (typeof google !== 'undefined') {
    // Disable auto-selection of previously signed-in accounts
    google.accounts.id.disableAutoSelect(); // 👈 Add this line

    google.accounts.id.initialize({
      client_id: '175428916411-vjqlrrr7n468lnoa5g92s7rfgr4apijd.apps.googleusercontent.com',
      callback: this.handleLogin.bind(this),
      prompt: 'select_account',
      auto_select: false
    });

    google.accounts.id.renderButton(document.getElementById('google-login'), {
      theme: 'outline',
      size: 'large',
      text: 'standard',
      locale: 'en',
      width: 250,
    });

    google.accounts.id.prompt(); // Optional, depending on if you want the popup immediately
  } else {
    console.error("Google API script failed to load.");
  }
}

  private decodetoken(token: String) {
    return JSON.parse(atob(token.split('.')[1]));
  }
  // handleLogin(response: any) {
  //   if (response) {
  //     console.log(response);
  //     const token = response.credential;
  //     sessionStorage.setItem('googleToken', token);

  //     this.authService.loginWithGoogle(token).subscribe(
  //       (response: any) => {
  //         // Check if the response contains an error about account approval
  //         if (response.error && response.error.includes('not approved')) {
  //           // Show error message to user
  //           this.toastr.error(response.error);
  //           return;
  //         }
  //         this.authService.setUser(response.user);
  //         localStorage.setItem('user', JSON.stringify(response.user));
  //         // Save token and user data
  //         localStorage.setItem('profilePic', response.user.picture);
  //         localStorage.setItem('authToken', response.token);
  //         localStorage.setItem('user_type', response.user.user_type);
  //         localStorage.setItem('user_id', response.user.id);
  //         // 🔁 Update login status
  //         this.authService.isLoggedInSubject.next(true);

  //         // Navigate to form
  //         this.router.navigate(['/']);
  //       },
  //       (error) => {
  //         console.error('Login failed:', error);
  //         // Show error message to user
  //         if (error.error && error.error.error) {
  //           this.toastr.error(error.error.error);
  //         } else {
  //           this.toastr.error('Login failed. Please try again.');
  //         }
  //       }
  //     );
  //   }
  // }

  handleLogin(response: any) {
  if (response) {
    const token = response.credential;
    sessionStorage.setItem('googleToken', token);

    const decoded: any = this.decodetoken(token);
    const email = decoded?.email;

    this.authService.loginWithGoogle(token).subscribe(
      (response: any) => {
        if (response.error && response.error.includes('not approved')) {
          this.toastr.error(response.error);
          return;
        }

        this.authService.setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('profilePic', response.user.picture);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user_type', response.user.user_type);
        localStorage.setItem('user_id', response.user.id);
        this.authService.isLoggedInSubject.next(true);

        // ✅ Clean up Google login UI
        const googleButton = document.getElementById('google-login');
        if (googleButton) googleButton.innerHTML = '';

        // ✅ Revoke the Google session to prevent auto-selection next time
        if (typeof google !== 'undefined' && email) {
          google.accounts.id.revoke(email, () => {
            console.log(`Google session revoked for ${email}`);
          });
        }

        // ✅ Navigate to main app
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Login failed:', error);
        if (error.error?.error) {
          this.toastr.error(error.error.error);
        } else {
          this.toastr.error('Login failed. Please try again.');
        }
      }
    );
  }
}





}
