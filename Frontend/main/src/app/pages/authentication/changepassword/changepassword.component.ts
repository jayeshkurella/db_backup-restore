import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginApiService } from '../side-login/login-api.service';
import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router'; // make sure this is imported
import { MatSnackBar } from '@angular/material/snack-bar'; // Import
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-changepassword',
  imports: [ReactiveFormsModule,CommonModule,MatFormField,MatLabel,MatError,MatInputModule,MatSpinner,MatIcon,MatProgressBar,MatCard,MatCardHeader,MatCardTitle,MatCardSubtitle,MatCardContent,MatCardActions,RouterModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangepasswordComponent { 
 passwordForm: FormGroup;
  isSubmitting = false;
  hideOldPassword = true;
  hideNewPassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: LoginApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  getPasswordStrength(): number {
    const password = this.passwordForm.get('new_password')?.value;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 40;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'warn';
    if (strength < 80) return 'accent';
    return 'primary';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Good';
    return 'Strong';
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.showSnackbar(res.message || 'Password updated successfully', 'success');
        setTimeout(() => this.router.navigate(['authentication/login']));
         this.passwordForm.reset();
      },
      error: (err) => {
        this.showSnackbar(
          err.error?.error || 'Failed to update password. Please try again.', 
          'error'
        );
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}