import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatLabel, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-unreject-dialog',
  imports: [MatDialogActions,MatLabel,MatDialogContent,ReactiveFormsModule,MatFormField,CommonModule,FormsModule,MatInput,MatButton],
  templateUrl: './unreject-dialog.component.html',
  styleUrl: './unreject-dialog.component.scss'
})
export class UnrejectDialogComponent {
  unrejectReason: string;

  constructor(
    public dialogRef: MatDialogRef<UnrejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { match_id: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.unrejectReason);
  }

}
