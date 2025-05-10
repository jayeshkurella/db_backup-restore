import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreService } from 'src/app/services/core.service';
import { LoginApiService } from '../side-login/login-api.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token: string | null = null;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: CoreService,
    private apiservice: LoginApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      this.showError('Invalid reset link');
      this.router.navigate(['/authentication/login']);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('new_password')?.value;
    const confirmPassword = formGroup.get('confirm_password')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }


 onSubmit() {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const newPassword = this.form.value.new_password;

    this.apiservice.resetPassword(this.token, newPassword).subscribe({
      next: (res) => {
        this.showSuccess(res.message || 'Password reset successfully');
        this.router.navigate(['/authentication/login']);
      },
      error: (err) => {
        this.showError(err?.error?.error || 'Password reset failed. Please try again.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
