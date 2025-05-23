import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MpconsentComponent } from '../../form-layouts/mpconsent/mpconsent.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-ubconsent',
   imports: [MatDialogContent,MatDialogActions,FormsModule,CommonModule,MatCheckbox,
      MatIcon,MatExpansionModule,MatChipsModule ,MatButtonModule,MatListModule
    ],
  templateUrl: './ubconsent.component.html',
  styleUrl: './ubconsent.component.scss'
})
export class UbconsentComponent {
  checked = false;

  constructor(
    public dialogRef: MatDialogRef<UbconsentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  acceptAndContinue() {
    if (this.checked) {
      this.dialogRef.close(true); 
    }
  }
  closeDialog() {
    this.dialogRef.close(false); 
  }

}
