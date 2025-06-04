import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatDialogContent,CommonModule,ReactiveFormsModule,MatLabel,MatFormFieldModule,MatDialogActions,MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      note: ['']
    });

    if (data.showNote && data.requiredNote) {
      this.form.get('note')?.setValidators([Validators.required]);
    }
  }
}
