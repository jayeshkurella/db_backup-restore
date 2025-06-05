import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';  // Fixed import
import { LoginApiService } from '../side-login/login-api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatTabLabel } from '@angular/material/tabs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileDialogComponent } from './edit-profile-dialog/edit-profile-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-editprofile',
  standalone: true, 
  imports: [ ReactiveFormsModule,MatFormFieldModule,CommonModule,MatCardContent,MatDivider,MatIcon ,MatCard,MatCardActions,MatButton,RouterLink],  
  templateUrl: './editprofile.component.html',
  styleUrl: './editprofile.component.scss'
})
export class EditprofileComponent implements OnInit {
  profileForm: FormGroup;
  profileImage: string | ArrayBuffer | null = null;
  user: any;

  constructor(
    private fb: FormBuilder,
    private userService: LoginApiService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email_id: ['', [Validators.required, Validators.email]],
      phone_no: ['', [Validators.required, Validators.minLength(10)]],
      profile_image: [null]  // Changed to null
    });
  }

loadUserProfile(): void {
  const userId = this.userService.getLoggedInUserId();
  console.log('User ID:', userId); 
  
  if (!userId) {
    console.error('User ID not found in localStorage');
    // Handle unauthorized case
    this.router.navigate(['/login']);
    return;
  }

  this.userService.getUserProfile(userId).subscribe({
    next: (response) => {
      // Handle both { user: {...} } and direct user object responses
      const userData = response.user || response;
      
      if (!userData) {
        throw new Error('Invalid user data received');
      }

      this.user = userData;
      this.profileForm.patchValue({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email_id: userData.email_id,
        phone_no: userData.phone_no
      });
      
      this.profileImage = userData.profile_image 
        ? this.sanitizeImageUrl(userData.profile_image) 
        : '/assets/images/default-avatar.png';
    },
    error: (err) => {
      console.error('Failed to load profile', err);
    }
  });
}

// Helper method for safe image URLs
private sanitizeImageUrl(url: string): string {
  // Implement your sanitization logic here
  return url;
}



  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Basic validation
      if (!file.type.match('image.*')) {
        alert('Only images are allowed');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
        this.profileForm.patchValue({ profile_image: file });
      };
      reader.readAsDataURL(file);
    }
  }
editProfile(): void {
  const dialogRef = this.dialog.open(EditProfileDialogComponent, {
    width: '600px',
    disableClose: true,
    data: { user: this.user }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.updateProfile(result);
    }
  });
}

private updateProfile(formData: FormData): void {
  this.userService.editProfile(this.user.id, formData).subscribe({
    next: (response) => {
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      this.loadUserProfile(); // Refresh the profile data
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      this.snackBar.open('Failed to update profile', 'Dismiss', { duration: 5000 });
    }
  });
}
}