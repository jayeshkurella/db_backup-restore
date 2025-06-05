import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var google :any;

@Component({
  selector: 'app-google-user-type-dialog',
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './google-user-type-dialog.component.html',
  styleUrl: './google-user-type-dialog.component.scss'
})
export class GoogleUserTypeDialogComponent {
  userForm: FormGroup;
  showSubType = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GoogleUserTypeDialogComponent>
  ) {
    this.userForm = this.fb.group({
      user_type: ['', Validators.required],
      sub_user_type: ['']
    });

    this.userForm.get('user_type')?.valueChanges.subscribe(value => {
      this.showSubType = value === 'family';
      if (this.showSubType) {
        this.userForm.get('sub_user_type')?.setValidators(Validators.required);
      } else {
        this.userForm.get('sub_user_type')?.clearValidators();
        this.userForm.get('sub_user_type')?.setValue('');
      }
      this.userForm.get('sub_user_type')?.updateValueAndValidity();
    });
  }

  submit() {
    if (this.userForm.valid) {
      const userTypeData = this.userForm.value;
      this.dialogRef.close(userTypeData);
      
      // Immediately trigger Google login after dialog closes
      if (typeof google !== 'undefined') {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Handle cases where prompt isn't shown
            console.warn('Google prompt not displayed');
          }
        });
      }
    }
  }
  

  cancel() {
    this.dialogRef.close(null);
  }

}
