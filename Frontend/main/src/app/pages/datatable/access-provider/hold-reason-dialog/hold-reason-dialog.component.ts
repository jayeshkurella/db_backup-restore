import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
  standalone: true,  
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButton
  ],
  templateUrl: './hold-reason-dialog.component.html',
  styleUrls: ['./hold-reason-dialog.component.scss']
})
export class HoldReasonDialogComponent {
  status_reason: string = '';

  constructor(public dialogRef: MatDialogRef<HoldReasonDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.status_reason);
  }

}