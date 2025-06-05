import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
  standalone:true,
  selector: 'app-suspend-reason-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButton
  ],
  templateUrl: './suspend-reason-dialog.component.html',
  styleUrl: './suspend-reason-dialog.component.scss'
})
export class SuspendReasonDialogComponent {
  status_reason: string = '';

  constructor(public dialogRef: MatDialogRef<SuspendReasonDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.status_reason);
  }

}
