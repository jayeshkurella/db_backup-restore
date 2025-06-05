import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardContent, MatCard, MatCardActions } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile-dialog',
  imports: [ ReactiveFormsModule,MatFormFieldModule,CommonModule,MatIcon,MatLabel,MatError,MatInput,MatButtonModule ,MatSpinner,MatDialogActions,MatDialogContent,MatDialogModule ],  
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent implements OnInit {
  editForm: FormGroup;
  currentImage: string;
  selectedFile: File | null = null;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any }
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.currentImage = this.data.user.profile_image_upload || this.data.user.picture;
  }

  initForm(): void {
    this.editForm = this.fb.group({
      first_name: [this.data.user.first_name, Validators.required],
      last_name: [this.data.user.last_name, Validators.required],
      email_id: [this.data.user.email_id, [Validators.required, Validators.email]],
      phone_no: [this.data.user.phone_no],
      profile_image_upload: [null]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
        this.snackBar.open('Only image files are allowed', 'Dismiss', { duration: 3000 });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.snackBar.open('Image size should be less than 2MB', 'Dismiss', { duration: 3000 });
        return;
      }

      this.selectedFile = file;
      this.editForm.patchValue({ profile_image: file });
      
      // Preview the new image
      const reader = new FileReader();
      reader.onload = () => {
        this.currentImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSave(): void {
    if (this.editForm.invalid) return;

    this.isSaving = true;
    const formData = new FormData();
    
    // Append all form values
    Object.keys(this.editForm.value).forEach(key => {
      if (key !== 'profile_image_upload' && this.editForm.value[key] !== null) {
        formData.append(key, this.editForm.value[key]);
      }
    });

    // Append file if selected
    if (this.selectedFile) {
      formData.append('profile_image_upload', this.selectedFile);
    }

    // Close dialog and return the form data
    this.dialogRef.close(formData);
  }
}