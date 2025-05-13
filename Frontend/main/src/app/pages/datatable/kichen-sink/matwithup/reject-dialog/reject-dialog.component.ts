import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-reject-dialog',
  imports: [MatDialogActions,MatLabel,MatDialogContent,ReactiveFormsModule,MatFormField,CommonModule,FormsModule,MatInput,MatButton],
  templateUrl: './reject-dialog.component.html',
  styleUrl: './reject-dialog.component.scss'
})
export class RejectDialogComponent {
   reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.reason);
  }
}
